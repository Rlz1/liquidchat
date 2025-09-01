from flask import Flask, render_template, request, jsonify
from api import ask_model

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

if __name__ == "__main__":
    app.run(debug=True)