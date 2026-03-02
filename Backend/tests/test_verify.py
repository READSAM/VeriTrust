import pytest
import io
from fastapi.testclient import TestClient
from PIL import Image
from main import app 

client = TestClient(app)

def create_test_image(mode="RGB", size=(100, 100), color="red", format='JPEG'):
    """Generates a dummy image in memory for testing."""
    file = io.BytesIO()
    image = Image.new(mode, size, color)
    image.save(file, format)
    file.seek(0)
    return file

## --- TEST CASES ---

def test_verify_endpoint_real_image(requests_mock):
    """Test the full pipeline with a 'Real' JPEG scenario"""
    hf_url = "https://api-inference.huggingface.co/models/Nahrawy/AIorNot"
    mock_hf_response = [{"label": "Real", "score": 0.98}, {"label": "AI", "score": 0.02}]
    requests_mock.post(hf_url, json=mock_hf_response)

    test_url = "https://example-blob.vercel-storage.com/test_real.jpg"
    requests_mock.get(test_url, content=create_test_image().read())

    response = client.post("/analyze", json={"image_url": test_url})
    
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "Authentic"
    assert "heatmap" in data

def test_verify_endpoint_ai_png_no_exif(requests_mock):
    """Test AI scenario with a PNG (Ensures fix for _getexif error)"""
    hf_url = "https://api-inference.huggingface.co/models/Nahrawy/AIorNot"
    mock_hf_response = [{"label": "AI", "score": 0.95}, {"label": "Real", "score": 0.05}]
    requests_mock.post(hf_url, json=mock_hf_response)

    test_url = "https://example-blob.vercel-storage.com/test_ai.png"
    # Create PNG to test the metadata service attribute fix
    requests_mock.get(test_url, content=create_test_image(color="blue", format='PNG').read())

    response = client.post("/analyze", json={"image_url": test_url})
    
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "High Risk"
    assert "No embedded EXIF metadata found" in data["metadata"]["flags"]

def test_api_failure_fallback(requests_mock):
    """Ensures the backend returns a 0.5 neutral score if AIorNot times out"""
    hf_url = "https://api-inference.huggingface.co/models/Nahrawy/AIorNot"
    requests_mock.post(hf_url, status_code=504) # Simulate Timeout/Gateway Error

    test_url = "https://example-blob.vercel-storage.com/timeout.jpg"
    requests_mock.get(test_url, content=create_test_image().read())

    response = client.post("/analyze", json={"image_url": test_url})
    
    assert response.status_code == 200
    data = response.json()
    # Should fall back to 0.5 AI probability -> Caution verdict
    assert data["verdict"] == "Caution"