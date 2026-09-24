from app.models import SupportTeam, User, RoutingRule, Ticket
from app import db


class RoutingService:
    TEAM_MAP = {
        'Hardware': 'Hardware Support',
        'Software': 'Software Support',
        'Network': 'Network Support',
        'Access Management': 'IAM Support',
        'Other': 'General IT Support',
    }

    def route_ticket(self, category: str, priority: str = 'Medium', workload=None):
        category = category or 'Other'
        priority = priority or 'Medium'

        # 1. Check custom routing rules
        custom_rule = RoutingRule.query.filter(
            RoutingRule.category == category,
            RoutingRule.priority == priority
        ).first()

        if custom_rule:
            team_name = custom_rule.team
            routing_reason = f"Custom Rule Applied: Category={category}, Priority={priority} -> {team_name}"
            target_agent = custom_rule.agent_name
        else:
            team_name = self.TEAM_MAP.get(category, 'General IT Support')
            routing_reason = f"Category={category}, Priority={priority} -> {team_name}"
            target_agent = None

        team = SupportTeam.query.filter_by(name=team_name).first()
        if not team:
            team = SupportTeam.query.first()
            if team:
                team_name = team.name

        # 2. Select agent based on availability & workload
        agent = self._select_best_agent(team, target_agent, priority)

        return {
            'team': team_name,
            'team_id': team.id if team else None,
            'agent': agent['name'] if agent else 'Unassigned',
            'agent_id': agent['id'] if agent else None,
            'routing_reason': routing_reason,
            'agent_workload': agent.get('active_tickets', 0) if agent else 0,
        }

    def _select_best_agent(self, team, target_agent_name=None, priority='Medium'):
        # If a specific agent was assigned by rule
        if target_agent_name:
            agent = User.query.filter_by(name=target_agent_name, role='agent').first()
            if agent:
                return {'id': agent.id, 'name': agent.name, 'email': agent.email, 'active_tickets': self._get_agent_active_tickets(agent.id)}

        # Find all agents
        agents = User.query.filter(User.role.in_(['agent', 'admin'])).all()
        if not agents:
            return None

        # Check department match first
        dept_keywords = {
            'Network Support': 'network',
            'Hardware Support': 'hardware',
            'Software Support': 'software',
            'IAM Support': 'iam',
        }
        dept_match = dept_keywords.get(team.name if team else '', '').lower()

        # Score agents by workload (lowest active tickets first)
        agent_workloads = []
        for a in agents:
            active_count = self._get_agent_active_tickets(a.id)
            dept_bonus = -2 if (dept_match and dept_match in (a.department or '').lower()) else 0
            score = active_count + dept_bonus
            agent_workloads.append((score, active_count, a))

        agent_workloads.sort(key=lambda x: x[0])
        best = agent_workloads[0][2]
        return {
            'id': best.id,
            'name': best.name,
            'email': best.email,
            'active_tickets': agent_workloads[0][1]
        }

    def _get_agent_active_tickets(self, agent_id: int) -> int:
        return Ticket.query.filter(
            Ticket.assigned_agent_id == agent_id,
            Ticket.status.in_(['Open', 'Assigned', 'In Progress', 'Pending', 'AI Processing'])
        ).count()
