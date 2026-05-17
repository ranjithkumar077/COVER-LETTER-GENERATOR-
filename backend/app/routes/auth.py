from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.user import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password') or not data.get('full_name'):
        return jsonify({'message': 'Missing required fields'}), 400
        
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'User already exists'}), 409
        
    new_user = User(
        full_name=data['full_name'],
        email=data['email']
    )
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    
    access_token = create_access_token(identity=new_user.id)
    refresh_token = create_refresh_token(identity=new_user.id)
    
    return jsonify({
        'message': 'User created successfully',
        'user': new_user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400
        
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Invalid email or password'}), 401
        
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    return jsonify(user.to_dict()), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user_id)
    return jsonify({'access_token': new_access_token}), 200

import smtplib
from email.mime.text import MIMEText
import datetime
import os

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({'message': 'Email is required'}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'If your email is registered, you will receive a reset link.'}), 200
        
    # Create a 15-minute token
    expires = datetime.timedelta(minutes=15)
    reset_token = create_access_token(identity=user.id, expires_delta=expires, additional_claims={"purpose": "reset_password"})
    
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    reset_url = f"{frontend_url}/reset-password?token={reset_token}"
    
    # Try to send email
    smtp_server = os.environ.get("SMTP_SERVER")
    smtp_port = os.environ.get("SMTP_PORT")
    smtp_user = os.environ.get("SMTP_USERNAME")
    smtp_pass = os.environ.get("SMTP_PASSWORD")
    
    if not all([smtp_server, smtp_port, smtp_user, smtp_pass]):
        print(f"SMTP not configured. Reset link: {reset_url}")
        return jsonify({
            'message': 'If your email is registered, you will receive a reset link. (SMTP not configured, link logged in console)',
            'link': reset_url
        }), 200
        
    try:
        msg = MIMEText(f"Click the link to reset your password: {reset_url}")
        msg['Subject'] = 'Password Reset - CareerForge'
        msg['From'] = smtp_user
        msg['To'] = email
        
        with smtplib.SMTP(smtp_server, int(smtp_port)) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
            
        return jsonify({'message': 'If your email is registered, you will receive a reset link.'}), 200
    except Exception as e:
        print(f"Error sending email: {e}")
        return jsonify({'message': 'Failed to send email. Please try again later.'}), 500

@auth_bp.route('/reset-password', methods=['POST'])
@jwt_required()
def reset_password():
    data = request.get_json()
    new_password = data.get('password')
    
    if not new_password:
        return jsonify({'message': 'Password is required'}), 400
        
    claims = get_jwt()
    if claims.get("purpose") != "reset_password":
        return jsonify({'message': 'Invalid token purpose'}), 401
        
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    user.set_password(new_password)
    db.session.commit()
    
    return jsonify({'message': 'Password reset successful'}), 200
