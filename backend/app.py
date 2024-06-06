from flask import Flask, request, jsonify, send_file
from openai import OpenAI
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Set your OpenAI API key here
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    raise ValueError("No API key found. Please set the OPENAI_API_KEY environment variable in your .env file.")
client = OpenAI(api_key=api_key)

@app.route('/')
def home():
    return "Welcome to the OpenAI PDF Generator API"

# Define the endpoint
@app.route('/generate', methods=['POST'])
def generate_pdf():
    data = request.json
    if 'query' not in data:
        return jsonify({"error": "Query not provided"}), 400

    query = data['query']

    # Generate text using ChatGPT
    response_text = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": query}
        ]
    )

    generated_text = response_text.choices[0].message.content

    # Generate an image using DALL-E
    response_image = client.images.generate(
        prompt=query,
        n=1,
        size="512x512"
    )

    image_url = response_image.data[0].url

    # Create a PDF
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    p.drawString(100, height - 100, "Generated Text:")
    p.drawString(100, height - 120, generated_text)
    p.drawString(100, height - 160, "Generated Image URL:")
    p.drawString(100, height - 180, image_url)

    p.save()

    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name='output.pdf', mimetype='application/pdf')

if __name__ == '__main__':
    app.run(debug=True)

