from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from datetime import datetime
# Load environment variables
from dotenv import load_dotenv
import os

load_dotenv() 

app = Flask(__name__, static_folder='.')
CORS(app)

# Email Configuration
EMAIL_CONFIG = {
    "smtp_server": os.getenv("SMTP_SERVER"),
    "smtp_port": int(os.getenv("SMTP_PORT")),
    "sender_email": os.getenv("SENDER_EMAIL"),
    "sender_password": os.getenv("SENDER_PASSWORD"),
    "receiver_email": os.getenv("RECEIVER_EMAIL"),
}

@app.route('/')
def index():
    """Serve the main HTML file"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    """Serve static files"""
    return send_from_directory('.', path)

@app.route('/api/contact', methods=['POST'])
def contact():
    """Handle contact form submissions"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not all(k in data for k in ('name', 'email', 'message')):
            return jsonify({'error': 'Missing required fields'}), 400
        
        name = data['name']
        email = data['email']
        message = data['message']
        
        # Create email message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'Portfolio Contact: Message from {name}'
        msg['From'] = EMAIL_CONFIG['sender_email']
        msg['To'] = EMAIL_CONFIG['receiver_email']
        
        # Create HTML email body
        html_body = f"""
        <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                              color: white; padding: 20px; border-radius: 5px 5px 0 0; }}
                    .content {{ background: #f8f9fa; padding: 20px; }}
                    .field {{ margin-bottom: 15px; }}
                    .label {{ font-weight: bold; color: #667eea; }}
                    .footer {{ background: #e9ecef; padding: 15px; text-align: center; 
                              border-radius: 0 0 5px 5px; font-size: 12px; color: #6c757d; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>New Contact Form Submission</h2>
                    </div>
                    <div class="content">
                        <div class="field">
                            <div class="label">From:</div>
                            <div>{name}</div>
                        </div>
                        <div class="field">
                            <div class="label">Email:</div>
                            <div>{email}</div>
                        </div>
                        <div class="field">
                            <div class="label">Message:</div>
                            <div>{message}</div>
                        </div>
                        <div class="field">
                            <div class="label">Received:</div>
                            <div>{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</div>
                        </div>
                    </div>
                    <div class="footer">
                        Sent from Portfolio Contact Form
                    </div>
                </div>
            </body>
        </html>
        """
        
        # Create plain text alternative
        text_body = f"""
        New Contact Form Submission
        
        From: {name}
        Email: {email}
        Message: {message}
        Received: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        """
        
        # Attach both versions
        part1 = MIMEText(text_body, 'plain')
        part2 = MIMEText(html_body, 'html')
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email
        with smtplib.SMTP(EMAIL_CONFIG['smtp_server'], EMAIL_CONFIG['smtp_port']) as server:
            server.starttls()
            server.login(EMAIL_CONFIG['sender_email'], EMAIL_CONFIG['sender_password'])
            server.send_message(msg)
        
        # Log the submission (optional)
        log_contact(name, email, message)
        
        return jsonify({'success': True, 'message': 'Email sent successfully'}), 200
        
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return jsonify({'error': 'Failed to send email', 'details': str(e)}), 500

def log_contact(name, email, message):
    """Log contact form submissions to a file"""
    log_dir = 'contact_logs'
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    log_file = os.path.join(log_dir, 'contacts.txt')
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    with open(log_file, 'a', encoding='utf-8') as f:
        f.write(f"\n{'='*60}\n")
        f.write(f"Timestamp: {timestamp}\n")
        f.write(f"Name: {name}\n")
        f.write(f"Email: {email}\n")
        f.write(f"Message: {message}\n")
        f.write(f"{'='*60}\n")

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    }), 200

if __name__ == '__main__':
    print("Starting Flask server...")
    print("Portfolio website available at: http://localhost:5000")
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
