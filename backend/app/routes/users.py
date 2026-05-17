from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.cover_letter import CoverLetter

users_bp = Blueprint('users', __name__)

@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return jsonify(user.to_dict()), 200

@users_bp.route('/profile', methods=['PATCH'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()
    
    if 'full_name' in data:
        user.full_name = data['full_name']
    if 'default_tone' in data:
        user.default_tone = data['default_tone']
    if 'default_length' in data:
        user.default_length = data['default_length']
    if 'default_highlight' in data:
        user.default_highlight = data['default_highlight']
    if 'avatar_url' in data:
        user.avatar_url = data['avatar_url']
        
    db.session.commit()
    return jsonify(user.to_dict()), 200

@users_bp.route('/change-password', methods=['PATCH'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()
    
    if not user.check_password(data.get('current_password')):
        return jsonify({'message': 'Invalid current password'}), 400
        
    user.set_password(data.get('new_password'))
    db.session.commit()
    return jsonify({'message': 'Password updated successfully'}), 200

@users_bp.route('/account', methods=['DELETE'])
@jwt_required()
def delete_account():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'Account and all associated data deleted successfully'}), 200
