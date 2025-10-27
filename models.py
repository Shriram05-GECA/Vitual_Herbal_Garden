from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

# Association table for plant-categories many-to-many relationship
plant_categories = db.Table('plant_categories',
    db.Column('plant_id', db.Integer, db.ForeignKey('plant.id'), primary_key=True),
    db.Column('category_id', db.Integer, db.ForeignKey('category.id'), primary_key=True)
)

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user')  # 'user', 'admin', 'moderator'
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    avatar = db.Column(db.String(200))
    bio = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def is_admin(self):
        return self.role == 'admin'
    
    def is_moderator(self):
        return self.role in ['admin', 'moderator']
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'avatar': self.avatar,
            'bio': self.bio,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'last_login': self.last_login.strftime('%Y-%m-%d %H:%M:%S') if self.last_login else None
        }

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'plant_count': len(self.plants)
        }

class Plant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    scientific_name = db.Column(db.String(100))
    family = db.Column(db.String(100))
    image_filename = db.Column(db.String(200))
    
    # NAMAAYUSH Specific Fields
    ayurvedic_name = db.Column(db.String(100))
    hindi_name = db.Column(db.String(100))
    sanskrit_name = db.Column(db.String(100))
    common_names = db.Column(db.Text)  # JSON string of common names in different languages
    
    # Plant Classification
    rasa = db.Column(db.String(100))  # Taste
    guna = db.Column(db.String(100))  # Quality
    virya = db.Column(db.String(100))  # Potency
    vipaka = db.Column(db.String(100)) # Post-digestive effect
    dosha = db.Column(db.String(100)) # Effect on doshas
    
    # Detailed Information
    description = db.Column(db.Text)
    benefits = db.Column(db.Text)
    uses = db.Column(db.Text)
    medicinal_properties = db.Column(db.Text)
    chemical_constituents = db.Column(db.Text)
    pharmacological_actions = db.Column(db.Text)
    therapeutic_uses = db.Column(db.Text)
    culinary_uses = db.Column(db.Text)
    growing_conditions = db.Column(db.Text)
    precautions = db.Column(db.Text)
    side_effects = db.Column(db.Text)
    
    # Growing Information
    season = db.Column(db.String(50))
    water_requirements = db.Column(db.String(50))
    sunlight_requirements = db.Column(db.String(50))
    soil_type = db.Column(db.String(100))
    climate = db.Column(db.String(100))
    
    # Identification
    plantnet_id = db.Column(db.String(100))
    plant_id_api_data = db.Column(db.Text)  # JSON response from Plant.id API
    
    # User and Moderation
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    is_approved = db.Column(db.Boolean, default=False)
    approved_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    approved_at = db.Column(db.DateTime)
    rejection_reason = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    categories = db.relationship('Category', secondary=plant_categories, 
                                backref=db.backref('plants', lazy=True))
    author = db.relationship('User', foreign_keys=[user_id], backref=db.backref('plants_added', lazy=True))
    approver = db.relationship('User', foreign_keys=[approved_by], backref=db.backref('plants_approved', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'scientific_name': self.scientific_name,
            'family': self.family,
            'ayurvedic_name': self.ayurvedic_name,
            'hindi_name': self.hindi_name,
            'sanskrit_name': self.sanskrit_name,
            'image_filename': self.image_filename,
            'rasa': self.rasa,
            'guna': self.guna,
            'virya': self.virya,
            'vipaka': self.vipaka,
            'dosha': self.dosha,
            'description': self.description,
            'benefits': self.benefits,
            'uses': self.uses,
            'medicinal_properties': self.medicinal_properties,
            'therapeutic_uses': self.therapeutic_uses,
            'culinary_uses': self.culinary_uses,
            'growing_conditions': self.growing_conditions,
            'precautions': self.precautions,
            'categories': [category.name for category in self.categories],
            'is_approved': self.is_approved
        }

class PlantIdentification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    image_filename = db.Column(db.String(200), nullable=False)
    identified_species = db.Column(db.String(200))
    confidence = db.Column(db.Float)
    plant_id_api_response = db.Column(db.Text)  # Full JSON response
    suggested_plant_id = db.Column(db.Integer, db.ForeignKey('plant.id'))
    user_notes = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    suggested_plant = db.relationship('Plant', backref=db.backref('identifications', lazy=True))
    user = db.relationship('User', backref=db.backref('identifications', lazy=True))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'image_filename': self.image_filename,
            'identified_species': self.identified_species,
            'confidence': self.confidence,
            'suggested_plant_id': self.suggested_plant_id,
            'user_notes': self.user_notes,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }