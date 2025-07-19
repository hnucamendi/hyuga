import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button"

type HeaderProps = {
  createProject?: any
  projectId?: string
};

const Header: React.FC<HeaderProps> = ({ createProject, projectId }) => {
  const navigate = useNavigate()
  if (projectId) {
    return (

      <div className="header">
        <h1>Hyūga</h1>

        <Button
          label="Atras"
          onClick={() => navigate("/")}
          type="button"
        />
      </div>
    )
  }

  return (
    <div className="header">
      <h1>Hyūga</h1>
      <Button
        label="Crear Proyecto"
        onClick={createProject}
        type="button"
      />
    </div>
  );
}

export default Header

