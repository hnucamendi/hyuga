import React from "react";
import Typography from "./Typography";
import { main } from "../../wailsjs/go/models";

interface AssetCardInputProps {
  id: string;
  section: string;
  type: string;
  placeHolder: string;
  onChange: (id: string, updates: Partial<main.AssetMetadata>) => void;
}

const AssetCardInput: React.FC<AssetCardInputProps> = ({
  id,
  section,
  type,
  placeHolder,
  onChange,
}) => {
  return (
    <>
      <input
        className="fieldStyle"
        type={type}
        placeholder={placeHolder}
        value={section}
        onChange={(e) => onChange(id, { section: e.target.value })}
      />
    </>
  );
};

export default AssetCardInput;
