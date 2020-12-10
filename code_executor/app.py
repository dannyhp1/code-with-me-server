from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import executor

app = Flask(__name__)
CORS(app)

socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def hello():
    return 'Hello world!'

@app.route('/ping')
def ping():
    print('Pinging the host!')
    return 'healthy'

@app.route('/execute', methods = ['POST'])
def execute():
    data = request.get_json()
    code = data['code']
    std_output, err_output = executor.execute_code(code)

    return jsonify({
        'success': True if std_output is not None else False,
        'std_output': std_output.decode('utf-8') if std_output is not None else '',
        'err_output': err_output.decode('utf-8') if err_output is not None else ''
    })

@socketio.on('connect')
def user_connected():
    print('User connected.')
    emit('connected', {'connected': True})
    return

@socketio.on('disconnect')
def user_disconnected():
    print('User disconnected.')
    return

@socketio.on('code_change')
def handle_code_change(data):
    print('User is changing code...')
    emit('code_change', {'code': data['code']}, broadcast=True, include_self=False)
    return

if __name__ == '__main__':
    socketio.run(app, port=8282)
