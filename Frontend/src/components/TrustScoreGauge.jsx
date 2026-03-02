import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { colors } from '../styles'; // Ensure this matches your file structure
import { AlertCircle, ShieldCheck, AlertTriangle } from 'lucide-react';

export function TrustScoreGauge({ score }) {
  // Data mapping for the gauge: [Authenticity Level, Remaining Track]
  const data = [
    { value: score }, 
    { value: 100 - score }
  ];

  // Dynamic status logic to match VeriTrust thresholds
  const getStatus = (s) => {
    if (s > 70) return { label: 'Authentic Content', color: '#10b981', icon: <ShieldCheck size={16} />, bg: 'rgba(16, 185, 129, 0.1)' };
    if (s > 45) return { label: 'Caution Required', color: '#f59e0b', icon: <AlertTriangle size={16} />, bg: 'rgba(245, 158, 11, 0.1)' };
    return { label: 'High Risk of Forgery', color: colors.errorRed, icon: <AlertCircle size={16} />, bg: 'rgba(239, 68, 68, 0.1)' };
  };

  const status = getStatus(score);
  const activeColor = status.color;

  return (
    <div className="text-center p-3 h-100 d-flex flex-column justify-content-center animate-in fade-in duration-700">
      <h6 className="text-muted text-uppercase small fw-bold mb-4" style={{ letterSpacing: '2px', fontSize: '0.7rem' }}>
        Authenticity Confidence
      </h6>
      
      <div style={{ width: '100%', height: 220, position: 'relative' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie 
              data={data} 
              cx="50%" 
              cy="50%" 
              innerRadius={75} 
              outerRadius={95} 
              startAngle={90} 
              endAngle={-270} 
              dataKey="value" 
              stroke="none"
              animationBegin={0}
              animationDuration={1500}
            >
              {/* Active segment with glow effect */}
              <Cell fill={activeColor} style={{ filter: `drop-shadow(0 0 12px ${activeColor}66)` }} />
              {/* Background track */}
              <Cell fill={colors.deepMaroon} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Centered Percentage */}
        <div className="position-absolute top-50 start-50 translate-middle text-center">
          <h1 className="fw-black m-0" style={{ fontSize: '3.5rem', color: colors.white, lineHeight: 1, letterSpacing: '-2px' }}>
            {score}<span style={{ fontSize: '1.2rem', opacity: 0.6, marginLeft: '2px' }}>%</span>
          </h1>
        </div>
      </div>

      {/* Dynamic Status Pill */}
      <div className="mt-4 py-2 px-4 rounded-pill mx-auto d-inline-flex align-items-center gap-2 border transition-all" 
           style={{ 
             backgroundColor: status.bg, 
             color: status.color, 
             fontSize: '0.75rem',
             borderColor: `${status.color}33` 
           }}>
        {status.icon} 
        <span className="fw-bold text-uppercase tracking-wider">{status.label}</span>
      </div>
    </div>
  );
}