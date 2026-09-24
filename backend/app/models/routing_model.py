from datetime import datetime
from app import db


class RoutingRule(db.Model):
    __tablename__ = 'routing_rules'

    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(80), nullable=False)
    priority = db.Column(db.String(40), nullable=False)
    team = db.Column(db.String(120), nullable=False)
    agent_name = db.Column(db.String(120), nullable=True)
    condition = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category,
            'priority': self.priority,
            'team': self.team,
            'agent_name': self.agent_name,
            'condition': self.condition,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
