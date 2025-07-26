import React from "react";
import { main } from "../../wailsjs/go/models";

interface AssetCardInputProps {
  id: string;
  value: string;
  type: string;
  placeHolder: string;
  onChange: (id: string, updates: Partial<main.AssetMetadata>) => void;
}

const AssetCardInput: React.FC<AssetCardInputProps> = ({
  id,
  value,
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
        value={value}
        onChange={(e) => onChange(id, { section: e.target.value })}
      />
    </>
  );
};

export default AssetCardInput;
