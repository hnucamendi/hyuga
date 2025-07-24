import React from "react";
import "../styles/typography.css";

interface TypographyProps {
  children: React.ReactNode;
}
const Typography: React.FC<TypographyProps> = ({ children }) => {
  return <span className="typography">{children}</span>;
};

export default Typography;
