from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy

import platform
import subprocess
import pickle
from statistics import mean
import json
import requests
from functools import wraps
import logging
from logging.handlers import RotatingFileHandler

app = Flask(__name__)
app.logger.setLevel(logging.DEBUG)
handler = logging.StreamHandler()
handler.setLevel(logging.DEBUG)
app.logger.addHandler(handler)

@app.after_request
def after_request(response):
    app.logger.info('%s %s %s %s %s', request.remote_addr, request.method, request.path, response.status, response.content_length)
    return response

@app.route("/logResponse", methods=["POST"])
def log_response():
    data = request.json
    app.logger.info("Response data: %s", data)
    return "", 204

# Configuration settings for the databases
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///user_data.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the SQLAlchemy instance
db = SQLAlchemy(app)
# Secret key for session management
app.config['SECRET_KEY'] = 'secret-key'

# Define the HealthData model
class UserData(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=True)
    password = db.Column(db.Integer, nullable=True)    
    heart_rate = db.Column(db.PickleType, nullable=True)
    body_temp = db.Column(db.PickleType, nullable=True)
    respiration_rate = db.Column(db.PickleType, nullable=True)
    
    def set_body_temp(self, body_temp):
        if len(body_temp) > 10:
            raise ValueError("Body temp list can have a maximum length of 10.")
        self.body_temp = pickle.dumps(body_temp)
    
    def get_body_temp(self):
        if self.body_temp is not None:
            return pickle.loads(self.body_temp)
        else:
            return None
    
ACCESS_TOKEN = "ECE3906"

# Decorator to check if the request has a valid access token
def require_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.remote_addr == f'{ip}':
            # Allow requests from localhost to bypass token authentication
            return f(*args, **kwargs)
        else:
            # Check if the request includes a valid token
            token = request.headers.get('Authorization')
            if token is None:
                return {'message': 'Missing authorization token'}, 401
            elif token != 'Bearer MY_SECRET_TOKEN':
                return {'message': 'Invalid authorization token'}, 401
            else:
                return f(*args, **kwargs)
    return decorated_function

# Login route
@app.route('/login', methods=['GET', 'POST'])
def login():
    token = ACCESS_TOKEN
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = UserData.query.filter_by(username=username).first()
        if user and user.password == password:
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
        username = request.args.get('username')
        password = request.args.get('password')
        if user_id:
            health_data = UserData.query.filter_by(user_id=user_id).first()
            if health_data:
                return jsonify({'user_id': user_id, 'heart_rate': health_data.heart_rate, 'body_temp': health_data.body_temp, 'respiration_rate': health_data.respiration_rate}), 200
            else:
                return jsonify({'message': 'Health data not found for the specified user.'}), 404
        elif username and password:
            user = UserData.query.filter_by(username=username, password=password).first()
            if user:
                user_id = user.user_id
                health_data = UserData.query.filter_by(user_id=user_id).first()
                if health_data:
                    return jsonify({'user_id': user_id, 'heart_rate': health_data.heart_rate, 'body_temp': health_data.body_temp, 'respiration_rate': health_data.respiration_rate}), 200
                else:
                    return jsonify({'message': 'Health data not found for the specified user.'}), 404
            else:
                return jsonify({'message': 'Invalid username or password.'}), 401
        else:
            return jsonify({'message': 'Missing user ID or username/password.'}), 400
    elif request.method == 'POST':
        data = request.get_json()
        user_id = request.args.get('user_id')
        username = data.get('username')
        password = data.get('password')
        if user_id:
            heart_rate = data.get('heart_rate')
            body_temps = data.get('body_temp')
            respiration_rate = data.get('respiration_rate')
            if all(isinstance(lst, list) and len(lst) <= 10 for lst in [heart_rate, body_temps, respiration_rate]):
                health_data = UserData.query.filter_by(user_id=user_id).first()
                if health_data:
                    health_data.heart_rate = heart_rate
                    health_data.body_temp = body_temps
                    health_data.respiration_rate = respiration_rate
                else:
                    health_data = UserData(user_id=user_id, heart_rate=heart_rate, body_temp=body_temps, respiration_rate=respiration_rate)
                    db.session.add(health_data)
                db.session.commit()
                return jsonify({'message': 'Health data added/updated successfully.'}), 201
            else:
                return jsonify({'message': 'Invalid health data. All data must be a list with up to 10 values.'}), 400
        elif username and password:
            user = UserData(username=username, password=password)
            db.session.add(user)
            db.session.commit()
            return jsonify({'message': 'New user credentials added successfully.'}), 201
        else:
            return jsonify({'message': 'Missing user ID or username/password.'}), 400

@app.route('/healthDataStats', methods=['GET'])
@require_token
def health_data_stats():
    user_id = request.args.get('user_id')
    stat = request.args.get('stat')
    value = request.args.get('value')
    url = f'http://{ip}:3906/healthData'

    # Set request parameters
    params = {'user_id': user_id}

    # Set request headers with token
    headers = {'Authorization': 'Bearer ECE3906'}

    # Send GET request
    response = requests.get(url, params=params, headers=headers)

    data = response.json()
    heartRate = data['heart_rate']
    bodyTemp = data['body_temp']
    respirationRate = data['respiration_rate']
    lists = {"heartRate": heartRate, "bodyTemp": bodyTemp, "respirationRate": respirationRate}

    if value == "min":
        return str(min(lists[stat]))
    elif value == "max":
        return str(max(lists[stat]))
    elif value == "mean":
        return str(mean(lists[stat]))
    else:
        return("Invalid paramaters")


@app.route('/userData')
@login_required
def userData():
    return render_template('userData.html')

# This isn't working yet. I want it to only display the data for the currently signed in user
"""
@app.route('/userData')
def user_data():
    if 'logged_in' in session and session['logged_in']:
        # Get user ID associated with username and password used to log in
        username = request.authorization.username
        password = request.authorization.password
        user = UserData.query.filter_by(username=username).first()
        if user and user.password == password:
            user_id = user.id

            # Get user data using user ID
            data = get_user_data(user_id)

            # Return user data as JSON
            return jsonify(data)
        else:
            # Return error if username and password do not match
            return jsonify({'error': 'Invalid username or password'})
    else:
        # Return error if user is not logged in
        return jsonify({'error': 'Unauthorized access'})

def get_user_data(user_id):
    # Retrieve user data from database based on user ID
    user = UserData.query.filter_by(id=user_id).first()
    if user:
        data = {
            'user_id': user.id,
            'username': user.username,
            'email': user.email
            # Add more key/value pairs as needed
        }
        return data
    else:
        return None
"""
@app.route('/newUser', methods=['POST'])
@require_token
def new_user():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        new_user = UserData(username=username, password=password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'New user credentials added successfully.'}), 201
    else:
        return jsonify({'message': 'Not a supported method'}), 400

os = platform.system()
if os == "Darwin":
    output = subprocess.check_output(['ipconfig', 'getifaddr', 'en0'])
    ip = output.strip().decode('utf-8')
elif os == "Windows":
    ipconfig_result = subprocess.check_output(['ipconfig'])
    ipconfig_result_str = ipconfig_result.decode('utf-8')
    ipconfig_lines = ipconfig_result_str.split('\n')
    for line in ipconfig_lines:
        if 'IPv4 Address' in line:
            ip = line.split(':')[-1].strip()

if ip == "172.28.24.178":
    ip = "localhost"

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host=ip, port='3906', debug=True)
