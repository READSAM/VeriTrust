import React from 'react';
import { Card, ListGroup, Alert } from 'react-bootstrap';
import { Newspaper, ExternalLink, CheckCircle2, XCircle, Info } from 'lucide-react';
import { colors } from '../styles';

export function SourceLineage({ sources = [] }) {
  // Calculate verification ratio for the summary alert
  const verifiedCount = sources.filter(s => s.verified).length;
  const totalCount = sources.length;
  const isHighTrust = totalCount > 0 && verifiedCount / totalCount >= 0.5;

  return (
    <Card
      className="p-4 h-100 shadow-sm"
      style={{
        backgroundColor: colors.bgCard,
        border: "1px solid rgba(255, 255, 255, 0.15)",
        borderRadius: "12px",
      }}
    >
      <Card.Title className="h6 mb-4 d-flex align-items-center gap-2 text-success uppercase tracking-widest">
        <Newspaper size={18} /> Source Lineage
      </Card.Title>

      {/* Dynamic Trust Alert */}
      <Alert
        className="border-0 small mb-4 py-2"
        style={{ 
          backgroundColor: isHighTrust ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", 
          color: isHighTrust ? "#10b981" : "#ef4444" 
        }}
      >
        <div className="d-flex align-items-center gap-2">
          <Info size={14} />
          <strong>{verifiedCount} of {totalCount}</strong> trusted news outlets have published related content
        </div>
      </Alert>

      <ListGroup variant="flush" className="flex-grow-1">
        {sources.length > 0 ? (
          sources.map((source, index) => (
            <ListGroup.Item
              key={index}
              className="bg-transparent border-bottom border-secondary px-0 py-3 d-flex justify-content-between align-items-center"
            >
              <div className="d-flex align-items-center gap-3">
                {source.verified ? (
                  <CheckCircle2 size={18} className="text-success" />
                ) : (
                  <XCircle size={18} className="text-muted opacity-50" />
                )}
                <div>
                  <div className="fw-bold small text-white">{source.name}</div>
                  {source.publishDate && (
                    <div className="text-muted" style={{ fontSize: '0.65rem' }}>
                      Ref: {source.publishDate}
                    </div>
                  )}
                </div>
              </div>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="small text-primary text-decoration-none d-flex align-items-center gap-1 hover-link"
              >
                View <ExternalLink size={12} />
              </a>
            </ListGroup.Item>
          ))
        ) : (
          <div className="text-center py-4 text-muted small italic">
            No external source records found.
          </div>
        )}
      </ListGroup>

      {/* C2PA Standards Note */}
      <div
        className="mt-4 p-3 rounded small"
        style={{
          backgroundColor: "#131111",
          border: "1px solid rgba(255,255,255,0.05)",
          color: colors.mutedText,
          fontSize: '0.7rem'
        }}
      >
        <strong className="text-white">Cross-Reference:</strong> Claims verified against established
        sources using <span className="text-primary">C2PA v1.3</span> content credentials.
      </div>
    </Card>
  );
}