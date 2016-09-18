import json
import os
from flask import Flask, render_template, request, Response
from flask_socketio import SocketIO, emit
import requests
from bs4 import BeautifulSoup
from flask_cors import CORS, cross_origin

APP_ROOT = os.path.dirname(os.path.abspath(__file__))
APP_STATIC = os.path.join(APP_ROOT, 'static')

app = Flask(__name__)
app.jinja_env.add_extension('pyjade.ext.jinja.PyJadeExtension')
app.debug = True
socketio = SocketIO(app)

commands = [{'name':'ls <PATH>','description':"List all links in page indicated by PATH. If PATH is not indicated, list all links on the page."},{'name':'cd <PATH>','description':"Navigate to the webopage indicated by PATH. If PATH is relative, then navigate to relative path. If PATH is not indicated, navigate to HOME_PAGE set via export command."},{'name':'export <VAR_NAME>=<VAR_VALUE>','description':"Set VAR_NAME to VAR_VALUE."},{'name':'alias <EXISTING_COMMAND><NEW_COMMAND>','description':"Set NEW_COMMAND to have identical functionality as EXISTING_COMMAND."},{'name':'echo <TEXT>','description':"Display TEXT in pop-up."},{'name':'man <COMMAND>','description':"Redirect user to manual page. If COMMAND is provided, redirect user to manual page for COMMAND."},{'name':'grep <TOKEN>','description':"Search for TOKEN in current webpage."}]

def find_related_links(body, seen = {}):
    if body is None:
        return []
    q = set()
    soup = BeautifulSoup(body, "lxml")
    for link in soup.findAll('a'):
        href = link.get('href')
        if href and href[0] == '/' and href!='/':
            q.add(href.strip('/'))
    return list(q)

# @app.route('/<cmd_name>')
# def manual(name):
#     desc = ""
#     for command in commands:
#         if command.name == name:
#             desc = command.description
#     return render_template('command.jade', cmd_name=name, cmd_desc=desc)

@app.route('/')
def index():
    return render_template('test.jade')

@app.route('/ls')
def ls_manual():
    return render_template('ls.jade')

@app.route('/cd')
def cd_manual(name):
    return render_template('cd.jade')

@app.route('/export')
def export_manual(name):
    return render_template('export.jade')

@app.route('/alias')
def alias_manual(name):
    return render_template('alias.jade')

@app.route('/echo')
def echo_manual(name):
    return render_template('echo.jade')

@app.route('/man')
def man_manual(name):
    return render_template('man.jade')

@app.route('/cat')
def cat_manual(name):
    return render_template('cat.jade')

@app.route('/grep')
def grep_manual(name):
    return render_template('grep.jade')

@app.route('/test')
def test():
    return render_template('test.jade')

@app.route('/find_related', methods=['POST'])
@cross_origin()
def find_related():
    base = request.form.get('base', None)
    return Response(json.dumps({'result':find_related_links(base)}), status=200, mimetype='application/json')

if __name__ == '__main__':
    socketio.run(app, debug=True)
