from flask import Flask, request, jsonify, send_file
from openai import OpenAI
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from io import BytesIO
from PIL import Image
import requests
import os
from dotenv import load_dotenv
import textwrap

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Set your OpenAI API key here
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    raise ValueError("No API key found. Please set the OPENAI_API_KEY environment variable in your .env file.")
client = OpenAI(api_key=api_key)

# Function to bin the text by wrapping
def bin_text(text, max_width):
    wrapped_text = textwrap.wrap(text, width=max_width)
    return wrapped_text

def draw_text(canvas, text_list, x, y, line_height):
    for line in text_list:
        canvas.drawString(x, y, line)
        y -= line_height
    return y

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
            {"role": "system", "content": "You are a helpful assistant and can create text upto maximum of 300 words"},
            {"role": "user", "content": query}
        ]
    )

    generated_text = response_text.choices[0].message.content

    # Generate an image using DALL-E
    response_image = client.images.generate(
        model="dall-e-3",
        prompt=query,
        size="1024x1024",
        quality="standard",
        n=1
    )

    image_data = requests.get(response_image.data[0].url).content
    image = image = Image.open(BytesIO(image_data))

    # Create a PDF
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    max_width = 100
    line_height = 15

    x = 40
    image_ht = 256
    y = 100

    p.drawString(40, height - 50, "Generated Images:")
    p.drawInlineImage(image, 40, height - y - image_ht, width=256, height=256)
    y += image_ht
    
    p.drawString(x, height - y - 50, "Generated Text:")
    wrapped_text = bin_text(generated_text, max_width)
    draw_text(p, wrapped_text, x, height - y - 100, line_height)

    p.save()
    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name='output.pdf', mimetype='application/pdf')

if __name__ == '__main__':
    app.run(debug=True)
