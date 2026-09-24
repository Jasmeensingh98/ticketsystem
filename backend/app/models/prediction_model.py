from datetime import datetime
from app import db


class TicketPrediction(db.Model):
    __tablename__ = 'ticket_predictions'

    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False)
    category = db.Column(db.String(80), nullable=False)
    category_confidence = db.Column(db.Float, default=0.0)
    priority = db.Column(db.String(40), nullable=False)
    priority_confidence = db.Column(db.Float, default=0.0)
    model_name = db.Column(db.String(120), default='DistilBERT / XGBoost')
    model_version = db.Column(db.String(60), default='v1.0')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'ticket_id': self.ticket_id,
            'category': self.category,
            'category_confidence': round(self.category_confidence, 4),
            'priority': self.priority,
            'priority_confidence': round(self.priority_confidence, 4),
            'model_name': self.model_name,
            'model_version': self.model_version,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
