import React from "react";
import Button from "./Button";
import { AssetGroup } from "../pages/ProjectPage";

interface AssetCardProps {
  asset: AssetGroup;
  editable: boolean;
  onChange: (updates: Partial<AssetGroup>) => void;
  onUpload: (type: "sheet" | "cutout", id: string) => void;
  onSave: () => void;
  onRemove: () => void;
}

export default function AssetCard({
  asset,
  editable,
  onChange,
  onUpload,
  onSave,
  onRemove,
}: AssetCardProps) {
  const fieldStyle: React.CSSProperties = {
    fontSize: "1rem",
    padding: "4px 0",
    minWidth: "8em",
  };

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "1em",
        marginBottom: "1em",
        borderRadius: "8px",
        backgroundColor: "#fafafa",
        display: "flex",
        flexDirection: "column",
        gap: "0.75em",
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
        Asset <span style={{ fontWeight: "normal" }}>{asset.id}</span>
      </div>

      {/* Section Field */}
      {editable ? (
        <input
          style={fieldStyle}
          type="text"
          placeholder="Section"
          value={asset.section || ""}
          onChange={(e) => onChange({ section: e.target.value })}
        />
      ) : (
        <div style={fieldStyle}>
          <strong>Section:</strong> {asset.section}
        </div>
      )}

      {/* Page Number Field */}
      {editable ? (
        <input
          style={fieldStyle}
          type="number"
          placeholder="Page Number"
          value={asset.pageNumber || ""}
          onChange={(e) => onChange({ pageNumber: e.target.value })}
        />
      ) : (
        <div style={fieldStyle}>
          <strong>Page Number:</strong> {asset.pageNumber}
        </div>
      )}

      {/* Images & Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "1.5em",
          marginTop: "1em",
          flexWrap: "wrap",
        }}
      >
        {/* Upload / Display Sheet */}
        <div style={{ textAlign: "center" }}>
          {editable && (
            <Button
              type="button"
              label={asset.sheet ? "Change Sheet" : "Upload Sheet"}
              onClick={() => onUpload("sheet", asset.id)}
            />
          )}
          {asset.sheet && (
            <div
              style={{
                marginTop: "0.5em",
                padding: "4px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                borderRadius: "4px",
              }}
            >
              <img
                src={`data:image/jpeg;base64,${asset.sheet}`}
                alt="Sheet"
                width={120}
                style={{ display: "block", borderRadius: "4px" }}
              />
            </div>
          )}
        </div>

        {/* Upload / Display Cutout */}
        <div style={{ textAlign: "center" }}>
          {editable && (
            <Button
              type="button"
              label={asset.cutout ? "Change Cutout" : "Upload Cutout"}
              onClick={() => onUpload("cutout", asset.id)}
            />
          )}
          {asset.cutout && (
            <div
              style={{
                marginTop: "0.5em",
                padding: "4px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                borderRadius: "4px",
              }}
            >
              <img
                src={`data:image/jpeg;base64,${asset.cutout}`}
                alt="Cutout"
                width={120}
                style={{ display: "block", borderRadius: "4px" }}
              />
            </div>
          )}
        </div>

        {/* Save / Remove Buttons */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "0.5em",
          }}
        >
          {editable && (
            <Button
              type="button"
              label="Save"
              onClick={onSave}
              disabled={
                !asset.pageNumber ||
                !asset.section ||
                !asset.sheet ||
                !asset.cutout
              }
            />
          )}
          <Button
            type="button"
            label={editable ? "Remove" : "Delete"}
            onClick={onRemove}
          />
        </div>
      </div>
    </div>
  );
}
