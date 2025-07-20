import Button from "./Button";
import { AssetGroup } from "../pages/ProjectPage";

interface AssetCardProps {
  asset: AssetGroup;
  onChange: (updates: Partial<AssetGroup>) => void;
  onUpload: (type: "sheet" | "cutout", id: string) => void;
  onSave: () => void;
  onRemove: () => void;
}

export default function AssetCard({ asset, onRemove }: AssetCardProps) {
  const fieldStyle = { fontSize: "1rem", padding: "4px 0", minWidth: "8em" };

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "1em",
        marginBottom: "1em",
        borderRadius: "8px",
        backgroundColor: "#fafafa",
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
        Asset <span style={{ fontWeight: "normal" }}>{asset.id}</span>
      </div>
      <div style={fieldStyle}>
        <strong>Section:</strong> {asset.section}
      </div>
      <div style={fieldStyle}>
        <strong>Page Number:</strong> {asset.pageNumber}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "1.5em",
          marginTop: "1em",
        }}
      >
        {asset.sheet && (
          <div
            style={{
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
        {asset.cutout && (
          <div
            style={{
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
        <div style={{ marginLeft: "auto" }}>
          <Button type="button" label="Delete" onClick={onRemove} />
        </div>
      </div>
    </div>
  );
}
