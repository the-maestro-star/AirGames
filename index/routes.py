from flask import Flask ,render_template, request, url_for,Blueprint
home = Blueprint('home',__name__,template_folder = 'templates' )

@home.route('/')
def index():
    return render_template('index/index.html')

