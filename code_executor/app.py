from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello():
    return 'Hello world!'

@app.route('/ping')
def ping():
    print('Pinging the host!')
    return 'healthy'

@app.route('/execute', methods = ['POST'])
def execute(code):
    print(code)
    return 'Executing your code.'

if __name__ == '__main__':
    app.run(port=8282)
