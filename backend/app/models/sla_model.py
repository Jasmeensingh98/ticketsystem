from datetime import datetime
from app import db


class SLAPolicy(db.Model):
    __tablename__ = 'sla_policies'

    id = db.Column(db.Integer, primary_key=True)
    priority = db.Column(db.String(40), nullable=False)
    response_time_hours = db.Column(db.Float, default=4.0)
    resolution_time_hours = db.Column(db.Float, default=24.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'priority': self.priority,
            'response_time_hours': self.response_time_hours,
            'resolution_time_hours': self.resolution_time_hours,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
