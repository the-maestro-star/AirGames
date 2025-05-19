#importing create_app function from main to run in run.py
from main import create_app

flask_app = create_app()
if __name__ == '__main__':
    flask_app.run(debug=True)