from flask import Flask, render_template, request, jsonify
from api import ask_model, get_current_key_info

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    model_key = data.get("model")
    message = data.get("message")
    answer = ask_model(model_key, message)
    return jsonify({"answer": answer})

@app.route("/api/info")
def api_info():
    """Endpoint для получения информации о текущем API ключе"""
    info = get_current_key_info()
    return jsonify(info)

if __name__ == "__main__":
    app.run(debug=True)