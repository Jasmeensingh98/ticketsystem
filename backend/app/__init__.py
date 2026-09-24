import os
from datetime import datetime, timedelta
import json
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

from .config import get_config

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

db = SQLAlchemy()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)
    app.config.update(get_config())

    CORS(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)
    jwt.init_app(app)

    from .routes.auth_routes import auth_bp
    from .routes.ticket_routes import ticket_bp
    from .routes.ai_routes import ai_bp
    from .routes.admin_routes import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(ticket_bp, url_prefix='/api')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(admin_bp, url_prefix='/api')

    @app.route('/api/health')
    def health():
        return jsonify({
            "status": "ok",
            "service": "AI-Powered Helpdesk API",
            "timestamp": datetime.utcnow().isoformat(),
            "demo_mode": os.getenv('DEMO_MODE', 'true').lower() == 'true'
        })

    @app.route('/api/docs')
    def api_docs():
        return jsonify({
            "title": "AI-Powered Helpdesk Ticket Prioritization and Routing API",
            "version": "1.0.0",
            "description": "REST API for AI-based ticket classification, XGBoost priority prediction, smart routing, knowledge base, SLA tracking, and analytics.",
            "base_url": "/api",
            "endpoints": [
                {"method": "POST", "path": "/api/auth/register", "description": "Register user", "auth": False},
                {"method": "POST", "path": "/api/auth/login", "description": "Login user and retrieve JWT", "auth": False},
                {"method": "GET", "path": "/api/auth/me", "description": "Get current authenticated profile", "auth": True},
                {"method": "POST", "path": "/api/tickets", "description": "Submit ticket and trigger AI triage & routing", "auth": False},
                {"method": "GET", "path": "/api/tickets", "description": "List all tickets with filters", "auth": False},
                {"method": "GET", "path": "/api/tickets/<id>", "description": "Get ticket details, history, comments, and AI explanation", "auth": False},
                {"method": "PUT", "path": "/api/tickets/<id>", "description": "Update ticket status, priority, or assignment", "auth": False},
                {"method": "DELETE", "path": "/api/tickets/<id>", "description": "Delete ticket", "auth": False},
                {"method": "POST", "path": "/api/tickets/<id>/route", "description": "Trigger smart routing engine", "auth": False},
                {"method": "POST", "path": "/api/tickets/<id>/comments", "description": "Add ticket comment", "auth": False},
                {"method": "POST", "path": "/api/ai/classify", "description": "Predict category via DistilBERT/BERT", "auth": False},
                {"method": "POST", "path": "/api/ai/predict-priority", "description": "Predict priority via XGBoost", "auth": False},
                {"method": "POST", "path": "/api/ai/analyze-ticket", "description": "End-to-end AI analysis with urgency indicators", "auth": False},
                {"method": "GET", "path": "/api/ai/model-evaluation", "description": "Academic benchmark performance metrics & confusion matrix", "auth": False},
                {"method": "GET", "path": "/api/knowledge-base", "description": "List and search knowledge articles", "auth": False},
                {"method": "POST", "path": "/api/knowledge-base", "description": "Create knowledge article", "auth": False},
                {"method": "GET", "path": "/api/teams", "description": "List support teams and workload", "auth": False},
                {"method": "GET", "path": "/api/users", "description": "List users (Admin)", "auth": False},
                {"method": "GET", "path": "/api/routing-rules", "description": "List routing rules", "auth": False},
                {"method": "GET", "path": "/api/analytics/overview", "description": "Overview metrics and stats", "auth": False},
                {"method": "GET", "path": "/api/analytics/categories", "description": "Category breakdown", "auth": False},
                {"method": "GET", "path": "/api/analytics/priorities", "description": "Priority breakdown", "auth": False},
                {"method": "GET", "path": "/api/dataset/preview", "description": "Dataset management preview", "auth": False},
                {"method": "POST", "path": "/api/dataset/upload", "description": "Upload CSV dataset for validation", "auth": False}
            ]
        })

    with app.app_context():
        db.create_all()
        seed_data()

    return app


def seed_data():
    from .models import (
        User, SupportTeam, KnowledgeArticle, Ticket, RoutingRule,
        SLAPolicy, Notification, TicketHistory, TicketPrediction
    )

    if User.query.count() == 0:
        users = [
            User(name='Demo User', email='user@demo.com', password='password', role='user', department='IT Support'),
            User(name='Agent Taylor', email='agent@demo.com', password='password', role='agent', department='Network Operations'),
            User(name='Agent Jordan', email='jordan@demo.com', password='password', role='agent', department='Hardware Support'),
            User(name='Admin Morgan', email='admin@demo.com', password='password', role='admin', department='IT Management'),
        ]
        db.session.add_all(users)
        db.session.commit()

    if SupportTeam.query.count() == 0:
        teams = [
            SupportTeam(name='Hardware Support', slug='hardware', description='Endpoint devices, displays, power, and physical peripherals', lead_agent='Agent Jordan'),
            SupportTeam(name='Software Support', slug='software', description='Enterprise software, email, productivity suites, and licensing', lead_agent='Agent Taylor'),
            SupportTeam(name='Network Support', slug='network', description='VPN tunnels, Wi-Fi connectivity, DNS, firewalls, and routers', lead_agent='Agent Taylor'),
            SupportTeam(name='IAM Support', slug='iam', description='Identity & access management, SSO, MFA, and account privileges', lead_agent='Admin Morgan'),
            SupportTeam(name='General IT Support', slug='general', description='General triage and multi-disciplinary incident coordination', lead_agent='Agent Jordan'),
        ]
        db.session.add_all(teams)
        db.session.commit()

    if RoutingRule.query.count() == 0:
        rules = [
            RoutingRule(category='Network', priority='Critical', team='Network Support', agent_name='Agent Taylor', condition='Category=Network AND Priority=Critical'),
            RoutingRule(category='Network', priority='High', team='Network Support', agent_name='Agent Taylor', condition='Category=Network AND Priority=High'),
            RoutingRule(category='Hardware', priority='Critical', team='Hardware Support', agent_name='Agent Jordan', condition='Category=Hardware AND Priority=Critical'),
            RoutingRule(category='Access Management', priority='Critical', team='IAM Support', agent_name='Admin Morgan', condition='Category=Access Management AND Priority=Critical'),
            RoutingRule(category='Software', priority='High', team='Software Support', agent_name='Agent Taylor', condition='Category=Software AND Priority=High'),
        ]
        db.session.add_all(rules)
        db.session.commit()

    if SLAPolicy.query.count() == 0:
        policies = [
            SLAPolicy(priority='Critical', response_time_hours=1.0, resolution_time_hours=4.0),
            SLAPolicy(priority='High', response_time_hours=2.0, resolution_time_hours=8.0),
            SLAPolicy(priority='Medium', response_time_hours=4.0, resolution_time_hours=24.0),
            SLAPolicy(priority='Low', response_time_hours=8.0, resolution_time_hours=48.0),
        ]
        db.session.add_all(policies)
        db.session.commit()

    if KnowledgeArticle.query.count() == 0:
        articles = [
            KnowledgeArticle(
                title='VPN Connection Troubleshooting',
                category='Network',
                keywords='vpn, remote access, connection, authentication, network, tunnel',
                problem='Remote staff cannot establish or maintain active corporate VPN tunnels.',
                solution='1. Verify user Active Directory credentials.\n2. Restart Cisco AnyConnect / OpenVPN client service.\n3. Verify port 443 / UDP 1194 outbound traffic is not blocked by ISP.\n4. Check Okta Verify MFA prompt status.\n5. Flush local DNS cache using ipconfig /flushdns.',
                related_tickets='VPN not connecting, VPN drops continuously',
            ),
            KnowledgeArticle(
                title='Password Reset & Account Unlock Procedure',
                category='Access Management',
                keywords='password reset, account lock, authentication, login, credentials, mfa',
                problem='User cannot log in or Active Directory account has been locked after 3 failed password attempts.',
                solution='1. Authenticate user identity via secondary manager verification.\n2. Open Active Directory Users and Computers, locate user CN, unlock account.\n3. Issue temporary complex one-time password.\n4. Ensure user changes password on next logon.\n5. Verify MFA token is synchronized.',
                related_tickets='Employee account locked, Forgot domain password',
            ),
            KnowledgeArticle(
                title='Laptop Power & Motherboard Diagnostics',
                category='Hardware',
                keywords='laptop, power, battery, hardware failure, motherboard, charger, boot',
                problem='Laptop fails to start, LED power indicator is unlit, or device shuts down unexpectedly.',
                solution='1. Disconnect docking station and all USB peripherals.\n2. Test with a known good OEM power adapter (65W/100W).\n3. Perform hard EC reset by holding power button for 30 seconds.\n4. If amber charge LED blinks, allow 15 minutes of trickle charging before power on.\n5. If unresponsive, schedule hardware warranty dispatch.',
                related_tickets='Laptop not turning on, Battery swollen',
            ),
            KnowledgeArticle(
                title='Enterprise Software Installation & Permission Errors',
                category='Software',
                keywords='install, app, software, package, dependency, admin rights, uac',
                problem='Application setup wizard fails with Access Denied or error 1603.',
                solution='1. Check if user workstation is enrolled in Microsoft Intune.\n2. Deploy software package via Company Portal rather than direct installer.\n3. If standalone setup is required, elevate via LAPS admin privileges.\n4. Temporarily verify Windows Defender Antivirus exclusions for installation directory.\n5. Verify .NET Framework / VC++ runtime prerequisites.',
                related_tickets='Unable to install software, Installer crashing',
            ),
            KnowledgeArticle(
                title='Network Connectivity & Gateway Recovery',
                category='Network',
                keywords='network, internet, connectivity, dns, router, switch, gateway, ip',
                problem='Workstations report No Internet Access on Ethernet or Wi-Fi.',
                solution='1. Check physical patch cable and RJ-45 link lights.\n2. Run ipconfig /renew to verify DHCP server lease assignment.\n3. Ping default gateway IP to verify local switch port VLAN status.\n4. Test DNS resolution with nslookup google.com.\n5. If floor-wide, inspect switch stack uplink status in NetOps dashboard.',
                related_tickets='Network outage, No internet connection',
            ),
            KnowledgeArticle(
                title='Outlook & Exchange Synchronization Issues',
                category='Software',
                keywords='outlook, exchange, email, ost, mailbox, sync, office 365',
                problem='Outlook stuck on Loading Profile or Disconnected from Microsoft 365.',
                solution='1. Open Outlook in Safe Mode (outlook.exe /safe).\n2. Verify Microsoft 365 tenant service health in admin portal.\n3. Clear cached credentials from Windows Credential Manager.\n4. Rebuild corrupted OST data file by renaming %localappdata%\\Microsoft\\Outlook folder.\n5. Restart Microsoft 365 licensing service.',
                related_tickets='Email application crashing, Outlook not syncing',
            )
        ]
        db.session.add_all(articles)
        db.session.commit()

    if Ticket.query.count() == 0:
        now = datetime.utcnow()
        sample_tickets = [
            Ticket(
                title='VPN not connecting for remote employees',
                description='Multiple users across the finance team cannot connect to corporate VPN from home. Authentication times out after MFA approval.',
                created_by='user@demo.com',
                email='user@demo.com',
                department='Finance',
                category='Network',
                predicted_category='Network',
                category_confidence=0.95,
                priority='High',
                priority_confidence=0.89,
                status='In Progress',
                assigned_team_id=3,
                assigned_agent_id=2,
                affected_users=35,
                business_impact='High',
                downtime='Partial',
                sla_deadline=now + timedelta(hours=8),
                routing_reason='Category=Network, Priority=High -> Network Support',
                resolution_suggestions=json.dumps([
                    {'id': 1, 'title': 'VPN Connection Troubleshooting', 'match_score': 95, 'solution': 'Verify credentials, restart VPN client service, verify firewall rules.'},
                    {'id': 5, 'title': 'Network Connectivity Guide', 'match_score': 84, 'solution': 'Check DHCP and default gateway connectivity.'}
                ])
            ),
            Ticket(
                title='Executive laptop not turning on',
                description='CEO laptop completely dead. No charging indicator light when plugged into known good 100W USB-C charger. Board meeting in 2 hours.',
                created_by='user@demo.com',
                email='user@demo.com',
                department='Executive Office',
                category='Hardware',
                predicted_category='Hardware',
                category_confidence=0.97,
                priority='Critical',
                priority_confidence=0.94,
                status='Assigned',
                assigned_team_id=1,
                assigned_agent_id=3,
                affected_users=1,
                business_impact='Critical',
                downtime='Total Outage',
                sla_deadline=now + timedelta(hours=4),
                routing_reason='Category=Hardware, Priority=Critical -> Hardware Support',
                resolution_suggestions=json.dumps([
                    {'id': 3, 'title': 'Laptop Power & Motherboard Diagnostics', 'match_score': 96, 'solution': 'Perform 30-second EC reset, test with OEM adapter.'}
                ])
            ),
            Ticket(
                title='Unable to install project management software',
                description='New developer workstation requires Docker Desktop and Jira CLI installed. UAC error 1603 permissions denied.',
                created_by='user@demo.com',
                email='user@demo.com',
                department='Engineering',
                category='Software',
                predicted_category='Software',
                category_confidence=0.93,
                priority='Medium',
                priority_confidence=0.82,
                status='Open',
                assigned_team_id=2,
                assigned_agent_id=2,
                affected_users=2,
                business_impact='Low',
                downtime='None',
                sla_deadline=now + timedelta(hours=24),
                routing_reason='Category=Software, Priority=Medium -> Software Support',
                resolution_suggestions=json.dumps([
                    {'id': 4, 'title': 'Enterprise Software Installation Issues', 'match_score': 91, 'solution': 'Deploy via Company Portal or elevate with LAPS.'}
                ])
            ),
            Ticket(
                title='Employee account locked after MFA replacement',
                description='Marketing specialist got a new iPhone and is locked out of Active Directory and SSO after three failed passcode entries.',
                created_by='user@demo.com',
                email='user@demo.com',
                department='Marketing',
                category='Access Management',
                predicted_category='Access Management',
                category_confidence=0.96,
                priority='High',
                priority_confidence=0.88,
                status='Assigned',
                assigned_team_id=4,
                assigned_agent_id=4,
                affected_users=1,
                business_impact='Medium',
                downtime='Partial',
                sla_deadline=now + timedelta(hours=8),
                routing_reason='Category=Access Management, Priority=High -> IAM Support',
                resolution_suggestions=json.dumps([
                    {'id': 2, 'title': 'Password Reset & Account Unlock Procedure', 'match_score': 94, 'solution': 'Verify identity, unlock Active Directory account, re-enroll MFA.'}
                ])
            ),
            Ticket(
                title='Office Wi-Fi fluctuating on 5th floor',
                description='Laptops disconnecting every 10 minutes near conference room B. Switch syslog indicates beacon loss.',
                created_by='user@demo.com',
                email='user@demo.com',
                department='Operations',
                category='Network',
                predicted_category='Network',
                category_confidence=0.92,
                priority='Medium',
                priority_confidence=0.80,
                status='Resolved',
                resolved_at=now - timedelta(hours=2),
                assigned_team_id=3,
                assigned_agent_id=2,
                affected_users=14,
                business_impact='Medium',
                downtime='Partial',
                sla_deadline=now + timedelta(hours=24),
                routing_reason='Category=Network, Priority=Medium -> Network Support',
                resolution_suggestions=json.dumps([
                    {'id': 5, 'title': 'Network Connectivity & Gateway Recovery', 'match_score': 88, 'solution': 'Reset AP channel bonding and reboot controller.'}
                ])
            )
        ]
        db.session.add_all(sample_tickets)
        db.session.commit()

        # Add initial history & notifications for sample tickets
        for t in sample_tickets:
            h = TicketHistory(ticket_id=t.id, action='Ticket Created', new_value='Created', performed_by=t.created_by)
            db.session.add(h)
            p = TicketPrediction(
                ticket_id=t.id,
                category=t.predicted_category,
                category_confidence=t.category_confidence,
                priority=t.priority,
                priority_confidence=t.priority_confidence,
                model_name='Demo DistilBERT / Demo XGBoost',
                model_version='demo-v1.0'
            )
            db.session.add(p)
            n = Notification(
                user_id=1,
                ticket_id=t.id,
                message=f"Ticket #{t.id} '{t.title}' created and routed to {t.predicted_category}.",
                type='ticket_created',
                read=False
            )
            db.session.add(n)

        db.session.commit()
