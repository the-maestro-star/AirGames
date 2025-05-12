from flask import Flask 
import cv2
import mediapipe as mp
import random
from time import time

def create_app():

#Initializing mediapipe hand model
    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5)

    def detect_gesture(image):
    #Detect rock,paper, or scissors gestures
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = cv2.flip(image,1)
        results = hands.process(image)

        if not results.multi_hand_landmarks:
            return None

        landmarks = results.multi_hand_landmarks[0].landmark
        #Finger State Detection
        def is_finger_extended(tip_idx, pip_idx):
            return landmarks[tip_idx].y < landmarks[pip_idx].y
    
        thumb_extended = is_finger_extended(4,3)
        index_extended = is_finger_extended(8,6)
        middle_extended = is_finger_extended(12, 10)
        ring_extended = is_finger_extended(16, 4)
        pinky_extended = is_finger_extended(20,18)

        #Rock: When all fingers closed
        if not any([index_extended,middle_extended,ring_extended,pinky_extended]):
            return 'rock'
        
        #Paper: all fingers open
        if all([index_extended,middle_extended,ring_extended,pinky_extended]):
            return 'paper'
        #Scissors: only index and middle extended
        if index_extended and middle_extended and not (ring_extended or pinky_extended):
            return 'scissors'
        return None





    app = Flask(__name__, template_folder = 'templates')
    from index.routes import home
    app.register_blueprint(home, url_prefix = '/')
    from games.routes import games
    app.register_blueprint(games, url_prefix = '/games')
    from rock_paper_scissors.routes import rock_paper_scissors
    app.register_blueprint(rock_paper_scissors,url_prefix = '/rock_paper_scissors')
    return app