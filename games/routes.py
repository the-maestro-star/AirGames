from flask import request, render_template, redirect, url_for, Blueprint
games = Blueprint('games',__name__,template_folder = 'templates' )

@games.route('/')
def index():
    return render_template('games/games.html')