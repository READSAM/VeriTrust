import os
import requests
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# 1. Internal Service Imports
from services.metadata_service import analyze_metadata_and_fingerprint
from services.forensic_service import generate_ela_heatmap
from services.neural_service import get_ai_score
from fusion_engine import calculate_fusion_verdict

# 2. INITIALIZE APP BEFORE ROUTES (This fixes your error)
app = FastAPI()

# 3. Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class VerifyRequest(BaseModel):
    image_url: str

# 4. Define Routes
@app.get("/")
def health_check():
    return {"status": "online", "engine": "Triple-Signal Fusion"}

@app.post("/analyze-file")
async def analyze_local_file(file: UploadFile = File(...)):
    try:
        # Read the local file bytes
        img_bytes = await file.read()

        # Neural Signal (AIorNot)
        neural_score = get_ai_score(img_bytes)
        
        # Metadata/Identity Signal (includes pHash)
        meta_results = analyze_metadata_and_fingerprint(img_bytes)
        
        # Forensic Signal (ELA Heatmap)
        heatmap_b64,maxdiff = generate_ela_heatmap(img_bytes)

        # Global Decision Fusion
        verdict_data = calculate_fusion_verdict(neural_score, meta_results,maxdiff)
        
        return {
            "verdict": verdict_data["verdict"],
            "confidence": verdict_data["score"],
            "severity": verdict_data["severity"],
            "metadata": {
                "software": meta_results["software"],
                "fingerprint": meta_results["phash"],
                "flags": meta_results["flags"]
            },
            "neural": {"ai_probability": round(neural_score, 2)},
            "heatmap": f"data:image/png;base64,{heatmap_b64}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze")
async def analyze_image(request: VerifyRequest):
    try:
        resp = requests.get(request.image_url, timeout=10)
        resp.raise_for_status()
        img_bytes = resp.content

        neural_score = get_ai_score(img_bytes)
        meta_results = analyze_metadata_and_fingerprint(img_bytes)
        heatmap_b64 ,maxdiff= generate_ela_heatmap(img_bytes)
        verdict_data = calculate_fusion_verdict(neural_score, meta_results,maxdiff)
        
        return {
            "verdict": verdict_data["verdict"],
            "confidence": verdict_data["score"],
            "severity": verdict_data["severity"],
            "heatmap": f"data:image/png;base64,{heatmap_b64}",
            "metadata": {
                "software": meta_results["software"],
                "fingerprint": meta_results["phash"],
                "flags": meta_results["flags"]
            },
            "neural": {"ai_probability": round(neural_score, 2)}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))