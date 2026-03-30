# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from GeminiWaterLeakAnalyzer import GeminiWaterLeakAnalyzer
import json
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max

analyzer = GeminiWaterLeakAnalyzer()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/analyze-leak', methods=['POST'])
def analyze_leak():
    """Endpoint to analyze leak image and billing data"""
    try:
        # Check if image is present
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type'}), 400
        
        # Save image temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Get billing data from request
        billing_data = request.form.get('billing_data')
        if billing_data:
            billing_data = json.loads(billing_data)
        else:
            billing_data = {}
        
        # Extract data for analyze_report method
        report_content = billing_data.get('report_content', '')
        consumption_records = billing_data.get('consumption_records', [])
        
        # Analyze with Gemini using the correct method
        result = analyzer.analyze_report(
            image_path=filepath,
            report_content=report_content,
            consumption_records=consumption_records
        )
        
        # Clean up uploaded file
        os.remove(filepath)
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Gemini AI Service is running'}), 200

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'service': 'Gemini Water Leak Analyzer',
        'version': '1.0.0',
        'endpoints': {
            '/analyze-leak': 'POST - Analyze leak image with billing data',
            '/health': 'GET - Health check'
        }
    })

if __name__ == '__main__':
    # Try different ports if 5000 is blocked
    ports = [5001, 5002, 5003, 8080, 8000]
    for port in ports:
        try:
            print(f"Attempting to start server on port {port}...")
            app.run(host='0.0.0.0', port=port, debug=True)
            break
        except OSError as e:
            print(f"Port {port} is busy: {e}")
            continue