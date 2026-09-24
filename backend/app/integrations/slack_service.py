import os


class SlackService:
    def __init__(self):
        self.webhook_url = os.getenv('SLACK_WEBHOOK_URL')

    def notify(self, message, channel='#helpdesk'):
        return {'status': 'mocked', 'channel': channel, 'message': message}
