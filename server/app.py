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

@app.route('/')
def index():
    return render_template('index.jade')

@app.route('/find_related', methods=['POST'])
@cross_origin()
def find_related():
    base = request.form.get('base', None)
    return Response(json.dumps({'result':find_related_links(base)}), status=200, mimetype='application/json')

if __name__ == '__main__':
    socketio.run(app, debug=True)
