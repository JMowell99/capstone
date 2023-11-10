from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
import platform
import subprocess
import pickle
import requests

app = Flask(__name__)

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
    oxygen_level = db.Column(db.PickleType, nullable=True)
    step_count = db.Column(db.PickleType, nullable=True)

    
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
    def wrapper(*args, **kwargs):
        if request.headers.get('Authorization') != f"Bearer {ACCESS_TOKEN}":
            return jsonify({'message': 'Access denied.'}), 403
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

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
            session['user_id'] = user.user_id
            return redirect(url_for('home'))
        else:
            flash("Credentials not recognized")
            return redirect('signup')
    else:
        if session.get('logged_in', False):
            return render_template('login.html')
        
        elif(session.get('logged_in', True)):
            if session['logged_in'] == True:
                return render_template('login.html', message='Login with newly created credentials')
            

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

@app.route('/signup', methods=['GET','POST'])
def signup():
    token = ACCESS_TOKEN
    if request.method == 'POST':
        newUsername = request.form['username']
        newPassword = request.form['password']

        # Create a dictionary with the data you want to send
        data = {
            'username': newUsername,
            'password': newPassword
        }
        # Get the bearer token from wherever you store it (in this case, assuming it's a global variable)
        token = ACCESS_TOKEN

        # Get the host and port from the incoming request
        host = request.host
        # Construct the relative URL for the /newUser endpoint
        url = f'http://{host}/newUser'

        # Create headers with the bearer token
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }

        # Make a POST request to the /newUser endpoint using the dynamic URL
        response = requests.post(url, json=data, headers=headers)

        # Check the response status code
        if response.status_code == 201:
            session['logged_in'] = True
            return redirect('login')
        
        else:
            return render_template('signup.html', error='Invalid username or password')
        
    else:
        return render_template('signup.html')

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
                return jsonify({'user_id': user_id, 'heart_rate': health_data.heart_rate, 'body_temp': health_data.body_temp, 'oxygen_level': health_data.oxygen_level, 'step_count': health_data.step_count}), 200
            else:
                return jsonify({'message': 'Health data not found for the specified user.'}), 404
        elif username and password:
            user = UserData.query.filter_by(username=username, password=password).first()
            if user:
                user_id = user.user_id
                health_data = UserData.query.filter_by(user_id=user_id).first()
                if health_data:
                    return jsonify({'user_id': user_id, 'heart_rate': health_data.heart_rate, 'body_temp': health_data.body_temp, 'oxygen_level': health_data.oxygen_level, 'step_count': health_data.step_count}), 200
                else:
                    return jsonify({'message': 'Health data not found for the specified user.'}), 404
            else:
                return jsonify({'message': 'Invalid username or password.'}), 401
        else:
                return jsonify({'message': 'Missing user ID or username/password.'}), 400
    elif request.method == 'POST':
        data = request.get_json()
        user_id = request.args.get('user_id')
        heart_rate = data.get('heart_rate')
        oxygen_level = data.get('oxygen_level')
        step_count = data.get('step_count')

        if user_id and heart_rate and oxygen_level and step_count:
            # Retrieve existing user data from the database
            existing_user = UserData.query.filter_by(user_id=user_id).first()

            if existing_user:
                # Deserialize existing data using pickle
                existing_heart_rate = pickle.loads(existing_user.heart_rate) if existing_user.heart_rate else []
                existing_oxygen_level = pickle.loads(existing_user.oxygen_level) if existing_user.oxygen_level else []
                existing_step_count = pickle.loads(existing_user.step_count) if existing_user.step_count else []

                # Append new data to existing data
                existing_heart_rate.extend(heart_rate)
                existing_oxygen_level.extend(oxygen_level)
                existing_step_count.extend(step_count)

                # Limit lists to 10 values
                existing_user.heart_rate = pickle.dumps(existing_heart_rate[:10])
                existing_user.oxygen_level = pickle.dumps(existing_oxygen_level[:10])
                existing_user.step_count = pickle.dumps(existing_step_count[:10])

                db.session.commit()
                return jsonify({'message': 'Health data appended successfully.'}), 200
            else:
                # Serialize new health data before storing it
                new_health_data = UserData(
                    user_id=user_id,
                    heart_rate=pickle.dumps(heart_rate[:10]),
                    oxygen_level=pickle.dumps(oxygen_level[:10]),
                    step_count=pickle.dumps(step_count[:10])
                )
                db.session.add(new_health_data)
                db.session.commit()
                return jsonify({'message': 'Health data added successfully.'}), 201
        else:
            return jsonify({'message': 'Missing user ID, heart rate, oxygen level, or step count.'}), 400

@app.route('/userData')
@login_required
def userData():
    user_id = session.get('user_id')
    return render_template('userData.html', session=session)

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
        return jsonify({'message': 'Not a supported method'}), 403


app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT']=465
app.config['MAIL_USERNAME']='tteamo2222@gmail.com'
app.config['MAIL_PASSWORD'] = 'mymhykauoylerlqq'
app.config['MAIL_USE_TLS']= False
app.config['MAIL_USE_SSL']=True


mail = Mail(app)
@app.route("/sendmail")
def index():

    msg = Message("Hello",
                  sender="tteamo2222@gmail.com",
                  recipients=["toty.cscc@gmail.com"])
    msg.body = "Hello Flask message sent from Flask-Mail"
    mail.send(msg)
    return "Receive my email"


@app.route('/deleteUser', methods=['DELETE'])
@require_token
def del_user():
    if request.method == 'DELETE':
        userID = request.args.get('user_id')
        check_if_user = UserData.query.filter_by(user_id=userID).first()
        if check_if_user is not None:
            try:
                db.session.delete(check_if_user)
                db.session.commit()
                return f"User {userID} deleted successfully."
            except Exception as e:
                return f"Error deleting user: {e}"
        else:
            return f"No user_id found in the database for {userID}"
    else:
        return jsonify({'message': 'Not a supported method'}), 403

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

"""

curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ECE3906" -d '{ "heart_rate": [67, 69, 73, 75, 78, 82, 84, 88, 91, 98], "body_temp": [97.9, 98.2, 98.4, 98.5, 98.6, 98.8, 98.9, 99.0, 99.1, 99.2], "respiration_rate": [17, 18, 18, 19, 19, 20, 20, 21, 21, 22], "oxygen_level": [95, 96, 97, 98, 99, 98, 97, 96, 95, 94], "step_count": [500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400]}' "http://172.30.24.226:3906/healthData?user_id=1"



curl -X GET -H "Content-Type: application/json" -H "Authorization: Bearer ECE3906" "http://172.30.24.226:3906/healthData?user_id=1"

"""