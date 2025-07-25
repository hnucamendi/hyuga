import { useState } from "react";
import Button from "./Button";
import { main } from "../../wailsjs/go/models";
import "../styles/assetcard.css";
import Typography from "./Typography";

interface AssetCardProps {
  asset: main.AssetMetadata;
  editable: boolean;
  onUpload: (type: "sheet" | "cutout", id: string) => void;
  onSave: () => void;
  onRemove: () => void;
  onChange: (id: string, updates: Partial<main.AssetMetadata>) => void;
}

export default function AssetCard({
  asset,
  editable,
  onUpload,
  onChange,
  onSave,
  onRemove,
}: AssetCardProps) {
  return (
    <div className="container">
      <Typography>Asset: {asset.id}</Typography>
      <div className="card">
        <div>
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
