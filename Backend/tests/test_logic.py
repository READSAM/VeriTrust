import pytest
import io
from PIL import Image
from services.metadata_service import analyze_metadata_and_fingerprint
from services.forensic_service import generate_ela_heatmap
from fusion_engine import calculate_fusion_verdict

# --- Mock Data Generators ---
def create_test_image(format='JPEG', metadata=None):
    file = io.BytesIO()
    img = Image.new("RGB", (100, 100), "red")
    img.save(file, format=format)
    return file.getvalue()

## --- MODULE TESTS ---

def test_metadata_logic_no_exif():
    """Verifies that the metadata service correctly flags missing EXIF in PNGs."""
    img_bytes = create_test_image(format='PNG')
    results = analyze_metadata_and_fingerprint(img_bytes)
    
    assert "phash" in results
    assert results["is_suspicious"] is True
    assert any("No embedded EXIF" in f for f in results["flags"])

def test_forensic_ela_generation():
    img_bytes = create_test_image()
    heatmap_b64 = generate_ela_heatmap(img_bytes)
    
    # Now it will correctly be a string
    assert isinstance(heatmap_b64, str)

def test_fusion_engine_weighted_math():
    neural_prob = 0.9
    meta_results = {"is_suspicious": True, "flags": ["Edited"]}

    verdict = calculate_fusion_verdict(neural_prob, meta_results)

    # New Math: ((1-0.9)*55 + (30*0.30) + (20*0.15)) * 0.5
    # (5.5 + 9 + 3) * 0.5 = 17.5 * 0.5 = 8.75
    assert verdict["score"] < 20
    assert verdict["verdict"] == "High Risk"

def test_fusion_engine_authentic_scenario():
    """Tests the math for a clean, real image."""
    neural_prob = 0.05
    meta_results = {"is_suspicious": False, "flags": []}
    
    verdict = calculate_fusion_verdict(neural_prob, meta_results)
    
    assert verdict["score"] > 80
    assert verdict["verdict"] == "Authentic"