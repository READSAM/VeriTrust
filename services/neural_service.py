import time
import os
import requests

HF_API_URL = "https://api-inference.huggingface.co/models/Nahrawy/AIorNot"
HF_TOKEN = os.getenv("HF_TOKEN")

def get_ai_score(image_bytes):
    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/octet-stream" # Helps HF parse faster
    }
    
    # Try up to 3 times if the connection is reset
    for attempt in range(5):
        try:
            response = requests.post(
                HF_API_URL, 
                headers=headers, 
                data=image_bytes, 
                timeout=15 # Increased timeout
            )
            response.raise_for_status()
            data = response.json()
            return next((item['score'] for item in data if item['label'] == 'AI'), 0.5)
        
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout):
            if attempt < 2:
                time.sleep(1) # Wait a second before retrying
                continue
            return 0.5
    return 0.5