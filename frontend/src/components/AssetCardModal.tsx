import React, { useEffect, useState } from "react";
import { main } from "../../wailsjs/go/models";
import "../styles/assetcardmodal.css";
import AssetCardInput from "./AssetCardInput";
import Button from "./Button";

export interface NewAssetData {
  section: string;
  pageNumber: string;
  sheet?: string;
  cutout?: string;
}
interface AssetCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChange: (id: string, updates: Partial<main.AssetMetadata>) => void;
  onSave: (data: main.AssetMetadata) => void;
  onUpload: (type: "sheet" | "cutout", id: string) => void;
}
const AssetCardModal: React.FC<AssetCardModalProps> = ({
  isOpen,
  onClose,
  onChange,
  onSave,
  onUpload,
}) => {
  const [section, setSection] = useState("");
  const [pageNumber, setPageNumber] = useState("");
  const [sheet, setSheet] = useState<string>("");
  const [cutout, setCutout] = useState<string>("");
  const [id, setId] = useState<string>("");

  useEffect(() => {
    const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    setId(id);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>New Asset</h2>
        <AssetCardInput
          id={id}
          section={section}
          type="text"
          placeHolder="section"
          onChange={onChange}
        />
        <AssetCardInput
          id={id}
          section={section}
          type="number"
          placeHolder="page number"
          onChange={onChange}
        />

        <Button
          type="button"
          label={sheet ? "Change Sheet" : "Upload Sheet"}
          onClick={() => onUpload("sheet", id)}
        />
        <img
          src={`data:image/jpeg;base64,${sheet}`}
          alt="Sheet"
          width={120}
          style={{ display: "block", borderRadius: "4px" }}
        />

        <Button
          type="button"
          label={cutout ? "Change Cutout" : "Upload Cutout"}
          onClick={() => onUpload("cutout", id)}
        />
        <img
          src={`data:image/jpeg;base64,${cutout}`}
          alt="Cutout"
          width={120}
          style={{ display: "block", borderRadius: "4px" }}
        />

        <Button type="button" label="Save" onClick={onSave} />
      </div>
    </div>
  );
};

export default AssetCardModal;
