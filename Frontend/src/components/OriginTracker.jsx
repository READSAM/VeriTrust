import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { Smartphone, Calendar, ShieldCheck, AlertTriangle } from 'lucide-react';
import { colors } from '../styles';

export function OriginTracker({ data }) {
  // Defensive check: Provide fallbacks if data is undefined or missing properties
  const device = data?.device ?? "Detecting...";
  const hasCameraTags = data?.hasCameraTags ?? false;
  const analysisDate = data?.date ?? new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <Card 
      className="p-4 h-100 shadow-sm" 
      style={{ 
        backgroundColor: colors.bgCard, 
        border: `1px solid ${colors.borderSubtle}`,
        borderRadius: '12px'
      }}
    >
      <h6 className="text-primary mb-4 d-flex align-items-center gap-2 uppercase tracking-widest" style={{ fontSize: '0.8rem' }}>
        <Smartphone size={18} /> Origin Tracker
      </h6>
      
      <ListGroup variant="flush">
        {/* Device Tracking Section */}
        <ListGroup.Item className="bg-transparent border-0 px-0 mb-4 d-flex align-items-start gap-3">
          <div className={!hasCameraTags ? "text-warning" : "text-primary"}>
            <Smartphone size={20} />
          </div>
          <div className="flex-grow-1">
            <div style={{ color: colors.mutedText, fontSize: "0.7rem", fontWeight: 'bold' }} className="text-uppercase mb-1">
              Captured Device
            </div>
            <div style={{ color: colors.white, fontSize: "0.95rem" }} className="d-flex align-items-center gap-2 font-medium">
              {device}
              {!hasCameraTags ? (
                <AlertTriangle
                  size={16}
                  className="text-warning"
                  title="Metadata Guard: Missing EXIF"
                />
              ) : (
                <ShieldCheck size={16} className="text-success" />
              )}
            </div>
          </div>
        </ListGroup.Item>

        {/* Creation Date Section */}
        <ListGroup.Item className="bg-transparent border-0 px-0 mb-2 d-flex align-items-start gap-3">
          <div className="text-muted">
            <Calendar size={20} />
          </div>
          <div>
            <div style={{ color: colors.mutedText, fontSize: "0.7rem", fontWeight: 'bold' }} className="text-uppercase mb-1">
              Analysis Date
            </div>
            <div style={{ color: colors.white, fontSize: "0.95rem" }} className="font-medium">
              {analysisDate}
            </div>
          </div>
        </ListGroup.Item>
      </ListGroup>

      {/* Forensic Footer */}
      <div className="mt-auto pt-3 border-top border-secondary opacity-50">
        <div style={{ color: colors.mutedText, fontSize: '0.65rem' }} className="text-uppercase font-bold">
          Chain of Custody
        </div>
        <p className="small mb-0 mt-1" style={{ color: colors.mutedText, lineHeight: '1.2' }}>
          Verified via digital birth certificate protocols.
        </p>
      </div>
    </Card>
  );
}