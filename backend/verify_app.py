from app import create_app

app = create_app()
client = app.test_client()

health = client.get('/api/health')
print('HEALTH', health.status_code, health.get_json())

payload = {
    'name': 'Research Tester',
    'email': 'research@tester.com',
    'password': 'secure123',
    'department': 'IT Support',
    'role': 'user'
}
register = client.post('/api/auth/register', json=payload)
print('REGISTER', register.status_code, register.get_json())

login = client.post('/api/auth/login', json={'email': 'research@tester.com', 'password': 'secure123'})
print('LOGIN', login.status_code, login.get_json())

if login.status_code == 200:
    token = login.get_json()['token']
    ticket = client.post('/api/tickets', json={
        'title': 'VPN not connecting',
        'description': 'Employee cannot access remote network from home office and keeps getting authentication failures.',
        'priority': 'High',
        'category': 'Network',
        'created_by': 'research@tester.com'
    }, headers={'Authorization': f'Bearer {token}'})
    print('TICKET', ticket.status_code, ticket.get_json())
