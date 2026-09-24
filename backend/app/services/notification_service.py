import os
from app import db
from app.models import Notification, User
from app.integrations.email_service import EmailService
from app.integrations.slack_service import SlackService


class NotificationService:
    def __init__(self):
        self.email_service = EmailService()
        self.slack_service = SlackService()

    def send_ticket_created(self, user_email, ticket):
        msg = f"Ticket #{ticket.id} '{ticket.title}' submitted. AI predicted {ticket.predicted_category} ({ticket.priority} priority)."
        self._record_notification(user_email, msg, 'ticket_created', ticket.id)
        self.email_service.send_ticket_created(user_email, ticket)
        self.slack_service.notify(f"🎫 New Ticket #{ticket.id}: {ticket.title} [{ticket.priority}] -> {ticket.predicted_category}")

    def send_ticket_assigned(self, user_email, ticket, agent_name=None):
        msg = f"Ticket #{ticket.id} assigned to team and agent: {agent_name or 'Support Specialist'}."
        self._record_notification(user_email, msg, 'ticket_assigned', ticket.id)
        self.email_service.send_ticket_assigned(user_email, ticket)

    def send_priority_changed(self, user_email, ticket, old_priority, new_priority):
        msg = f"Ticket #{ticket.id} priority updated from {old_priority} to {new_priority}."
        self._record_notification(user_email, msg, 'priority_changed', ticket.id)

    def send_ticket_resolved(self, user_email, ticket):
        msg = f"Ticket #{ticket.id} '{ticket.title}' has been resolved by support."
        self._record_notification(user_email, msg, 'ticket_resolved', ticket.id)
        self.slack_service.notify(f"✅ Ticket #{ticket.id} resolved: {ticket.title}")

    def send_ticket_closed(self, user_email, ticket):
        msg = f"Ticket #{ticket.id} has been closed."
        self._record_notification(user_email, msg, 'ticket_closed', ticket.id)

    def _record_notification(self, user_email, message, notification_type, ticket_id=None):
        try:
            user = User.query.filter_by(email=user_email).first()
            user_id = user.id if user else None
            notif = Notification(
                user_id=user_id,
                ticket_id=ticket_id,
                message=message,
                type=notification_type,
                read=False
            )
            db.session.add(notif)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"[NotificationService] Error saving notification: {e}")
