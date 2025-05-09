from flask import Flask 
def create_app():
    app = Flask(__name__, template_folder = 'templates')
    from index.routes import home
    app.register_blueprint(home, url_prefix = '/')
    return app