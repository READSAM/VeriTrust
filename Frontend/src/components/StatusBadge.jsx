import React from 'react';
import { Badge } from 'react-bootstrap';
import { Bot, Database, Shield, Check, AlertTriangle } from 'lucide-react';

export function StatusBadge({ type }) {
  // Configuration mapping backend status keys to UI elements
  const badges = {
    'ai-detected': { 
      icon: Bot, 
      label: 'AI-Generated Detected', 
      color: 'danger' 
    },
    'metadata-tampered': { 
      icon: Database, 
      label: 'Metadata Tampered', 
      color: 'warning' 
    },
    'source-verified': { 
      icon: Check, 
      label: 'Source Verified', 
      color: 'success' 
    },
    'authentic': { 
      icon: Shield, 
      label: 'Authentic Content', 
      color: 'primary' 
    },
    'unverified': { 
      icon: AlertTriangle, 
      label: 'Unverified Content', 
      color: 'secondary' 
    }
  };

  const badge = badges[type] || badges['unverified'];
  const Icon = badge.icon;

  return (
    <Badge 
      bg={badge.color} 
      className={`bg-opacity-10 text-${badge.color} border border-${badge.color} rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 mb-2 me-2`}
      style={{ letterSpacing: '0.5px', fontSize: '0.75rem' }}
    >
      <Icon size={14} strokeWidth={2.5} />
      <span className="fw-bold text-uppercase">{badge.label}</span>
    </Badge>
  );
}