from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.auth_service import register_user, login_user
from app.models import User
from app import db

auth_bp = Blueprint('auth_bp', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    user, error = register_user(data)
    if error:
        return jsonify({'error': error}), 400
    return jsonify({'message': 'User registered', 'token': user['token'], 'user': user['user']}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    result, error = login_user(data)
    if error:
        return jsonify({'error': error}), 401
    return jsonify(result), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    identity = get_jwt_identity()
    user = User.query.get(identity.get('id'))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()}), 200
