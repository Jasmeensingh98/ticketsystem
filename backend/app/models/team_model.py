from datetime import datetime
from app import db


class SupportTeam(db.Model):
    __tablename__ = 'support_teams'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    slug = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    lead_agent = db.Column(db.String(120), default='Support Lead')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'lead_agent': self.lead_agent,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
