import React from "react";
import { Card, Table } from "react-bootstrap";
import { Database, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { colors } from "../styles";

export function MetadataTable({ metadata = [] }) { // Default to empty array
  const getIcon = (status) => {
    if (status === "valid")
      return <CheckCircle size={18} className="text-success" />;
    if (status === "invalid")
      return <XCircle size={18} className="text-danger" />;
    return <AlertCircle size={18} className="text-warning" />;
  };

  return (
    <Card
      className="p-4 h-100 shadow-sm"
      style={{
        backgroundColor: colors.bgCard,
        border: `1px solid ${colors.borderSubtle}`,
        borderRadius: "12px",
      }}
    >
      <Card.Title className="h6 mb-4 d-flex align-items-center gap-2 text-primary">
        <Database size={18} /> Metadata Analysis
      </Card.Title>
      <Table
        hover
        variant="dark"
        className="align-middle bg-transparent border-0 small"
      >
        <thead className="border-bottom border-secondary">
          <tr style={{ color: colors.mutedText }}>
            <th className="bg-transparent border-0">Field</th>
            <th className="bg-transparent border-0">Value</th>
            <th className="bg-transparent border-0 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {/* Ensure metadata is an array before calling .map() */}
          {Array.isArray(metadata) && metadata.length > 0 ? (
            metadata.map((m, i) => (
              <tr
                key={i}
                style={{
                  backgroundColor:
                    m.status === "invalid"
                      ? "rgba(239, 68, 68, 0.1)"
                      : "transparent",
                }}
              >
                <td
                  className="bg-transparent border-0"
                  style={{ color: colors.textMain }}
                >
                  {m.field}
                </td>
                <td className="bg-transparent border-0">
                  <code
                    style={{
                      color: m.field?.includes("pHash")
                        ? "#6ea8fe"
                        : colors.textMain,
                      backgroundColor: "transparent",
                      fontFamily: "monospace",
                    }}
                  >
                    {m.value}
                  </code>
                </td>
                <td className="bg-transparent border-0 text-center">
                  {getIcon(m.status)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center py-4 text-muted">
                No metadata records found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Card>
  );
}