import { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import {
  CreateProject,
  LoadProjects,
  DeleteProject,
} from "../../wailsjs/go/main/App.js";
import {
  Button,
  Text,
  Group,
  Paper,
  Title,
  ButtonGroup,
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellFooter,
  Grid,
  GridCol,
  AspectRatio,
} from "@mantine/core";
import Header from "../components/Header";
import type { main } from "../../wailsjs/go/models";
import "../App.css";

function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<main.Project[]>([]);
  const hh = 100;
  const fh = 80;

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
      navigate(`/project/${id}`);
    } catch (err) {
      console.error("Failed to open project", err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      DeleteProject(id);
      const refreshed = await LoadProjects();
      setProjects(refreshed);
    } catch (err) {
      console.error("Failed to open project", err);
    }
  };

  if (!projects || projects.length === 0) {
    return (
      <AppShell header={{ height: hh }} padding="md">
        <AppShell.Header>
          <Header createProject={handleCreateNewProject} />
        </AppShell.Header>
        <AppShell.Main>
          <h1>No tienes algun proyecto todavía</h1>
        </AppShell.Main>
      </AppShell>
    );
  }

  return (
    <AppShell footer={{ height: fh }} header={{ height: hh }}>
      <AppShellHeader>
        <Header createProject={handleCreateNewProject} />
      </AppShellHeader>
      <AppShellMain>
        <Grid justify="center" align="flex-start">
          {projects.map((p) => (
            <AspectRatio>
              <GridCol span="content">
                <Group key={p.id} justify="center">
                  <Paper radius="md" shadow="md" withBorder p="xl">
                    <Title order={2}>{p.name}</Title>
                    <ButtonGroup orientation="vertical">
                      <Button
                        onClick={() => handleOpenProject(p.id)}
                        variant="outline"
                        size="sm"
                        color="black"
                      >
                        Abrir Proyecto
                      </Button>
                      <Button
                        onClick={() => handleDeleteProject(p.id)}
                        variant="outline"
                        size="sm"
                        color="red"
                      >
                        Borrar Proyecto
                      </Button>
                    </ButtonGroup>
                    <Text>{p.created_at}</Text>
                  </Paper>
                </Group>
              </GridCol>
            </AspectRatio>
          ))}
        </Grid>
      </AppShellMain>
      <AppShellFooter>
        <Title> </Title>
      </AppShellFooter>
    </AppShell>
  );
}

export default Home;
