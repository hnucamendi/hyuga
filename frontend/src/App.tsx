import { useEffect, useState } from "react";
import "./App.css";
import { CreateProject, LoadProjects } from "../wailsjs/go/main/App.js";
import Card from "./components/Card";
import Button from "./components/Button";
import "./styles/header.css";
import type { main } from "../wailsjs/go/models";

function App() {
  const [projects, setProjects] = useState<main.Project[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const list = await LoadProjects();
        setProjects(list);
      } catch (err) {
        console.error("LoadProjects failed", err);
      }
    };
    init();
  }, []);

  const handleCreateNewProject = async () => {
    try {
      await CreateProject();
      const refreshed = await LoadProjects();
      setProjects(refreshed);
      console.log("Project created");
    } catch (err) {
      console.error("Failed to create project", err);
    }
  };

  const handleOpenProject = async () => {
    try {
    } catch (err) {
      console.error("Failed to open project", err);
    }
  };

  const header = (
    <div className="header">
      <h1>Hyūga</h1>
      <Button
        label="Crear Proyecto"
        onClick={handleCreateNewProject}
        type="button"
      />
    </div>
  );

  if (!projects) {
    return (
      <>
        {header}
        <h1>No tienes algun proyecto toda via</h1>
      </>
    );
  }

  return (
    <div>
      {projects.map((p, i) => (
        <Card
          key={i}
          title={p.name}
          content={
            <Button label="Abrir" onClick={handleOpenProject} type="button" />
          }
          footer={p.created_at}
        />
      ))}
    </div>
  );
}

export default App;
