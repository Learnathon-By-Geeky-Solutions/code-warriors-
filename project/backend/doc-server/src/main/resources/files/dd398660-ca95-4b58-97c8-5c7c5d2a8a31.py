import os
import json
import faiss
import numpy as np
from nltk.tokenize import sent_tokenize
from transformers import BertTokenizer, BertModel
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
import requests
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

load_dotenv()

api_key = os.getenv('gemini_api_key')
url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"

app = Flask(__name__)
CORS(app)

# Utility functions
def split_document(doc, chunk_size=5):
    sentences = sent_tokenize(doc)
    return [' '.join(sentences[i:i + chunk_size]) for i in range(0, len(sentences), chunk_size)]

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

    print(f"Data saved for context ID: {context_id}")

def get_context_from_faiss(context_id, query_embedding):
    index_file = f"{context_id}_index.faiss"
    chunks_file = f"{context_id}_chunks.json"

    if not os.path.exists(index_file) or not os.path.exists(chunks_file):
        return None, None

    index = faiss.read_index(index_file)
    distances, indices = index.search(query_embedding, k=5)

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
    prompt = f"Context:\n{relevant_chunks}\n\nQuestion: {query}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [
            {"parts": [{"text": prompt}]}
        ]
    }

    response = requests.post(f"{url}?key={api_key}", headers=headers, data=json.dumps(payload))
    return response.json()



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

    relevant_chunks, distances = get_context_from_faiss(context_id, query_embedding)
    if not relevant_chunks:
        return jsonify({'error': f'No context found for context ID {context_id}'}), 404

    response = query_gemini(relevant_chunks, query)
    return jsonify(response), 200

if __name__ == '_main_':
    app.run(debug=True)