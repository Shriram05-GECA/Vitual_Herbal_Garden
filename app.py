from flask import Flask, render_template, request, jsonify, redirect, url_for, flash, session
import os
from datetime import datetime
import json
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///herbal_garden.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')

# Configure upload folders
app.config['UPLOAD_FOLDER'] = 'static/images/plants'
app.config['IDENTIFICATION_UPLOAD_FOLDER'] = 'static/images/identifications'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Initialize extensions after app creation to avoid circular imports
from flask_login import LoginManager, current_user, login_required
from models import db

db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message_category = 'error'

# Import models after db initialization
from models import User, Plant, Category

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Import blueprints after app creation
from auth import auth
app.register_blueprint(auth)

# Import translations
from translations import get_translation

@app.context_processor
def inject_global_variables():
    """Inject global variables into all templates"""
    current_language = session.get('language', 'en')
    current_theme = session.get('theme', 'light')
    
    def translate(key):
        return get_translation(current_language, key)
    
    return dict(
        current_language=current_language,
        current_theme=current_theme,
        current_user=current_user,
        t=translate
    )

@app.route('/')
def index():
    from models import Plant, Category
    
    category_id = request.args.get('category', type=int)
    search_query = request.args.get('q', '')
    
    # Build query - only show approved plants to non-admin users
    query = Plant.query
    
    if not current_user.is_authenticated or not current_user.is_admin():
        query = query.filter_by(is_approved=True)
    
    if category_id:
        query = query.join(Plant.categories).filter(Category.id == category_id)
    
    if search_query:
        query = query.filter(
            Plant.name.ilike(f'%{search_query}%') | 
            Plant.scientific_name.ilike(f'%{search_query}%') |
            Plant.hindi_name.ilike(f'%{search_query}%') |
            Plant.ayurvedic_name.ilike(f'%{search_query}%') |
            Plant.common_names.ilike(f'%{search_query}%')
        )
    
    plants = query.all()
    categories = Category.query.all()
    
    return render_template('index.html', 
                         plants=plants, 
                         categories=categories, 
                         selected_category=category_id,
                         search_query=search_query)

@app.route('/plant/<int:plant_id>')
def plant_detail(plant_id):
    from models import Plant
    plant = Plant.query.get_or_404(plant_id)
    return render_template('plant_detail.html', plant=plant)

@app.route('/categories')
def categories():
    from models import Category
    categories = Category.query.all()
    return render_template('categories.html', categories=categories)

@app.route('/category/<int:category_id>')
def category_plants(category_id):
    from models import Category, Plant
    category = Category.query.get_or_404(category_id)
    plants = category.plants
    all_categories = Category.query.all()
    return render_template('index.html', plants=plants, categories=all_categories, selected_category=category_id)

@app.route('/add-plant', methods=['GET', 'POST'])
@login_required
def add_plant():
    from models import Category, Plant
    
    categories = Category.query.all()
    
    if request.method == 'POST':
        try:
            # Get form data
            name = request.form.get('name')
            scientific_name = request.form.get('scientific_name')
            family = request.form.get('family')
            ayurvedic_name = request.form.get('ayurvedic_name')
            hindi_name = request.form.get('hindi_name')
            sanskrit_name = request.form.get('sanskrit_name')
            
            # Ayurvedic properties
            rasa = request.form.get('rasa')
            guna = request.form.get('guna')
            virya = request.form.get('virya')
            vipaka = request.form.get('vipaka')
            dosha = request.form.get('dosha')
            
            # Detailed information
            description = request.form.get('description')
            benefits = request.form.get('benefits')
            uses = request.form.get('uses')
            medicinal_properties = request.form.get('medicinal_properties')
            chemical_constituents = request.form.get('chemical_constituents')
            pharmacological_actions = request.form.get('pharmacological_actions')
            therapeutic_uses = request.form.get('therapeutic_uses')
            culinary_uses = request.form.get('culinary_uses')
            growing_conditions = request.form.get('growing_conditions')
            precautions = request.form.get('precautions')
            side_effects = request.form.get('side_effects')
            
            # Growing information
            season = request.form.get('season')
            water_requirements = request.form.get('water_requirements')
            sunlight_requirements = request.form.get('sunlight_requirements')
            soil_type = request.form.get('soil_type')
            climate = request.form.get('climate')
            
            # Selected categories
            selected_categories = request.form.getlist('categories')
            
            # Handle file upload
            image_filename = None
            if 'image' in request.files:
                file = request.files['image']
                if file and file.filename != '' and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    image_filename = f"{timestamp}_{filename}"
                    file.save(os.path.join(app.config['UPLOAD_FOLDER'], image_filename))
            
            # Create new plant
            new_plant = Plant(
                name=name,
                scientific_name=scientific_name,
                family=family,
                ayurvedic_name=ayurvedic_name,
                hindi_name=hindi_name,
                sanskrit_name=sanskrit_name,
                rasa=rasa,
                guna=guna,
                virya=virya,
                vipaka=vipaka,
                dosha=dosha,
                image_filename=image_filename,
                description=description,
                benefits=benefits,
                uses=uses,
                medicinal_properties=medicinal_properties,
                chemical_constituents=chemical_constituents,
                pharmacological_actions=pharmacological_actions,
                therapeutic_uses=therapeutic_uses,
                culinary_uses=culinary_uses,
                growing_conditions=growing_conditions,
                precautions=precautions,
                side_effects=side_effects,
                season=season,
                water_requirements=water_requirements,
                sunlight_requirements=sunlight_requirements,
                soil_type=soil_type,
                climate=climate,
                user_id=current_user.id,
                is_approved=current_user.is_admin()
            )
            
            db.session.add(new_plant)
            db.session.flush()
            
            # Add categories
            for category_id in selected_categories:
                category = Category.query.get(int(category_id))
                if category:
                    new_plant.categories.append(category)
            
            db.session.commit()
            
            if current_user.is_admin():
                flash('Plant added successfully!', 'success')
            else:
                flash('Plant added successfully! It will be visible after admin approval.', 'info')
            
            return redirect(url_for('index'))
            
        except Exception as e:
            db.session.rollback()
            flash(f'Error adding plant: {str(e)}', 'error')
    
    return render_template('add_plant.html', categories=categories)

@app.route('/identify-plant', methods=['GET', 'POST'])
def identify_plant():
    from models import PlantIdentification, Plant
    
    # Create a simple mock API for demo
    class MockPlantIdAPI:
        def identify_plant(self, image_path, organs=None):
            return {
                'success': True,
                'data': {
                    'suggestions': [
                        {
                            'plant_name': 'Ocimum tenuiflorum',
                            'probability': 0.85,
                            'plant_details': {'common_names': ['Holy Basil', 'Tulsi']}
                        }
                    ]
                },
                'error': None
            }
        
        def parse_identification_results(self, data):
            if data and 'suggestions' in data:
                suggestion = data['suggestions'][0]
                return {
                    'scientific_name': suggestion.get('plant_name', 'Unknown'),
                    'common_names': suggestion.get('plant_details', {}).get('common_names', []),
                    'probability': suggestion.get('probability', 0)
                }
            return None
    
    plant_id_api = MockPlantIdAPI()
    
    if request.method == 'POST':
        if 'plant_image' not in request.files:
            flash('No image file provided', 'error')
            return redirect(request.url)
        
        file = request.files['plant_image']
        if file.filename == '':
            flash('No image selected', 'error')
            return redirect(request.url)
        
        if file and allowed_file(file.filename):
            try:
                # Save uploaded image
                filename = secure_filename(file.filename)
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                image_filename = f"{timestamp}_{filename}"
                image_path = os.path.join(app.config['IDENTIFICATION_UPLOAD_FOLDER'], image_filename)
                file.save(image_path)
                
                # Call Plant.id API (mock for now)
                result = plant_id_api.identify_plant(image_path)
                
                if result['success']:
                    api_data = result['data']
                    parsed_results = plant_id_api.parse_identification_results(api_data)
                    
                    # Save identification record
                    identification = PlantIdentification(
                        image_filename=image_filename,
                        identified_species=parsed_results['scientific_name'] if parsed_results else 'Unknown',
                        confidence=parsed_results['probability'] if parsed_results else 0,
                        plant_id_api_response=json.dumps(api_data) if api_data else None,
                        user_notes=request.form.get('notes', ''),
                        user_id=current_user.id if current_user.is_authenticated else None
                    )
                    
                    # Try to find matching plant in database
                    if parsed_results:
                        scientific_name = parsed_results['scientific_name']
                        matching_plant = Plant.query.filter(
                            Plant.scientific_name.ilike(f'%{scientific_name}%')
                        ).first()
                        
                        if matching_plant:
                            identification.suggested_plant_id = matching_plant.id
                    
                    db.session.add(identification)
                    db.session.commit()
                    
                    return render_template('identify_plant.html', 
                                         identification=identification,
                                         parsed_results=parsed_results,
                                         matching_plant=identification.suggested_plant)
                else:
                    flash(f'Plant identification failed: {result["error"]}', 'error')
                    return redirect(request.url)
                    
            except Exception as e:
                flash(f'Error during plant identification: {str(e)}', 'error')
                return redirect(request.url)
        else:
            flash('Invalid file type. Please upload an image file.', 'error')
            return redirect(request.url)
    
    # GET request - show identification form
    recent_identifications = PlantIdentification.query.order_by(
        PlantIdentification.created_at.desc()
    ).limit(5).all()
    
    return render_template('identify_plant.html', recent_identifications=recent_identifications)

@app.route('/admin/dashboard')
@login_required
def admin_dashboard():
    from models import Plant, Category, PlantIdentification, User
    
    if not current_user.is_admin():
        flash('Access denied. Admin privileges required.', 'error')
        return redirect(url_for('index'))
    
    # Admin statistics
    stats = {
        'total_plants': Plant.query.count(),
        'pending_approval': Plant.query.filter_by(is_approved=False).count(),
        'total_users': User.query.count(),
        'total_categories': Category.query.count(),
        'recent_plants': Plant.query.order_by(Plant.created_at.desc()).limit(10).all(),
        'pending_plants': Plant.query.filter_by(is_approved=False).all()
    }
    
    return render_template('admin_dashboard.html', stats=stats)

@app.route('/admin/approve-plant/<int:plant_id>')
@login_required
def approve_plant(plant_id):
    from models import Plant
    
    if not current_user.is_admin():
        flash('Access denied. Admin privileges required.', 'error')
        return redirect(url_for('index'))
    
    plant = Plant.query.get_or_404(plant_id)
    plant.is_approved = True
    plant.approved_by = current_user.id
    plant.approved_at = datetime.utcnow()
    
    db.session.commit()
    flash('Plant approved successfully!', 'success')
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/reject-plant/<int:plant_id>', methods=['POST'])
@login_required
def reject_plant(plant_id):
    from models import Plant
    
    if not current_user.is_admin():
        flash('Access denied. Admin privileges required.', 'error')
        return redirect(url_for('index'))
    
    plant = Plant.query.get_or_404(plant_id)
    reason = request.form.get('reason', 'No reason provided')
    
    plant.rejection_reason = reason
    db.session.delete(plant)
    db.session.commit()
    
    flash('Plant rejected and removed.', 'success')
    return redirect(url_for('admin_dashboard'))

@app.route('/user/dashboard')
@login_required
def user_dashboard():
    from models import Plant, PlantIdentification
    
    user_plants = Plant.query.filter_by(user_id=current_user.id).all()
    user_identifications = PlantIdentification.query.filter_by(user_id=current_user.id).all()
    
    stats = {
        'plants_added': len(user_plants),
        'identifications_made': len(user_identifications),
        'approved_plants': len([p for p in user_plants if p.is_approved]),
        'pending_plants': len([p for p in user_plants if not p.is_approved])
    }
    
    return render_template('user_dashboard.html', 
                         user=current_user,
                         plants=user_plants,
                         identifications=user_identifications,
                         stats=stats)

@app.route('/set-language/<lang>')
def set_language(lang):
    """Set language preference"""
    if lang in ['en', 'hi', 'es']:
        session['language'] = lang
    return redirect(request.referrer or url_for('index'))

@app.route('/set-theme/<theme>')
def set_theme(theme):
    """Set theme preference"""
    if theme in ['light', 'dark']:
        session['theme'] = theme
    return redirect(request.referrer or url_for('index'))

# API endpoints
@app.route('/api/plants')
def api_plants():
    from models import Plant
    plants = Plant.query.all()
    return jsonify([plant.to_dict() for plant in plants])

@app.route('/api/plant/<int:plant_id>')
def api_plant_detail(plant_id):
    from models import Plant
    plant = Plant.query.get_or_404(plant_id)
    return jsonify(plant.to_dict())

@app.route('/api/categories')
def api_categories():
    from models import Category
    categories = Category.query.all()
    return jsonify([category.to_dict() for category in categories])

@app.route('/api/search')
def api_search():
    from models import Plant, Category
    
    query = request.args.get('q', '')
    category_id = request.args.get('category', type=int)
    
    plants_query = Plant.query
    
    if query:
        plants_query = plants_query.filter(
            Plant.name.ilike(f'%{query}%') | 
            Plant.scientific_name.ilike(f'%{query}%') |
            Plant.hindi_name.ilike(f'%{query}%') |
            Plant.ayurvedic_name.ilike(f'%{query}%')
        )
    
    if category_id:
        plants_query = plants_query.join(Plant.categories).filter(Category.id == category_id)
    
    plants = plants_query.limit(50).all()
    return jsonify([plant.to_dict() for plant in plants])

if __name__ == '__main__':
    # Create database tables
    with app.app_context():
        db.create_all()
    
    # Ensure upload directories exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['IDENTIFICATION_UPLOAD_FOLDER'], exist_ok=True)
    
    app.run(debug=True)