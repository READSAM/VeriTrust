def calculate_fusion_verdict(neural_prob, meta_results,maxdiff):
    """
    neural_prob: 0.0 (Real) to 1.0 (AI)
    meta_results: dict containing 'flags', 'is_suspicious', etc.
    """
    s_neural = (1 - neural_prob) * 100
    s_meta = 20 if meta_results.get("is_suspicious")> 0 else 80
    s_ela = max(0,100-(maxdiff/2.55)) 
    

    trust_score = (s_neural * 0.30) + (s_ela * 0.40) + (s_meta * 0.30)
    
    # AGGRESSIVE SYNERGY PENALTY
    # If Neural > 70% and Metadata is suspicious, drop the score by 50% instead of 30%
    if neural_prob > 0.7 and meta_results.get("is_suspicious"):
        trust_score *= 0.5  # Changed from 0.7 to 0.5 to force "High Risk"
        
    final_score = round(max(min(trust_score, 100), 5), 2)
    
    # Labeling
    if final_score > 70:
        verdict, severity = "Authentic", "success"
    elif final_score > 45:
        verdict, severity = "Caution", "warning"
    else:
        verdict, severity = "High Risk", "danger"
        
    return {
        "score": final_score,
        "verdict": verdict,
        "severity": severity
    }