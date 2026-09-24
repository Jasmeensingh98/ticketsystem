from datetime import datetime, timedelta
import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from app import db
from app.models import Ticket, Comment, SupportTeam, TicketHistory, KnowledgeArticle, TicketPrediction, Notification, User, Attachment
from app.services.ml_service import MLService
from app.services.routing_service import RoutingService
from app.services.knowledge_service import KnowledgeService
from app.services.notification_service import NotificationService
from app.services.analytics_service import AnalyticsService

ticket_bp = Blueprint('ticket_bp', __name__)
ml_service = MLService()
routing_service = RoutingService()
knowledge_service = KnowledgeService()
notification_service = NotificationService()
analytics_service = AnalyticsService()


@ticket_bp.route('/tickets', methods=['POST'])
def create_ticket():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    if not title or not description:
        return jsonify({'error': 'Title and description are required'}), 400

    created_by = data.get('email') or data.get('user_name') or 'guest@example.com'

    # SLA deadlines by priority: Critical (4h), High (8h), Medium (24h), Low (48h)
    sla_hours = {'Critical': 4, 'High': 8, 'Medium': 24, 'Low': 48}

    ticket = Ticket(
        title=title,
        description=description,
        created_by=created_by,
        department=data.get('department', 'General'),
        device=data.get('device'),
        location=data.get('location'),
        additional_info=data.get('additional_information') or data.get('additional_info'),
        email=data.get('email', created_by),
        affected_users=int(data.get('affected_users') or 1),
        business_impact=data.get('business_impact', 'Low'),
        downtime=data.get('downtime', 'None'),
        status='AI Processing'
    )
    db.session.add(ticket)
    db.session.commit()

    # 1. Run AI analysis
    analysis = ml_service.analyze_ticket({
        'title': ticket.title,
        'description': ticket.description,
        'affected_users': ticket.affected_users,
        'business_impact': ticket.business_impact,
        'downtime': ticket.downtime,
    })

    # Optional manual category override
    manual_category = data.get('category')
    chosen_category = manual_category if manual_category and manual_category.strip() else analysis['category']

    ticket.predicted_category = analysis['category']
    ticket.category = chosen_category
    ticket.category_confidence = analysis['category_confidence']
    ticket.priority = analysis['priority']
    ticket.priority_confidence = analysis['priority_confidence']
    ticket.ai_analysis = json.dumps(analysis)
    ticket.sla_deadline = datetime.utcnow() + timedelta(hours=sla_hours.get(ticket.priority, 24))

    # 2. Smart Routing
    routing = routing_service.route_ticket(ticket.category, ticket.priority)
    ticket.assigned_team_id = routing.get('team_id')
    ticket.assigned_agent_id = routing.get('agent_id')
    ticket.routing_reason = routing.get('routing_reason')
    ticket.status = 'Assigned'

    # 3. Knowledge Base Search
    suggestions = knowledge_service.search(ticket.title, ticket.description, ticket.category)
    ticket.resolution_suggestions = json.dumps(suggestions)

    # 4. Record Prediction
    prediction = TicketPrediction(
        ticket_id=ticket.id,
        category=ticket.predicted_category,
        category_confidence=ticket.category_confidence,
        priority=ticket.priority,
        priority_confidence=ticket.priority_confidence,
        model_name=analysis.get('model_name', 'DistilBERT / XGBoost'),
        model_version=analysis.get('model_version', 'demo-v1.0')
    )
    db.session.add(prediction)

    # 5. Record History
    h1 = TicketHistory(ticket_id=ticket.id, action='Ticket Created', new_value='Created', performed_by=ticket.created_by)
    h2 = TicketHistory(ticket_id=ticket.id, action='AI Triage Completed', new_value=f"{ticket.category} [{ticket.priority}]", performed_by='AI Engine')
    h3 = TicketHistory(ticket_id=ticket.id, action='Routed to Team', new_value=routing.get('team'), performed_by='Routing Engine')
    db.session.add_all([h1, h2, h3])
    db.session.commit()

    # 6. Notifications
    notification_service.send_ticket_created(ticket.email, ticket)
    if routing.get('agent'):
        notification_service.send_ticket_assigned(ticket.email, ticket, routing.get('agent'))

    return jsonify({
        'ticket': ticket.to_dict(),
        'analysis': analysis,
        'routing': routing,
        'suggestions': suggestions,
        'message': 'AI analysis and intelligent routing complete.'
    }), 201


@ticket_bp.route('/tickets', methods=['GET'])
def list_tickets():
    query = Ticket.query

    status = request.args.get('status')
    if status and status.lower() != 'all':
        query = query.filter(Ticket.status.ilike(status))

    priority = request.args.get('priority')
    if priority and priority.lower() != 'all':
        query = query.filter(Ticket.priority.ilike(priority))

    category = request.args.get('category')
    if category and category.lower() != 'all':
        query = query.filter(Ticket.category.ilike(category))

    search = request.args.get('search')
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Ticket.title.ilike(search_filter)) |
            (Ticket.description.ilike(search_filter)) |
            (Ticket.created_by.ilike(search_filter))
        )

    assigned_agent_id = request.args.get('agent_id')
    if assigned_agent_id:
        query = query.filter(Ticket.assigned_agent_id == int(assigned_agent_id))

    tickets = query.order_by(Ticket.created_at.desc()).all()
    return jsonify({'tickets': [t.to_dict() for t in tickets], 'total': len(tickets)}), 200


@ticket_bp.route('/tickets/<int:ticket_id>', methods=['GET'])
def get_ticket(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    comments = Comment.query.filter_by(ticket_id=ticket_id).order_by(Comment.created_at.asc()).all()
    history = TicketHistory.query.filter_by(ticket_id=ticket_id).order_by(TicketHistory.timestamp.asc()).all()
    predictions = TicketPrediction.query.filter_by(ticket_id=ticket_id).order_by(TicketPrediction.created_at.desc()).all()

    # Parse JSON suggestions if available
    suggestions = []
    if ticket.resolution_suggestions:
        try:
            suggestions = json.loads(ticket.resolution_suggestions)
        except Exception:
            suggestions = []

    ai_analysis_dict = {}
    if ticket.ai_analysis:
        try:
            ai_analysis_dict = json.loads(ticket.ai_analysis)
        except Exception:
            ai_analysis_dict = {}

    team = SupportTeam.query.get(ticket.assigned_team_id) if ticket.assigned_team_id else None
    agent = User.query.get(ticket.assigned_agent_id) if ticket.assigned_agent_id else None

    return jsonify({
        'ticket': ticket.to_dict(),
        'team_name': team.name if team else 'General IT Support',
        'agent_name': agent.name if agent else 'Unassigned',
        'comments': [c.to_dict() for c in comments],
        'history': [h.to_dict() for h in history],
        'predictions': [p.to_dict() for p in predictions],
        'suggestions': suggestions,
        'ai_analysis': ai_analysis_dict
    }), 200


@ticket_bp.route('/tickets/<int:ticket_id>', methods=['PUT'])
def update_ticket(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    data = request.get_json() or {}

    old_status = ticket.status
    old_priority = ticket.priority
    old_team_id = ticket.assigned_team_id
    old_agent_id = ticket.assigned_agent_id

    performed_by = data.get('performed_by', 'Support Agent')

    if 'status' in data and data['status'] != old_status:
        ticket.status = data['status']
        if ticket.status in ['Resolved', 'Closed'] and not ticket.resolved_at:
            ticket.resolved_at = datetime.utcnow()
            notification_service.send_ticket_resolved(ticket.email, ticket)
        elif ticket.status in ['Open', 'In Progress'] and old_status in ['Resolved', 'Closed']:
            ticket.resolved_at = None
        db.session.add(TicketHistory(
            ticket_id=ticket.id,
            action='Status Changed',
            old_value=old_status,
            new_value=ticket.status,
            performed_by=performed_by
        ))

    if 'priority' in data and data['priority'] != old_priority:
        ticket.priority = data['priority']
        db.session.add(TicketHistory(
            ticket_id=ticket.id,
            action='Priority Changed',
            old_value=old_priority,
            new_value=ticket.priority,
            performed_by=performed_by
        ))
        notification_service.send_priority_changed(ticket.email, ticket, old_priority, ticket.priority)

    if 'assigned_team_id' in data and data['assigned_team_id'] != old_team_id:
        ticket.assigned_team_id = data['assigned_team_id']
        team = SupportTeam.query.get(ticket.assigned_team_id)
        team_name = team.name if team else str(ticket.assigned_team_id)
        db.session.add(TicketHistory(
            ticket_id=ticket.id,
            action='Team Reassigned',
            old_value=str(old_team_id),
            new_value=team_name,
            performed_by=performed_by
        ))

    if 'assigned_agent_id' in data and data['assigned_agent_id'] != old_agent_id:
        ticket.assigned_agent_id = data['assigned_agent_id']
        agent = User.query.get(ticket.assigned_agent_id)
        agent_name = agent.name if agent else 'Unassigned'
        db.session.add(TicketHistory(
            ticket_id=ticket.id,
            action='Agent Assigned',
            old_value=str(old_agent_id),
            new_value=agent_name,
            performed_by=performed_by
        ))
        notification_service.send_ticket_assigned(ticket.email, ticket, agent_name)

    for field in ['title', 'description', 'category', 'department']:
        if field in data:
            setattr(ticket, field, data[field])

    ticket.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({'message': 'Ticket updated successfully', 'ticket': ticket.to_dict()}), 200


@ticket_bp.route('/tickets/<int:ticket_id>', methods=['DELETE'])
def delete_ticket(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    db.session.delete(ticket)
    db.session.commit()
    return jsonify({'message': f'Ticket #{ticket_id} deleted successfully'}), 200


@ticket_bp.route('/tickets/<int:ticket_id>/route', methods=['POST'])
def route_ticket(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    routing = routing_service.route_ticket(ticket.category or ticket.predicted_category or 'Other', ticket.priority or 'Medium')

    ticket.assigned_team_id = routing.get('team_id')
    ticket.assigned_agent_id = routing.get('agent_id')
    ticket.routing_reason = routing.get('routing_reason')
    ticket.status = 'Assigned'

    db.session.add(TicketHistory(
        ticket_id=ticket.id,
        action='Automated Routing Re-evaluated',
        new_value=f"{routing.get('team')} ({routing.get('agent')})",
        performed_by='Smart Routing Engine'
    ))
    db.session.commit()

    return jsonify({
        'team': routing.get('team'),
        'agent': routing.get('agent'),
        'routing_reason': routing.get('routing_reason'),
        'ticket': ticket.to_dict()
    }), 200


@ticket_bp.route('/tickets/<int:ticket_id>/comments', methods=['POST'])
def add_comment(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    data = request.get_json() or {}
    content = data.get('content', '').strip()
    if not content:
        return jsonify({'error': 'Comment content cannot be empty'}), 400

    author_name = data.get('author_name') or data.get('user_name') or 'Support Specialist'
    user_id = data.get('user_id')

    comment = Comment(
        ticket_id=ticket.id,
        user_id=user_id,
        author_name=author_name,
        content=content
    )
    db.session.add(comment)

    db.session.add(TicketHistory(
        ticket_id=ticket.id,
        action='Comment Added',
        new_value=content[:60] + ('...' if len(content) > 60 else ''),
        performed_by=author_name
    ))

    db.session.commit()
    return jsonify({'message': 'Comment added', 'comment': comment.to_dict()}), 201


@ticket_bp.route('/tickets/<int:ticket_id>/comments', methods=['GET'])
def list_comments(ticket_id):
    comments = Comment.query.filter_by(ticket_id=ticket_id).order_by(Comment.created_at.asc()).all()
    return jsonify({'comments': [c.to_dict() for c in comments]}), 200


@ticket_bp.route('/knowledge-base', methods=['GET'])
def list_knowledge_base():
    category = request.args.get('category')
    search = request.args.get('search')

    query = KnowledgeArticle.query
    if category and category.lower() != 'all':
        query = query.filter(KnowledgeArticle.category.ilike(category))

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (KnowledgeArticle.title.ilike(search_filter)) |
            (KnowledgeArticle.keywords.ilike(search_filter)) |
            (KnowledgeArticle.problem.ilike(search_filter)) |
            (KnowledgeArticle.solution.ilike(search_filter))
        )

    articles = query.order_by(KnowledgeArticle.created_at.desc()).all()
    return jsonify({'articles': [article.to_dict() for article in articles], 'total': len(articles)}), 200


@ticket_bp.route('/knowledge-base/<int:article_id>', methods=['GET'])
def get_knowledge_article(article_id):
    article = KnowledgeArticle.query.get_or_404(article_id)
    return jsonify({'article': article.to_dict()}), 200


@ticket_bp.route('/knowledge-base/<int:article_id>', methods=['PUT'])
def update_knowledge_article(article_id):
    article = KnowledgeArticle.query.get_or_404(article_id)
    data = request.get_json() or {}
    for key in ['title', 'category', 'keywords', 'problem', 'solution', 'related_tickets']:
        if key in data:
            setattr(article, key, data[key])
    article.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': 'Article updated', 'article': article.to_dict()}), 200


@ticket_bp.route('/knowledge-base/<int:article_id>', methods=['DELETE'])
def delete_knowledge_article(article_id):
    article = KnowledgeArticle.query.get_or_404(article_id)
    db.session.delete(article)
    db.session.commit()
    return jsonify({'message': 'Article deleted successfully'}), 200


@ticket_bp.route('/notifications', methods=['GET'])
def list_notifications():
    notifications = Notification.query.order_by(Notification.created_at.desc()).limit(50).all()
    return jsonify({'notifications': [n.to_dict() for n in notifications]}), 200


@ticket_bp.route('/notifications/<int:notif_id>/read', methods=['PUT'])
def mark_notification_read(notif_id):
    notif = Notification.query.get_or_404(notif_id)
    notif.read = True
    db.session.commit()
    return jsonify({'message': 'Notification marked as read', 'notification': notif.to_dict()}), 200


@ticket_bp.route('/notifications/clear', methods=['POST'])
def clear_notifications():
    Notification.query.update({Notification.read: True})
    db.session.commit()
    return jsonify({'message': 'All notifications marked as read'}), 200


# Analytics Routes
@ticket_bp.route('/analytics/overview', methods=['GET'])
def analytics_overview():
    return jsonify(analytics_service.overview()), 200


@ticket_bp.route('/analytics/categories', methods=['GET'])
def analytics_categories():
    return jsonify(analytics_service.categories()), 200


@ticket_bp.route('/analytics/priorities', methods=['GET'])
def analytics_priorities():
    return jsonify(analytics_service.priorities()), 200


@ticket_bp.route('/analytics/statuses', methods=['GET'])
def analytics_statuses():
    return jsonify(analytics_service.statuses()), 200


@ticket_bp.route('/analytics/team-workload', methods=['GET'])
def analytics_team_workload():
    return jsonify(analytics_service.team_workload()), 200


@ticket_bp.route('/analytics/sla', methods=['GET'])
def analytics_sla():
    return jsonify(analytics_service.sla()), 200


@ticket_bp.route('/analytics/confidence', methods=['GET'])
def analytics_confidence():
    return jsonify(analytics_service.confidence_distribution()), 200
