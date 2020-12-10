import os
import subprocess 
import shutil
import uuid

CURRENT_DIRECTORY = os.path.dirname(os.path.realpath(__file__))
TEMP_DIRECTORY = '%s/tmp' % CURRENT_DIRECTORY

def execute_code(code):
    # Generate unique folder to run source code.
    source_file_parent_directory = uuid.uuid4()
    source_file_host_directory = '%s/%s' % (TEMP_DIRECTORY, source_file_parent_directory)
    make_directory(source_file_host_directory)

    source_file_name = '%s/%s' % (source_file_host_directory, 'main.py')

    # Open source code file and fill with code.
    with open(source_file_name, 'w') as source_file:
        source_file.write(code)

    # Create a process to execute the python file.
    execute_command = 'python %s' % (source_file_name)
    std_output, err_output = run_process(execute_command)

    # Cleanup and delete directory.
    shutil.rmtree(source_file_host_directory)

    return std_output, err_output

def run_process(execute_command):
    # Create a process to execute the python file.
    process = subprocess.Popen(execute_command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, shell=True)
    std_output, err_output = None, None
    try:
        std_output, err_output = process.communicate(timeout=1000)
    except subprocess.TimeoutExpired:
        print('Timed out.')

    return std_output, err_output

def make_directory(directory):
    try:
        os.mkdir(directory)
        print('Temporary directory [%s] created.' % directory)
    except OSError:
        print('Temporary directory [%s] exists.' % directory)

execute_code("print('Hello world')")