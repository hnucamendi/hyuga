import { useState } from "react";
import Button from "./Button";
import { main } from "../../wailsjs/go/models";
import "../styles/assetcard.css";
import Typography from "./Typography";
import AssetCardInput from "./AssetCardInput";
import AssetCardModal from "./AssetCardModal";

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
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <div className="container">
      <Typography>Asset: {asset.id}</Typography>
      <AssetCardModal
        asset={asset}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onChange={onChange}
        onUpload={onUpload}
        onSave={onSave}
      />
      <div className="card">
        <div>
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
