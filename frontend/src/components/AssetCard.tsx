import React from "react";
import Button from "./Button"; // your existing Button component
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
  return (
    <div
      style={{ border: "1px solid #ddd", padding: "1em", marginBottom: "1em" }}
    >
      <div>
        <strong>Asset {asset.id}</strong>
      </div>

      <input
        type="number"
        disabled={!editable}
        placeholder="Page Number"
        value={asset.pageNumber || ""}
        onChange={(e) => onChange({ pageNumber: e.target.value })}
      />

      <input
        type="text"
        disabled={!editable}
        placeholder="Section"
        value={asset.section || ""}
        onChange={(e) => onChange({ section: e.target.value })}
      />

      <div style={{ display: "flex", gap: "1em", marginTop: ".5em" }}>
        <div>
          <Button
            type="button"
            disabled={!editable}
            label={asset.sheet ? "Change Sheet" : "Upload Sheet"}
            onClick={() => onUpload("sheet", asset.id)}
          />
          {asset.sheet && (
            <img
              src={`data:image/jpeg;base64,${asset.sheet}`}
              alt="Sheet"
              width={80}
            />
          )}
        </div>

        <div>
          <Button
            type="button"
            disabled={!editable}
            label={asset.cutout ? "Change Cutout" : "Upload Cutout"}
            onClick={() => onUpload("cutout", asset.id)}
          />
          {asset.cutout && (
            <img
              src={`data:image/jpeg;base64,${asset.cutout}`}
              alt="Cutout"
              width={80}
            />
          )}
        </div>

        <div>
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
