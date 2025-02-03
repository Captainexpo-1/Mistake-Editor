from flask import Flask, send_from_directory
from flask_socketio import SocketIO
import mistake
import sys
import mistake.main
import mistake.runtime.interpreter
import mistake.runtime.stdlib.std_funcs
import os
import dotenv
dotenv.load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env"))

app = Flask(__name__, static_folder="static")
socketio = SocketIO(app)


@app.route("/<path:filename>")
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)


@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@socketio.on("run_code")
def handle_run_code_event(json):
    def handle_output(output):
        print(output)
        socketio.emit("output", {"data": str(output) + "\n"})

    mistake.runtime.stdlib.std_funcs.PRINT_CALLBACK = handle_output
    code = json.get("code", "")

    interpreter = mistake.runtime.interpreter.Interpreter(unsafe_mode=True)
    interpreter.print_callback = handle_output

    res = mistake.main.run_script(code, rt=interpreter, standalone=False)
    print(res)
    if res[0] is False: 
        if not isinstance(res[1], list):
            res = (res[0], [res[1]])
        socketio.emit("output", {"data":'\n'.join(f'<span class="error">{str(i)}</span>' for i in res[1])})
    socketio.emit("finished")


if __name__ == "__main__":
    sys.setrecursionlimit(10**6)
    PORT = int(os.environ.get("PORT", 5000))
    print("Starting server on port", PORT)
    socketio.run(app, debug=True, port=PORT)