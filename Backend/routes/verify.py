from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import io
from services.metadata_service import analyze_metadata_and_fingerprint
from services.forensic_service import generate_ela_heatmap
from services.neural_service import get_ai_score
from fusion_engine import calculate_fusion_verdict

router = APIRouter()

class VerifyRequest(BaseModel):
    image_url: str

@router.post("/analyze")
async def analyze_image(request: VerifyRequest):
    try:
        # 1. Fetch from Vercel Blob
        resp = requests.get(request.image_url, timeout=10)
        resp.raise_for_status()
        image_bytes = resp.content

        # 2. Run Triple-Signal Fusion
        neural_score = get_ai_score(image_bytes)
        meta_results = analyze_metadata_and_fingerprint(image_bytes)
        heatmap_b64 = generate_ela_heatmap(image_bytes)

        # 3. Calculate Weighted Verdict
        verdict_data = calculate_fusion_verdict(neural_score, meta_results)
        
        return {
            "verdict": verdict_data["verdict"],
            "confidence": verdict_data["score"],
            "severity": verdict_data["severity"],
            "metadata": {
                "software": meta_results["software"],
                "fingerprint": meta_results["phash"],
                "flags": meta_results["flags"]
            },
            "neural": {
                "ai_probability": round(neural_score, 2)
            },
            "heatmap": f"data:image/png;base64,{heatmap_b64}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))