import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';
import { Container, Row, Col, Navbar, Card, Button, Spinner } from 'react-bootstrap';
import { ShieldCheck, BrainCircuit, ShieldAlert, Eye } from 'lucide-react';
import { colors } from './styles';

// Component Imports
import { FileDropzone } from './components/FileDropzone';
import { TrustScoreGauge } from './components/TrustScoreGauge';
import { MetadataTable } from './components/MetadataTable';
import { ActionButtons } from './components/ActionButtons';
import { OriginTracker } from './components/OriginTracker';
import { AIArtifactMap } from './components/AIArtifactMap';
import { StatusBadge } from './components/StatusBadge';

export default function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Inside App.jsx -> handleVerify
  const handleVerify = async (input) => {
    setIsScanning(true);
    setResult(null); // Clear previous results before starting

    const isFile = typeof input === 'object' && input !== null;
    const targetUrl = isFile ? URL.createObjectURL(input) : input;
    setPreviewUrl(targetUrl);
    
    try {
      let response;
      if (isFile) {
        const formData = new FormData();
        formData.append('file', input);
        response = await fetch('https://veritrust-ov9h.onrender.com/analyze-file', {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await fetch('https://veritrust-ov9h.onrender.com/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_url: input }),
        });
      }

      if (!response.ok) throw new Error("Backend connection failed");
      
      const data = await response.json();
      console.log("Backend Data received:", data); 

      // SETTING RESULT AND CLEARING SCANNING STATE
      setResult({
        trustScore: data.confidence ?? 0,
        label: data.neural?.ai_probability > 0.5 ? 'ai' : 'real', 
        verdictText: data.verdict ?? 'Analysis Complete',
        elaUrl: data.heatmap ?? '',
        origin: { 
          device: data.metadata?.software || 'Unknown Source', 
          hasCameraTags: data.metadata ? !data.metadata.is_suspicious : false 
        },
        metadata: [
          { field: 'Content pHash', value: data.metadata?.phash || 'N/A', status: 'valid' },
          { field: 'Software', value: data.metadata?.software || 'None', status: data.metadata?.is_suspicious ? 'invalid' : 'valid' }
        ]
      });
    } catch (error) {
      console.error("Verification Error:", error);
      alert("Failed to reach the VeriTrust Backend on Render. Check if the service is 'Live' and the URL is correct.");
    } finally {
      // THIS IS THE CRITICAL LINE: Stop the loading spinner
      setIsScanning(false); 
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: colors.bg, color: colors.white }}>
      <Navbar variant="dark" className="py-3 border-bottom border-secondary sticky-top" style={{ backgroundColor: colors.bg }}>
        <Container>
          <Navbar.Brand className="d-flex align-items-center gap-2 fw-bold">
            <ShieldCheck size={28} className="text-primary" /> VeriTrust
          </Navbar.Brand>
        </Container>
      </Navbar>

      <Container className="flex-grow-1 py-5">
        <FileDropzone onFileUpload={handleVerify} onUrlSubmit={handleVerify} isScanning={isScanning} previewUrl={previewUrl} />
        
        {isScanning && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <h4 className="fw-light opacity-75">Executing Multi-Layer Analysis...</h4>
          </div>
        )}

        {result && !isScanning && (
          <div className="animate-in">
            <h4 className="fw-bold mb-4 border-start border-primary border-4 ps-3 text-white">The Forensic Verdict</h4>
            <Card className="mb-5 overflow-hidden" style={{ backgroundColor: colors.bgCard, border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px' }}>
              <Row className="g-0 align-items-stretch">
                <Col lg={7} className="p-4 border-end border-secondary">
                  <div className="mb-4 d-flex flex-wrap gap-2">
                    <StatusBadge type={result.label === 'ai' ? 'ai-detected' : 'authentic'} />
                    <StatusBadge type={result?.origin?.hasCameraTags ? 'source-verified' : 'metadata-tampered'} />
                  </div>
                  <div className="p-3 rounded border-start border-4 border-danger" style={{ backgroundColor: colors.deepRedAccent }}>
                    <p className="mb-0 small text-danger fw-bold">Result: {result.verdictText}</p>
                  </div>
                </Col>
                <Col lg={5} className="py-4 bg-black bg-opacity-25">
                  <TrustScoreGauge score={result.trustScore} />
                </Col>
              </Row>
            </Card>

            <h4 className="fw-bold mb-4 ps-3 text-white">Evidence Layers</h4>
            <Row className="g-4 mb-5">
              <Col md={4}><AIArtifactMap imageUrl={previewUrl} elaUrl={result.elaUrl} /></Col>
              <Col md={4}><OriginTracker data={result.origin} /></Col>
              <Col md={4}>
                <Card className="p-4 h-100" style={{ backgroundColor: colors.bgCard, border: '1px solid rgba(255,255,255,0.15)' }}>
                  <BrainCircuit className="text-primary mb-3" size={32} />
                  <h2 className="display-6 fw-bold">{result?.label?.toUpperCase() ?? "PENDING"}</h2>
                  <p className="small text-muted">Neural Confidence: {result.trustScore}%</p>
                </Card>
              </Col>
              <Col md={12}><MetadataTable metadata={result.metadata} /></Col>
            </Row>
            <ActionButtons trustScore={result.trustScore} contentId="VER-2026-KIIT" />
          </div>
        )}
      </Container>

      <footer className="py-4 border-top border-secondary text-center mt-auto" style={{ backgroundColor: colors.bg }}>
        <p className="mb-0 fw-bold opacity-75 text-white">Made with ❤️ by Team CODRIX</p>
      </footer>
    </div>
  );
}
