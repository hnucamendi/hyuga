import React from "react";

type CardProps = {
  title: string;
  content: React.ReactNode;
  footer?: React.ReactNode;
};

const Card: React.FC<CardProps> = ({ title, content, footer }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h2>{title}</h2>
      </div>
      <div className="card-content">{content}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

export default Card;

