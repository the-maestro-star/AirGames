from flask import request, render_template, redirect, url_for, Blueprint,jsonify
import random
import base64
import numpy as np
import cv2
from main import detect_gesture


rock_paper_scissors = Blueprint('rock_paper_scissors',__name__,template_folder = 'templates' )

@rock_paper_scissors.route('/')
def index():
    return render_template('rock_paper_scissors/rps.html')

@rock_paper_scissors.route('/analyze', methods=['GET','POST'])
def analyze():
    image_data = request.json['image'].split(',')[1] #Get image data
    nparr = np.frombuffer(base64.b64decode(image_data), np.uint8) #Decodes String
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR) #Convert image data to image
    gesture = detect_gesture(img)
    return jsonify({'gesture': gesture})

#Get Computer Choice
@rock_paper_scissors.route('/get_computer_choice',methods= ['GET','POST'])
def get_computer_choice():
    return jsonify({'choice': random.choice(['rock', 'paper', 'scissors'])})