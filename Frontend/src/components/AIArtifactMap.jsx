import React, { useState } from "react";
import { Card, Button, ButtonGroup, OverlayTrigger, Tooltip } from "react-bootstrap";
import { BoxSelect, Info } from "lucide-react";
import { colors } from "../styles";

export function AIArtifactMap({ imageUrl, elaUrl, hotspots }) {
  const [view, setView] = useState("original"); // Layer 1: Forensic Vision

  return (
    <Card
      className="p-4 h-100 shadow-sm"
      style={{
        backgroundColor: colors.bgCard,
        border: `1px solid ${colors.borderSubtle}`,
        borderRadius: '12px'
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h6 className="text-primary mb-0 d-flex align-items-center gap-2">
          <BoxSelect size={18} /> Forensic Vision
        </h6>
        <ButtonGroup size="sm">
          <Button
            variant={view === "original" ? "primary" : "outline-secondary"}
            onClick={() => setView("original")}
          >
            Photo
          </Button>
          <Button
            variant={view === "ela" ? "danger" : "outline-secondary"}
            onClick={() => setView("ela")}
          >
            ELA Map
          </Button>
        </ButtonGroup>
      </div>
      
      <div
        className="position-relative bg-black rounded overflow-hidden"
        style={{ minHeight: "300px", border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <img
          src={view === "original" ? imageUrl : elaUrl} // Integrates backend heatmap
          className="img-fluid w-100 h-100"
          alt="Forensic View"
          style={{ objectFit: "contain", transition: 'opacity 0.3s ease-in-out' }}
        />
        
        {/* Dynamic Hotspots from Fusion Engine */}
        {hotspots?.map((spot, i) => (
          <OverlayTrigger
            key={i}
            placement="top"
            overlay={<Tooltip id={`spot-${i}`}>{spot.label} ({spot.confidence}%)</Tooltip>}
          >
            <div
              className="position-absolute pulse-red"
              style={{
                left: `${spot.x}%`,
                top: `${spot.y}%`,
                width: "16px",
                height: "16px",
                backgroundColor: "red",
                borderRadius: "50%",
                border: "2px solid white",
                cursor: 'pointer',
                transform: 'translate(-50%, -50%)' // Centers the spot on the coordinates
              }}
            />
          </OverlayTrigger>
        ))}
      </div>
      
      <div className="mt-3 d-flex align-items-center gap-2 text-muted small">
        <Info size={14} />
        <span>Toggle ELA Map to visualize pixel compression variance.</span>
      </div>
    </Card>
  );
}