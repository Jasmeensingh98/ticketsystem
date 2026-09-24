import os


class EmailService:
    def __init__(self):
        self.api_key = os.getenv('EMAIL_API_KEY')

    def send_ticket_created(self, recipient, ticket):
        return {'status': 'mocked', 'recipient': recipient, 'event': 'ticket_created', 'ticket_id': getattr(ticket, 'id', None)}

    def send_ticket_assigned(self, recipient, ticket):
        return {'status': 'mocked', 'recipient': recipient, 'event': 'ticket_assigned', 'ticket_id': getattr(ticket, 'id', None)}
