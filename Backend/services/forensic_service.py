# services/forensic_service.py
import io
import base64
from PIL import Image, ImageChops, ImageEnhance

def generate_ela_heatmap(image_bytes, quality=90):
    original = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    
    # Resave and find difference
    temp_io = io.BytesIO()
    original.save(temp_io, format='JPEG', quality=quality)
    temp_io.seek(0)
    temporary = Image.open(temp_io)

    ela_image = ImageChops.difference(original, temporary)
    
    # --- EXTRACT NUMERICAL VALUE HERE ---
    extrema = ela_image.getextrema()
    # Calculate the max pixel difference found (0 to 255)
    max_diff = max([ex[1] for ex in extrema])
    
    # Normalize max_diff to a 0-100 scale for the Fusion Engine
    forensic_score = (max_diff / 255.0) * 100
    
    # Prepare visual for Frontend
    scale = 255.0 / max_diff if max_diff != 0 else 1
    ela_enhanced = ImageEnhance.Brightness(ela_image).enhance(scale)
    
    buffered = io.BytesIO()
    ela_enhanced.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return img_str, forensic_score