from flask import jsonify
from flask_jwt_extended import create_access_token
from app.models import User


def register_user(data):
    email = data.get('email')
    if User.query.filter_by(email=email).first():
        return None, 'Email already registered'

    user = User(
        name=data.get('name'),
        email=email,
        role=data.get('role', 'user'),
        department=data.get('department', 'IT Support')
    )
    user.password = data.get('password')
    from app import db
    db.session.add(user)
    db.session.commit()
    token = create_access_token(identity={'id': user.id, 'role': user.role, 'email': user.email})
    return {'token': token, 'user': user.to_dict()}, None


def login_user(data):
    user = User.query.filter_by(email=data.get('email')).first()
    if not user or not user.verify_password(data.get('password')):
        return None, 'Invalid email or password'
    token = create_access_token(identity={'id': user.id, 'role': user.role, 'email': user.email})
    return {'token': token, 'user': user.to_dict()}, None
