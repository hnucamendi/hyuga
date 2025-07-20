import React from "react";
import Button from "./Button"; // your existing Button component
import { AssetGroup } from "../pages/ProjectPage";

interface AssetCardProps {
  asset: AssetGroup;
  onChange: (updates: Partial<AssetGroup>) => void;
  onUpload: (type: "sheet" | "cutout", id: string) => void;
  onSave: () => void;
  onRemove: () => void;
}

export default function AssetCard({
  asset,
  onChange,
  onRemove,
}: AssetCardProps) {
  const fieldStyle: React.CSSProperties = {
    padding: "8px 12px",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "none",
    outline: "none",
    transition: "border-color 0.2s",
    minWidth: "6em",
    background: "transparent",
  };
  return (
    <div
      style={{ border: "1px solid #ddd", padding: "1em", marginBottom: "1em" }}
    >
      <div>
        <strong>Asset {asset.id}</strong>
      </div>

      <div style={{ ...fieldStyle, padding: "8px 0" }}>
        <span style={{ fontWeight: "bold", marginRight: "0.5em" }}>
          Section:
        </span>
        {asset.section}
      </div>

      <div style={{ ...fieldStyle, padding: "8px 0" }}>
        <span style={{ fontWeight: "bold", marginRight: "0.5em" }}>
          Page Number:
        </span>
        {asset.pageNumber}
      </div>

      <div style={{ display: "flex", gap: "1em", marginTop: ".5em" }}>
        <div>
          {asset.sheet && (
            <img
              src={`data:image/jpeg;base64,${asset.sheet}`}
              alt="Sheet"
              width={80}
            />
          )}
        </div>

        <div>
          {asset.cutout && (
            <img
              src={`data:image/jpeg;base64,${asset.cutout}`}
              alt="Cutout"
              width={80}
            />
          )}
        </div>

        <div>
          <Button type="button" label={"Delete"} onClick={onRemove} />
        </div>
      </div>
    </div>
  );
}
