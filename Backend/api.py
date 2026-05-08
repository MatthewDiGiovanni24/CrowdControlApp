import io
import os

from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image, UnidentifiedImageError

from vision import count_people

app = Flask(__name__)
CORS(app)


def get_level(count: int) -> str:
    if count >= 31:
        return "High"
    if count >= 16:
        return "Medium"
    return "Low"


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Crowd Control API is running"})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]

    if not file or file.filename == "":
        return jsonify({"error": "Empty file upload"}), 400

    try:
        img_bytes = file.read()

        if not img_bytes:
            return jsonify({"error": "Uploaded file is empty"}), 400

        Image.open(io.BytesIO(img_bytes)).verify()
        image = Image.open(io.BytesIO(img_bytes)).convert("RGB")

        count = count_people(image)
        level = get_level(count)

        return jsonify({"level": level})

    except UnidentifiedImageError:
        return jsonify({"error": "Invalid image file"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=5000, debug=debug, threaded=True)