from flask import Flask 
import cv2
import mediapipe as mp

def create_app():
    app = Flask(__name__, template_folder = 'templates')
    from index.routes import home
    app.register_blueprint(home, url_prefix = '/')
    from games.routes import games
    app.register_blueprint(games, url_prefix = '/games')
    from rock_paper_scissors.routes import rock_paper_scissors
    app.register_blueprint(rock_paper_scissors,url_prefix = '/rock_paper_scissors')
    return app

def detect_gesture(image):
    #Initializing mediapipe hand model
    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5)
    #Detect rock,paper, or scissors gestures
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    results = hands.process(image)

    if results.multi_hand_landmarks:
        landmarks = results.multi_hand_landmarks[0].landmark
        #Finger State Detection: Checking the finger tip landmark and a landmark below the finger tip
        def is_finger_extended(first_joint, second_joint):
            return landmarks[first_joint].y < landmarks[second_joint].y #Return True if the tip is extended farther out relative to a landmark below finger
    
        
        index = is_finger_extended(8,6)
        middle = is_finger_extended(12, 10)
        ring = is_finger_extended(16, 4)
        pinky = is_finger_extended(20,18)

        fingers = [ index, middle, ring, pinky]

        #Rock: When all fingers closed
        if not any(fingers):
            return 'rock'
        
        #Paper: all fingers open
        elif all(fingers):
            return 'paper'
        #Scissors: only index and middle extended
        else:
            return 'scissors'
    return None