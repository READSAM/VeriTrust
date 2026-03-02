from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from fastapi import FastAPI, HTTPException, File, UploadFile

# Import your actual service logic
from services.metadata_service import analyze_metadata_and_fingerprint
from services.forensic_service import generate_ela_heatmap
from services.neural_service import get_ai_score
from fusion_engine import calculate_fusion_verdict

app = FastAPI()

# Enable CORS so React can talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VerifyRequest(BaseModel):
    image_url: str

@app.post("/analyze-file")
async def analyze_local_file(file: UploadFile = File(...)):
    try:
        img_bytes = await file.read()
        
        # Call your services
        neural_score = get_ai_score(img_bytes)
        meta_results = analyze_metadata_and_fingerprint(img_bytes)
        heatmap_b64, maxdiff = generate_ela_heatmap(img_bytes)
        verdict_data = calculate_fusion_verdict(neural_score, meta_results, maxdiff)
        
        return {
            "confidence": verdict_data["score"], # Matches result.trustScore
            "verdict": verdict_data["verdict"],   # Matches result.verdictText
            "heatmap": f"data:image/png;base64,{heatmap_b64}",
            "metadata": {
                "software": meta_results["software"], # Matches result.origin.device
                "is_suspicious": meta_results["is_suspicious"], # Matches hasCameraTags
                "phash": meta_results["phash"],
                "flags": meta_results["flags"]
            },
            "neural": {"ai_probability": round(neural_score, 2)} # Matches result.label
        }
    except Exception as e:
        print(f"File Analysis Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))