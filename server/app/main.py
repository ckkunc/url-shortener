from flask import Flask, redirect, render_template
import firebase_admin
from firebase_admin import db
import os

# Initialize Firebase credentials and app
cred_obj = firebase_admin.credentials.Certificate('./ServiceAccountKey.json')
default_app = firebase_admin.initialize_app(cred_obj,  {
	'databaseURL': ''
	})

# Initialize Flask app with static and template folders
app = Flask(__name__, static_folder='./build/static', template_folder="./build" )

# Redirect root route to /app route
@app.route("/")
def hello_world():
    return redirect("/app")

# Render homepage template for /app route
@app.route("/app")
def homepage():
    return render_template('index.html')

# Fetch data from Firebase for generated key and redirect to long URL
@app.route('/<path:generatedKey>', methods=['GET'])
def fetch_from_firebase(generatedKey):
    ref = db.reference("/"+ generatedKey)
    data = ref.get()
    if not data:
        return '404 not found'
    else:
        longURL = data['longURL']
        return redirect(longURL)
