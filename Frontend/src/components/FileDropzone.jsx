import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, Form, Button, InputGroup } from "react-bootstrap";
import { Upload, Link, Image as ImageIcon } from "lucide-react";
import { colors } from "../styles";

export function FileDropzone({
  onFileUpload,
  onUrlSubmit,
  isScanning,
  previewUrl,
}) {
  // Handles local file drops
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0 && !isScanning) {
        onFileUpload(acceptedFiles[0]);
      }
    },
    [onFileUpload, isScanning]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".png", ".jpg", ".webp"] },
    multiple: false,
    disabled: isScanning,
  });

  // Handles URL submissions from the input bar
  const handleUrlForm = (e) => {
    e.preventDefault();
    const url = e.target.elements.urlInput.value;
    if (url && !isScanning) onUrlSubmit(url);
  };

  return (
    <Card
      className="shadow-sm border-0 p-5 text-center mb-4"
      style={{ 
        backgroundColor: colors.bgCard, 
        border: `1px solid ${colors.borderSubtle}`,
        borderRadius: '12px'
      }}
    >
      {/* Drag and Drop Area */}
      <div
        {...getRootProps()}
        className={`border border-2 border-dashed rounded-3 p-5 mb-4 position-relative transition-all ${
          isDragActive ? "border-primary scale-95" : "border-secondary"
        }`}
        style={{
          cursor: isScanning ? "not-allowed" : "pointer",
          backgroundColor: isDragActive
            ? "rgba(43, 68, 255, 0.05)"
            : "rgba(255, 255, 255, 0.02)",
        }}
      >
        <input {...getInputProps()} />
        
        {previewUrl ? (
          <div className="position-relative d-inline-block">
            <img
              src={previewUrl}
              className="img-fluid rounded shadow-lg"
              style={{ maxHeight: "300px", border: `1px solid ${colors.borderSubtle}` }}
              alt="Preview"
            />
            {isScanning && (
               <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded bg-black bg-opacity-50">
                 <div className="spinner-grow text-primary" role="status"></div>
               </div>
            )}
          </div>
        ) : (
          <div className="py-4">
            <Upload size={54} className="text-primary mb-3 opacity-75" />
            <h4 className="text-white font-bold">
              {isDragActive ? "Drop it here!" : "Verification Dropzone"}
            </h4>
            <p className="text-muted small">
              Drag content here or click to browse
            </p>
          </div>
        )}
      </div>

      {/* URL Submission Bar */}
      <Form onSubmit={handleUrlForm}>
        <InputGroup size="lg" className="shadow-sm">
          <InputGroup.Text className="bg-dark border-secondary text-muted">
            <Link size={18} />
          </InputGroup.Text>
          <Form.Control
            name="urlInput"
            className="bg-dark border-secondary text-white focus-none"
            placeholder="Paste image or article URL..."
            style={{ backgroundColor: "#131111" }}
            disabled={isScanning}
          />
          <Button
            variant="primary"
            type="submit"
            className="px-5 fw-bold"
            disabled={isScanning}
          >
            {isScanning ? "Scanning..." : "Verify"}
          </Button>
        </InputGroup>
      </Form>
      
      <div className="mt-3 text-start">
        <span className="text-muted small d-flex align-items-center gap-1">
          <ImageIcon size={12} /> Supported formats: JPEG, PNG, JPG, WEBP
        </span>
      </div>
    </Card>
  );
}