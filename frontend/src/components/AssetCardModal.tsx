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
  onSave: (data: Partial<main.AssetMetadata>) => void;
  onUpload: (type: "sheet" | "cutout", id: string) => Promise<string>;
}
const AssetCardModal: React.FC<AssetCardModalProps> = ({
  isOpen,
  onClose,
  onChange,
  onSave,
  onUpload,
}) => {
  const [id, setId] = useState<string>("");
  const [section, setSection] = useState("");
  const [pageNumber, setPageNumber] = useState<string>("");
  const [sheet, setSheet] = useState<string>("");
  const [cutout, setCutout] = useState<string>("");
  const canSave = pageNumber && sheet && cutout && sheet;

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
          type="text"
          value={section}
          placeHolder="section"
          onChange={(id, newVal) => {
            setSection(newVal.section || "");
            onChange(id, newVal);
          }}
        />
        <AssetCardInput
          id={id}
          type="number"
          value={pageNumber}
          placeHolder="page number"
          onChange={(id, newVal) => {
            setPageNumber(newVal.section || "");
            onChange(id, newVal);
          }}
        />

        <div className="modal-images">
          <img src={`data:image/jpeg;base64,${sheet}`} alt="Sheet" />
          <img src={`data:image/jpeg;base64,${cutout}`} alt="Cutout" />
        </div>

        <Button
          type="button"
          label={sheet ? "Change Sheet" : "Upload Sheet"}
          onClick={async () => {
            const b64 = await onUpload("sheet", id);
            setSheet(b64);
          }}
        />
        <Button
          type="button"
          label={cutout ? "Change Cutout" : "Upload Cutout"}
          onClick={async () => {
            const b64 = await onUpload("cutout", id);
            setCutout(b64);
          }}
        />

        <Button
          type="button"
          label="Save"
          onClick={() =>
            onSave({
              pageNumber: pageNumber,
              section: section,
              sheet: sheet,
              cutout: cutout,
            })
          }
          disabled={!canSave}
        />
      </div>
    </div>
  );
};

export default AssetCardModal;
