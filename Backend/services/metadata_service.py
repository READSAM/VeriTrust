from PIL import Image
from PIL.ExifTags import TAGS
import io
import imagehash

def analyze_metadata_and_fingerprint(image_bytes):
    # Ensure the image is opened correctly from bytes
    img = Image.open(io.BytesIO(image_bytes))
    
    # 1. Perceptual Hash (Digital Fingerprint/pHash)
    phash = str(imagehash.phash(img))
    
    # 2. Forensic Metadata Extraction
    flags = []
    exif_data = {}
    
    # Standard IDs for hardware/software auditing
    SOFTWARE_TAG_ID = 305
    
    # Standard Pillow method to get the EXIF object
    exif = img.getexif()
    
    if exif:
        # Iterate through Tag IDs and map to names
        for tag_id, value in exif.items():
            tag_name = TAGS.get(tag_id, tag_id)
            exif_data[tag_name] = str(value)
            
            # Signature Check for AI/Editing Software
            if tag_name == "Software" or tag_id == SOFTWARE_TAG_ID:
                soft = str(value).lower()
                if any(x in soft for x in ["adobe", "photoshop", "firefly", "midjourney", "dall-e"]):
                    flags.append(f"Edited with {value}")
                    
        # Hardware Check (Make, Model, DateTime)
        camera_indicators = ["Make", "Model", "DateTime"]
        if not any(k in exif_data for k in camera_indicators):
            flags.append("Missing hardware tags (AI-gen characteristic)")
    else:
        flags.append("No embedded EXIF metadata found")

    # is_suspicious: Boolean for Fusion Engine logic
    return {
        "phash": phash,
        "software": exif_data.get("Software", "None Detected"),
        "flags": flags,
        "is_suspicious": len(flags) 
    }
