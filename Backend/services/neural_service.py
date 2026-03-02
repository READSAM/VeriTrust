import requests
import time
import os

# Use a more stable, active model endpoint
API_URL = "https://api-inference.huggingface.co/models/umm-yahya/resnet50-deepfake-vs-real"
# Ensure your API token is set in your environment variables
HEADERS = {"Authorization": f"Bearer {os.getenv('HF_API_TOKEN')}"}

def get_ai_score(img_bytes):
    try:
        response = requests.post(API_URL, headers=HEADERS, data=img_bytes, timeout=15)
        
        # Handle model loading (503) or other API shifts
        if response.status_code == 503:
            time.sleep(2) # Wait for model to load
            response = requests.post(API_URL, headers=HEADERS, data=img_bytes, timeout=15)
            
        response.raise_for_status()
        result = response.json()
        
        # ResNet50 usually returns a list of labels/scores
        # Filter for the 'AI' or 'Synthetic' label probability
        for prediction in result:
            if prediction['label'].lower() in ['ai', 'synthetic', 'fake']:
                return prediction['score']
                
        return 0.05 # Default low score if no 'AI' label found
    except Exception as e:
        print(f"Neural Service Error: {e}")
        return 0.5  # Neutral fallback to prevent backend crash