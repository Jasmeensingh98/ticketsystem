import io
import csv
from datetime import datetime
from flask import Blueprint, jsonify, request, Response
from app.models import User, SupportTeam, KnowledgeArticle, RoutingRule, SLAPolicy, Ticket
from app import db

admin_bp = Blueprint('admin_bp', __name__)

SAMPLE_DATASET_ROWS = [
    {"ticket_id": "TCK-1001", "title": "VPN gateway unresponsive for Munich branch", "description": "Users cannot establish IPSec tunnels. RADIUS authentication timeouts.", "category": "Network", "priority": "High", "affected_users": 45, "business_impact": "High", "downtime": "Partial", "security_impact": 1},
    {"ticket_id": "TCK-1002", "title": "Executive laptop power brick blown out", "description": "USB-C charger sparked and burned out during boardroom presentation.", "category": "Hardware", "priority": "Critical", "affected_users": 1, "business_impact": "Critical", "downtime": "Total Outage", "security_impact": 0},
    {"ticket_id": "TCK-1003", "title": "Outlook search indexing broken after Windows update", "description": "Search tab returns zero results for all archived emails in OST file.", "category": "Software", "priority": "Medium", "affected_users": 12, "business_impact": "Low", "downtime": "None", "security_impact": 0},
    {"ticket_id": "TCK-1004", "title": "Domain controller account locked after brute force alerts", "description": "Multiple invalid Kerberos requests caused service account lockout.", "category": "Access Management", "priority": "Critical", "affected_users": 120, "business_impact": "Critical", "downtime": "Partial", "security_impact": 1},
    {"ticket_id": "TCK-1005", "title": "Core access switch port flapping on floor 4", "description": "Ethernet switches fluctuating between 1Gbps and disconnect state.", "category": "Network", "priority": "High", "affected_users": 30, "business_impact": "High", "downtime": "Partial", "security_impact": 0},
    {"ticket_id": "TCK-1006", "title": "Request dual monitor mount for accounting desk", "description": "Ergonomics adjustment for new hires in financial auditing team.", "category": "Other", "priority": "Low", "affected_users": 2, "business_impact": "Low", "downtime": "None", "security_impact": 0},
    {"ticket_id": "TCK-1007", "title": "Photoshop CC crashing on GPU acceleration check", "description": "Display driver failure reported when launching Adobe Creative Suite.", "category": "Software", "priority": "Low", "affected_users": 1, "business_impact": "Low", "downtime": "None", "security_impact": 0},
    {"ticket_id": "TCK-1008", "title": "Salesforce SSO SAML certificate expired", "description": "All sales representatives unable to authenticate to CRM application.", "category": "Access Management", "priority": "Critical", "affected_users": 85, "business_impact": "Critical", "downtime": "Total Outage", "security_impact": 1},
    {"ticket_id": "TCK-1009", "title": "Color laser printer paper pickup roller worn", "description": "Repeated tray 2 jams requiring manual intervention every 10 pages.", "category": "Hardware", "priority": "Low", "affected_users": 15, "business_impact": "Low", "downtime": "None", "security_impact": 0},
    {"ticket_id": "TCK-1010", "title": "Wi-Fi credential renewal failure on iOS devices", "description": "WPA3 Enterprise profile expired on corporate managed mobile devices.", "category": "Network", "priority": "Medium", "affected_users": 18, "business_impact": "Medium", "downtime": "None", "security_impact": 0},
]


# Users Management
@admin_bp.route('/users', methods=['GET'])
def list_users():
    users = User.query.order_by(User.created_at.asc()).all()
    return jsonify({'users': [user.to_dict() for user in users]}), 200


@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    if 'role' in data:
        user.role = data['role']
    if 'department' in data:
        user.department = data['department']
    if 'name' in data:
        user.name = data['name']
    db.session.commit()
    return jsonify({'message': 'User updated', 'user': user.to_dict()}), 200


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': f'User {user.name} removed successfully'}), 200


# Support Teams Management
@admin_bp.route('/teams', methods=['GET'])
def list_teams():
    teams = SupportTeam.query.all()
    team_list = []
    for t in teams:
        ticket_count = Ticket.query.filter_by(assigned_team_id=t.id).count()
        team_dict = t.to_dict()
        team_dict['active_tickets'] = ticket_count
        team_list.append(team_dict)
    return jsonify({'teams': team_list}), 200


@admin_bp.route('/teams', methods=['POST'])
def create_team():
    data = request.get_json() or {}
    name = data.get('name')
    if not name:
        return jsonify({'error': 'Team name is required'}), 400
    slug = data.get('slug') or name.lower().replace(' ', '-')
    team = SupportTeam(
        name=name,
        slug=slug,
        description=data.get('description', ''),
        lead_agent=data.get('lead_agent', 'Support Lead')
    )
    db.session.add(team)
    db.session.commit()
    return jsonify({'message': 'Team created', 'team': team.to_dict()}), 201


# Knowledge Base Creation
@admin_bp.route('/knowledge-base', methods=['POST'])
def add_article():
    data = request.get_json() or {}
    title = data.get('title')
    if not title:
        return jsonify({'error': 'Article title is required'}), 400
    article = KnowledgeArticle(
        title=title,
        category=data.get('category', 'Other'),
        keywords=data.get('keywords', ''),
        problem=data.get('problem', ''),
        solution=data.get('solution', ''),
        related_tickets=data.get('related_tickets', '')
    )
    db.session.add(article)
    db.session.commit()
    return jsonify({'message': 'Article created successfully', 'article': article.to_dict()}), 201


# Routing Rules Management
@admin_bp.route('/routing-rules', methods=['GET'])
def list_rules():
    rules = RoutingRule.query.order_by(RoutingRule.created_at.asc()).all()
    return jsonify({'rules': [r.to_dict() for r in rules]}), 200


@admin_bp.route('/routing-rules', methods=['POST'])
def create_rule():
    data = request.get_json() or {}
    category = data.get('category')
    priority = data.get('priority')
    team = data.get('team')
    if not category or not priority or not team:
        return jsonify({'error': 'category, priority, and team are required'}), 400

    rule = RoutingRule(
        category=category,
        priority=priority,
        team=team,
        agent_name=data.get('agent_name'),
        condition=data.get('condition', f"Category={category} AND Priority={priority}")
    )
    db.session.add(rule)
    db.session.commit()
    return jsonify({'message': 'Routing rule created', 'rule': rule.to_dict()}), 201


@admin_bp.route('/routing-rules/<int:rule_id>', methods=['DELETE'])
def delete_rule(rule_id):
    rule = RoutingRule.query.get_or_404(rule_id)
    db.session.delete(rule)
    db.session.commit()
    return jsonify({'message': 'Routing rule deleted'}), 200


# SLA Policies
@admin_bp.route('/sla-policies', methods=['GET'])
def list_sla_policies():
    policies = SLAPolicy.query.all()
    return jsonify({'policies': [p.to_dict() for p in policies]}), 200


# Dataset Management
EXPECTED_COLUMNS = ['ticket_id', 'title', 'description', 'category', 'priority', 'affected_users', 'business_impact', 'downtime', 'security_impact']


@admin_bp.route('/dataset/preview', methods=['GET'])
def dataset_preview():
    category_counts = {}
    priority_counts = {}
    missing_count = 0

    for row in SAMPLE_DATASET_ROWS:
        cat = row.get('category', 'Other')
        prio = row.get('priority', 'Medium')
        category_counts[cat] = category_counts.get(cat, 0) + 1
        priority_counts[prio] = priority_counts.get(prio, 0) + 1
        for col in EXPECTED_COLUMNS:
            if row.get(col) is None or str(row.get(col)).strip() == '':
                missing_count += 1

    return jsonify({
        'expected_columns': EXPECTED_COLUMNS,
        'validated': True,
        'total_rows': len(SAMPLE_DATASET_ROWS),
        'missing_values': missing_count,
        'category_distribution': [{'name': k, 'count': v} for k, v in category_counts.items()],
        'priority_distribution': [{'name': k, 'count': v} for k, v in priority_counts.items()],
        'rows': SAMPLE_DATASET_ROWS
    }), 200


@admin_bp.route('/dataset/upload', methods=['POST'])
def upload_dataset():
    # Support either raw JSON or CSV text
    csv_text = ''
    if 'file' in request.files:
        f = request.files['file']
        csv_text = f.read().decode('utf-8', errors='ignore')
    elif request.is_json:
        csv_text = request.get_json().get('csv_data', '')
    else:
        csv_text = request.data.decode('utf-8', errors='ignore')

    if not csv_text.strip():
        return jsonify({'error': 'No CSV content provided'}), 400

    reader = csv.DictReader(io.StringIO(csv_text.strip()))
    fieldnames = reader.fieldnames or []

    # Column validation
    present_cols = [c.strip().lower() for c in fieldnames]
    missing_cols = [c for c in EXPECTED_COLUMNS if c not in present_cols]

    rows = []
    category_counts = {}
    priority_counts = {}
    missing_values = 0

    for r in reader:
        # Normalize keys to lowercase
        norm_r = {k.strip().lower(): v.strip() for k, v in r.items() if k}
        rows.append(norm_r)
        cat = norm_r.get('category', 'Other')
        prio = norm_r.get('priority', 'Medium')
        category_counts[cat] = category_counts.get(cat, 0) + 1
        priority_counts[prio] = priority_counts.get(prio, 0) + 1

        for c in EXPECTED_COLUMNS:
            if not norm_r.get(c):
                missing_values += 1

    return jsonify({
        'message': 'Dataset analyzed successfully',
        'expected_columns': EXPECTED_COLUMNS,
        'detected_columns': fieldnames,
        'validated': len(missing_cols) == 0,
        'missing_columns': missing_cols,
        'total_rows': len(rows),
        'missing_values': missing_values,
        'category_distribution': [{'name': k, 'count': v} for k, v in category_counts.items()],
        'priority_distribution': [{'name': k, 'count': v} for k, v in priority_counts.items()],
        'preview_rows': rows[:15]
    }), 200


@admin_bp.route('/dataset/download', methods=['GET'])
def download_dataset():
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=EXPECTED_COLUMNS)
    writer.writeheader()
    for row in SAMPLE_DATASET_ROWS:
        writer.writerow(row)

    csv_data = output.getvalue()
    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=helpdesk_research_dataset.csv"}
    )
