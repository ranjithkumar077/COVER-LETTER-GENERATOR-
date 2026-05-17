from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.template import Template

templates_bp = Blueprint('templates', __name__)

@templates_bp.route('', methods=['GET'])
def list_templates():
    templates = Template.query.filter_by(is_active=True).all()
    return jsonify([t.to_dict() for t in templates]), 200

@templates_bp.route('/<string:id>', methods=['GET'])
def get_template(id):
    template = Template.query.get(id)
    if not template:
        return jsonify({'message': 'Template not found'}), 404
    return jsonify(template.to_dict()), 200

@templates_bp.route('', methods=['POST'])
@jwt_required()
def create_template():
    data = request.get_json()
    
    if not data.get('name') or not data.get('content') or not data.get('category'):
        return jsonify({'message': 'Missing required fields'}), 400
        
    template = Template(
        name=data['name'],
        category=data['category'],
        content=data['content']
    )
    
    db.session.add(template)
    db.session.commit()
    
    return jsonify(template.to_dict()), 201

@templates_bp.route('/<string:id>', methods=['PATCH'])
@jwt_required()
def update_template(id):
    template = Template.query.get(id)
    if not template:
        return jsonify({'message': 'Template not found'}), 404
        
    data = request.get_json()
    
    if 'name' in data:
        template.name = data['name']
    if 'category' in data:
        template.category = data['category']
    if 'content' in data:
        template.content = data['content']
    if 'is_active' in data:
        template.is_active = data['is_active']
        
    db.session.commit()
    return jsonify(template.to_dict()), 200

@templates_bp.route('/<string:id>', methods=['DELETE'])
@jwt_required()
def delete_template(id):
    template = Template.query.get(id)
    if not template:
        return jsonify({'message': 'Template not found'}), 404
        
    db.session.delete(template)
    db.session.commit()
    return jsonify({'message': 'Template deleted successfully'}), 200
