import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import { CreateProject, LoadProjects, DeleteProject } from "../../wailsjs/go/main/App.js";
import Card from "../components/Card";
import Button from "../components/Button";
import Header from "../components/Header"
import type { main } from "../../wailsjs/go/models";
import "../App.css";
import "../styles/header.css";

function Home() {
  const navigate = useNavigate()
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
  }, [projects]);

  const handleCreateNewProject = async () => {
    try {
      await CreateProject();
      const refreshed = await LoadProjects();
      setProjects(refreshed);
    } catch (err) {
      console.error("Failed to create project", err);
    }
  };

  const handleOpenProject = async (id: string) => {
    try {
      navigate(`/project/${id}`)
    } catch (err) {
      console.error("Failed to open project", err);
    }
  }

  const handleDeleteProject = async (id: string) => {
    try {
      DeleteProject(id)
      const refreshed = await LoadProjects();
      setProjects(refreshed);
    } catch (err) {
      console.error("Failed to open project", err);
    }
  };


  if (!projects || projects.length === 0) {
    return (
      <>
        <Header
          createProject={handleCreateNewProject}
        />
        <h1>No tienes algun proyecto toda via</h1>
      </>
    );
  }

  return (
    <div>
      <Header createProject={handleCreateNewProject} />
      {projects.map((p) => (
        <Card
          key={p.id}
          title={p.name}
          content={
            <>
              <Button label="Abrir Proyecto" onClick={() => handleOpenProject(p.id)} type="button" />
              <Button label="Borrar Proyecto" onClick={() => handleDeleteProject(p.id)} type="button" />
            </>
          }
          footer={p.created_at}
        />
      ))}
    </div>
  );
}

export default Home;

