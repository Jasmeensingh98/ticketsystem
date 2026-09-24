class UserDirectory:
    def __init__(self):
        self.users = [
            {'id': 1, 'name': 'Demo User', 'email': 'user@demo.com', 'department': 'IT Support'},
            {'id': 2, 'name': 'Agent Taylor', 'email': 'agent@demo.com', 'department': 'Network Operations'},
            {'id': 3, 'name': 'Admin Morgan', 'email': 'admin@demo.com', 'department': 'Operations'},
        ]

    def get_user(self, email):
        return next((user for user in self.users if user['email'] == email), None)
