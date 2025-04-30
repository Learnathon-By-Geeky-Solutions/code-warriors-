import os
import json
import faiss
import numpy as np
from nltk.tokenize import sent_tokenize
from transformers import BertTokenizer, BertModel
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from flask_cors import CORS
import requests
import pandas as pd
import zipfile
import fitz  # PyMuPDF for PDF processing

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

load_dotenv()

api_key = os.getenv('gemini_api_key')
url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'pdf', 'csv', 'xls', 'xlsx', 'zip', 'txt', 'java', 'cpp', 'py', 'js', 'html', 'css', 'xml', 'json', 'properties'}

# Utility functions for file extraction
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_path):
    text = ""
    with fitz.open(file_path) as pdf:
        for page in pdf:
            text += page.get_text()
    return text

def extract_text_from_csv(file_path):
    df = pd.read_csv(file_path)
    return df.to_string()

def extract_text_from_excel(file_path):
    try:
        # Determine the file extension
        if file_path.endswith('.xls'):
            engine = 'xlrd'
        elif file_path.endswith('.xlsx'):
            engine = 'openpyxl'
        else:
            return "Unsupported file format."

        # Read the Excel file
        df = pd.read_excel(file_path, engine=engine)
        return df.to_string()
    except Exception as e:
        print(f"Error reading Excel file: {e}")
        return ""

def extract_text_from_zip(file_path):
    text = ""
    with zipfile.ZipFile(file_path, 'r') as zip_ref:
        extract_dir = os.path.join(UPLOAD_FOLDER, "extracted")
        os.makedirs(extract_dir, exist_ok=True)
        zip_ref.extractall(extract_dir)

        for file_name in os.listdir(extract_dir):
            full_path = os.path.join(extract_dir, file_name)
            print(f"Processing file: {file_name}")  # Debug: Print the file being processed

            # Skip binary files (e.g., images, executables)
            if file_name.endswith(('.png', '.jpg', '.jpeg', '.gif', '.exe', '.bin')):
                print(f"Skipping binary file: {file_name}")
                continue

            # Handle text-based code files
            if file_name.endswith(('.txt', '.java', '.cpp', '.py', '.js', '.html', '.css', '.xml', '.json')):
                with open(full_path, 'r', encoding='utf-8') as f:
                    try:
                        text += f.read() + "\n"  # Add a newline between files
                    except UnicodeDecodeError:
                        print(f"Skipping file due to encoding issues: {file_name}")
            elif file_name.endswith('.pdf'):
                text += extract_text_from_pdf(full_path)
            elif file_name.endswith('.csv'):
                text += extract_text_from_csv(full_path)
            elif file_name.endswith(('.xls', '.xlsx')):
                text += extract_text_from_excel(full_path)
            else:
                print(f"Skipping unsupported file: {file_name}")  # Debug: Print unsupported files

    if not text:
        print("No text extracted from the zip file.")  # Debug: Print if no text is extracted
        return ""  # Return an empty string instead of None

    return text

# Document processing functions
def split_document(doc, chunk_size=5):
    if not doc:
        return []  # Return an empty list if the document is empty

    sentences = sent_tokenize(doc)
    print(f"Total sentences: {len(sentences)}")  # Debug: Print the number of sentences
    chunks = [' '.join(sentences[i:i + chunk_size]) for i in range(0, len(sentences), chunk_size)]
    print(f"Total chunks: {len(chunks)}")  # Debug: Print the number of chunks
    return chunks

def generate_embeddings(chunks):
    tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
    model = BertModel.from_pretrained('bert-base-uncased')
    embeddings = []
    for chunk in chunks:
        inputs = tokenizer(chunk, return_tensors='pt', truncation=True, max_length=512, padding='max_length')
        outputs = model(**inputs)
        embeddings.append(outputs.last_hidden_state.mean(dim=1).detach().numpy())
    return embeddings

def save_to_faiss(context_id, embeddings, chunks):
    index_file = f"{context_id}_index.faiss"
    chunks_file = f"{context_id}_chunks.json"

    # Load or create FAISS index
    if os.path.exists(index_file):
        index = faiss.read_index(index_file)
    else:
        index = faiss.IndexFlatL2(embeddings[0].shape[1])

    index.add(np.vstack(embeddings))
    faiss.write_index(index, index_file)

    # Save chunks
    if os.path.exists(chunks_file):
        with open(chunks_file, "r") as file:
            existing_chunks = json.load(file)
    else:
        existing_chunks = []

    existing_chunks.extend(chunks)

    with open(chunks_file, "w") as file:
        json.dump(existing_chunks, file)

def get_context_from_faiss(context_id, query_embedding, k=5):
    index_file = f"{context_id}_index.faiss"
    chunks_file = f"{context_id}_chunks.json"

    if not os.path.exists(index_file) or not os.path.exists(chunks_file):
        return None, None

    index = faiss.read_index(index_file)
    distances, indices = index.search(query_embedding, k)

    with open(chunks_file, "r") as file:
        chunks = json.load(file)

    relevant_chunks = [chunks[i] for i in indices[0] if i < len(chunks)]
    return relevant_chunks, distances[0]

def embed_query(query):
    tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
    model = BertModel.from_pretrained('bert-base-uncased')
    inputs = tokenizer(query, return_tensors='pt', truncation=True, max_length=512, padding='max_length')
    outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).detach().numpy()

def query_gemini(relevant_chunks, query):
    prompt = f"Context:\n{' '.join(relevant_chunks)}\n\nQuestion: {query}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [
            {"parts": [{"text": prompt}]}
        ]
    }

    response = requests.post(f"{url}?key={api_key}", headers=headers, data=json.dumps(payload))
    return response.json()

# Routes for file upload and context management
@app.route('/upload/<context_id>', methods=['POST'])
def upload_file(context_id):
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Process the file
        if filename.endswith('.pdf'):
            content = extract_text_from_pdf(file_path)
        elif filename.endswith('.csv'):
            content = extract_text_from_csv(file_path)
        elif filename.endswith(('.xls', '.xlsx')):
            content = extract_text_from_excel(file_path)
        elif filename.endswith('.zip'):
            content = extract_text_from_zip(file_path)
            if not content:  # Check if content is empty
                return jsonify({'error': 'No text extracted from the zip file'}), 400
        elif filename.endswith('.txt'):
            with open(file_path, 'r') as f:
                content = f.read()
        else:
            return jsonify({'error': 'Unsupported file type'}), 400

        # Process the content
        split_documents = split_document(content)
        embeddings = generate_embeddings(split_documents)
        save_to_faiss(context_id, embeddings, split_documents)

        return jsonify({'status': f'File uploaded and processed for context ID {context_id}'}), 200

    return jsonify({'error': 'Invalid file format'}), 400

@app.route('/context/<context_id>', methods=['POST'])
def add_context(context_id):
    request_data = request.get_json()
    if not request_data or 'context' not in request_data:
        return jsonify({'error': 'Context data is missing'}), 400

    split_documents = split_document(request_data['context'])
    embeddings = generate_embeddings(split_documents)
    save_to_faiss(context_id, embeddings, split_documents)
    return jsonify({'status': f'Context added successfully for context ID {context_id}'}), 200

@app.route('/query/<context_id>', methods=['POST'])
def get_response(context_id):
    request_data = request.get_json()
    if not request_data or 'query' not in request_data:
        return jsonify({'error': 'Query parameter is missing'}), 400

    query = request_data['query']
    query_embedding = embed_query(query)

    # Retrieve initial 5 embeddings
    relevant_chunks, distances = get_context_from_faiss(context_id, query_embedding, k=5)

    if distances is not None and distances.size > 0 and np.max(distances) > 1.0:  # Adjust threshold as needed
        relevant_chunks, _ = get_context_from_faiss(context_id, query_embedding, k=10)

    if not relevant_chunks:
        return jsonify({'error': f'No context found for context ID {context_id}'}), 404

    response = query_gemini(relevant_chunks, query)
    return jsonify(response), 200

# Generic function to save context
@app.route('/save/<context_type>/<context_id>', methods=['POST'])
def save_context(context_type, context_id):
    request_data = request.get_json()
    if not request_data or 'context' not in request_data:
        return jsonify({'error': 'Context data is missing'}), 400

    split_documents = split_document(request_data['context'])
    embeddings = generate_embeddings(split_documents)
    save_to_faiss(f"{context_type}_{context_id}", embeddings, split_documents)
    return jsonify({'status': f'Context added successfully for {context_type} ID {context_id}'}), 200

# Generic function to query context
@app.route('/query/<context_type>/<context_id>', methods=['POST'])
def query_context(context_type, context_id):
    request_data = request.get_json()
    if not request_data or 'query' not in request_data:
        return jsonify({'error': 'Query parameter is missing'}), 400

    query = request_data['query']
    query_embedding = embed_query(query)

    # Retrieve initial 5 embeddings
    relevant_chunks, distances = get_context_from_faiss(f"{context_type}_{context_id}", query_embedding, k=5)

    # If distances are too high, retrieve more embeddings
    if distances and max(distances) > 1.0:  # Adjust threshold as needed
        relevant_chunks, _ = get_context_from_faiss(f"{context_type}_{context_id}", query_embedding, k=10)

    if not relevant_chunks:
        return jsonify({'error': f'No context found for {context_type} ID {context_id}'}), 404

    response = query_gemini(relevant_chunks, query)
    return jsonify(response), 200

if __name__ == '__main__':
    app.run(debug=True)