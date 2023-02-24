from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
import subprocess

app = Flask(__name__)

# Configuration settings for the database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///health_data.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the SQLAlchemy instance
db = SQLAlchemy(app)
# Secret key for session management
app.config['SECRET_KEY'] = 'secret-key'

# Define the HealthData model
class HealthData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), nullable=False)
    heart_rate = db.Column(db.Integer, nullable=False)
    body_temp = db.Column(db.Float, nullable=False)
    respiration_rate = db.Column(db.Integer, nullable=False)

ACCESS_TOKEN = "ECE3906"

# Decorator to check if the request has a valid access token
def require_token(f):
    def wrapper(*args, **kwargs):
        if request.headers.get('Authorization') != f"Bearer {ACCESS_TOKEN}":
            return jsonify({'message': 'Access denied.'}), 403
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

# Login route
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username == 'Jesse' and password == 'Team02':
            session['logged_in'] = True
            return redirect(url_for('home'))
        if username == 'Josh' and password == 'Team02':
            session['logged_in'] = True
            return redirect(url_for('home'))
        if username == 'Steve' and password == 'Team02':
            session['logged_in'] = True
            return redirect(url_for('home'))
        if username == 'Ronny' and password == 'Team02':
            session['logged_in'] = True
            return redirect(url_for('home'))
        if username == 'Mustafa' and password == 'Team02':
            session['logged_in'] = True
            return redirect(url_for('home'))
        if username == 'Berger' and password == 'Team02':
            session['logged_in'] = True
            return redirect(url_for('home'))
        
        else:
            return render_template('login.html', error='Invalid username or password')
    else:
        return render_template('login.html')


# Decorator to check if the user is logged in
def login_required(f):
    def wrapper(*args, **kwargs):
        if not session.get('logged_in'):
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

# Homepage route
@app.route('/')
@login_required
def home():
    return render_template('index.html')

@app.route('/about')
@login_required
def about():
    return render_template('about.html')

@app.route('/healthData', methods=['GET', 'POST'])
@require_token
def health_data():
    if request.method == 'GET':
        user_id = request.args.get('user_id')
        health_data = HealthData.query.filter_by(user_id=user_id).first()
        if health_data:
            return jsonify({'user_id': user_id, 'heart_rate': health_data.heart_rate, 'body_temp': health_data.body_temp, 'respiration_rate': health_data.respiration_rate}), 200
        else:
            return jsonify({'message': 'Health data not found for the specified user.'}), 404
    elif request.method == 'POST':
        data = request.get_json()
        user_id = data.get('user_id')
        heart_rate = data.get('heart_rate')
        body_temp = data.get('body_temp')
        respiration_rate = data.get('respiration_rate')
        new_health_data = HealthData(user_id=user_id, heart_rate=heart_rate, body_temp=body_temp, respiration_rate=respiration_rate)
        db.session.add(new_health_data)
        db.session.commit()
        return jsonify({'message': 'Health data added successfully.'}), 201

output = subprocess.check_output(['ipconfig', 'getifaddr', 'en0'])
ip = output.strip().decode('utf-8')
if ip == "172.28.24.178":
    ip = "localhost"

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host=ip, port='3906', debug=True)
