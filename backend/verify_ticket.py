import json
import requests

base = 'http://127.0.0.1:5000'

print('HEALTH', requests.get(f'{base}/api/health', timeout=10).status_code)

register_payload = {
    'name': 'Ticket Tester',
    'email': 'tickettester2@example.com',
    'password': 'Test123!',
    'department': 'IT Support',
    'role': 'user'
}
register = requests.post(f'{base}/api/auth/register', json=register_payload, timeout=10)
print('REGISTER', register.status_code, register.text)

login_payload = {
    'email': 'tickettester2@example.com',
    'password': 'Test123!'
}
login = requests.post(f'{base}/api/auth/login', json=login_payload, timeout=10)
print('LOGIN', login.status_code, login.text)

login_data = login.json()
token = login_data['token']

ticket_payload = {
    'title': 'VPN not connecting',
    'description': 'Employee cannot access remote network from home office and keeps getting authentication failures.',
    'priority': 'High',
    'category': 'Network',
    'created_by': 'tickettester2@example.com'
}
headers = {'Authorization': f'Bearer {token}'}
ticket = requests.post(f'{base}/api/tickets', json=ticket_payload, headers=headers, timeout=10)
print('TICKET', ticket.status_code, ticket.text)
