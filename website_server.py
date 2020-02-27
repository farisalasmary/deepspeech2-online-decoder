
import os
from flask import Flask, flash, request, redirect, url_for, render_template, send_from_directory
from werkzeug.utils import secure_filename
import time

template_dir = os.path.abspath('.')
app = Flask(__name__, template_folder=template_dir)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/js/<filename>')
def send_js_files(filename):
    directory = os.path.abspath('js')
    return send_from_directory(directory, filename)

@app.route('/css/<filename>')
def send_css_files(filename):
    directory = os.path.abspath('css')
    return send_from_directory(directory, filename)



if __name__ == '__main__':
    app.secret_key = "super secret key"
    app.run(host='0.0.0.0', port=9999, debug=True)


