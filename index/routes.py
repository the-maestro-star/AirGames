from flask import request, render_template, redirect, url_for, Blueprint
home = Blueprint('home',__name__,template_folder = 'templates' )

@home.route('/')
def index():
    return render_template('index/index.html')
@home.route('/about')
def about():
    return render_template('index/about.html')

