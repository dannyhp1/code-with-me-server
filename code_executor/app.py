from flask import Flask, request, jsonify
from flask_cors import CORS
import executor

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
def execute():
    data = request.get_json()
    code = data['code']
    std_output, err_output = executor.execute_code(code)

    return jsonify({
        'success': True if std_output is not None else False,
        'std_output': std_output.decode('utf-8') if std_output is not None else '',
        'err_output': err_output.decode('utf-8') if err_output is not None else ''
    })

if __name__ == '__main__':
    app.run(port=8282)
