import Button from "./Button";
import { main } from "../../wailsjs/go/models";
import "../styles/assetcard.css";
import Typography from "./Typography";

interface AssetCardProps {
  asset: main.AssetMetadata;
  editable: boolean;
  onRemove: () => void;
}

export default function AssetCard({
  asset,
  editable,
  onRemove,
}: AssetCardProps) {
  return (
    <div className="card">
      <Typography>Section: {asset.section}</Typography>
      <Typography>Page Number: {asset.pageNumber}</Typography>
      <img src={`data:image/jpeg;base64,${asset.sheet}`} />
      <img src={`data:image/jpeg;base64,${asset.cutout}`} />
      <Button
        type="button"
        label={editable ? "Remove" : "Delete"}
        onClick={onRemove}
      />
    </div>
  );
}
