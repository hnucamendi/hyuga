import React, { useState } from "react";
import Button from "./Button";
import AssetCardInput from "./AssetCardInput";
import { main } from "../../wailsjs/go/models";

export interface NewAssetData {
  section: string;
  pageNumber: string;
  sheet?: string;
  cutout?: string;
}
interface AssetCardModalProps {
  asset: main.AssetMetadata;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NewAssetData) => void;
  onUpload: (type: "sheet" | "cutout", id: string) => void;
  onChange: (id: string, updates: Partial<main.AssetMetadata>) => void;
}
const AssetCardModal: React.FC<AssetCardModalProps> = ({
  asset,
  isOpen,
  onClose,
  onChange,
  onSave,
  onUpload,
}) => {
  const [section, setSection] = useState("");
  const [pageNumber, setPageNumber] = useState("");
  const [sheet, setSheet] = useState<string>();
  const [cutout, setCutout] = useState<string>();
  if (!isOpen) return null;

  const canSave = section && pageNumber & sheet && cutout;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          padding: "2em",
          borderRadius: "8px",
          minWidth: "320px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>New Asset</h2>
        <AssetCardInput
          id={asset.id}
          section={asset.section}
          type="text"
          placeHolder="Section"
          onChange={onChange}
        />
        <AssetCardInput
          section={asset.section}
          type="number"
          placeHolder="Page Number"
          onChange={onChange}
        />

        <div style={{ display: "flex", gap: "1em", marginBottom: "1em" }}>
          <Button
            label={sheet ? "Replace Sheet" : "Upload Sheet"}
            onClick={() => onUpload("sheet", asset.id)}
            type="button"
          />
          <Button
            label={cutout ? "Replace Cutout" : "Upload Cutout"}
            onClick={() => onUpload("cutout", asset.id)}
            type="button"
          />
        </div>

        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "0.5em" }}
        >
          <Button label="Cancel" onClick={onClose} type="button" />
          <Button
            label="Save"
            type="button"
            disabled={!canSave}
            onClick={() => onSave({ section, pageNumber, sheet, cutout })}
          />
        </div>
      </div>
    </div>
  );
};

export default AssetCardModal;
