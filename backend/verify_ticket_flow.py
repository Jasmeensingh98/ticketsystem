import requests

base = 'http://127.0.0.1:5000'

health = requests.get(base + '/api/health', timeout=10)
print('HEALTH', health.status_code, health.text)

payload = {
    'name': 'Ticket Tester',
    'email': 'tickettester@example.com',
    'password': 'Test123!',
    'department': 'IT Support',
    'role': 'user'
}
register = requests.post(base + '/api/auth/register', json=payload, timeout=10)
print('REGISTER', register.status_code, register.text)

login = requests.post(
    base + '/api/auth/login',
    json={'email': payload['email'], 'password': payload['password']},
    timeout=10,
)
print('LOGIN', login.status_code, login.text)

token = login.json().get('token')
if not token:
    raise SystemExit('No token returned from login')

ticket = requests.post(
    base + '/api/tickets',
    json={
        'title': 'VPN not connecting',
        'description': 'Employee cannot access remote network from home office and keeps getting authentication failures.',
        'priority': 'High',
        'category': 'Network',
        'created_by': payload['email']
    },
    headers={'Authorization': f'Bearer {token}'},
    timeout=10,
)
print('TICKET', ticket.status_code, ticket.text)
