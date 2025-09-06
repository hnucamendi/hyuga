import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreateProject,
  LoadProjects,
  DeleteProject,
  UploadModels,
} from "../../wailsjs/go/main/App.js";
import {
  Button,
  Text,
  Group,
  Paper,
  Title,
  AppShell,
  Container,
  AppShellMain,
  Stack,
  AppShellHeader,
  AppShellFooter,
  Box,
  Grid,
  GridCol,
  Modal,
  FileInput,
} from "@mantine/core";
import Header from "../components/Header";
import type { main } from "../../wailsjs/go/models";
import "../App.css";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { IconFileImport, IconTrash } from "@tabler/icons-react";
import { toBase64 } from "../utils/utils.js";

type FormVals = {
  machotes: File[] | null;
};

function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<main.Project[]>([]);
  const hh = 100;
  const fh = 80;
  const isMdUp = useMediaQuery("(min-width: 62em)"); // ~992px (Mantine md)
  const [opened, { open, close }] = useDisclosure(false);

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

  const form = useForm<FormVals>({
    mode: "controlled",
    initialValues: {
      machotes: null,
    },
    validate: {
      machotes: (v) => (v ? null : "Sube imagen de el machote"),
    },
  });

  const handleUpload = async () => {
    try {
      await UploadModels();
      form.reset();
      close();
    } catch (error) {
      console.error(error);
    }
  };

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

  return (
    <AppShell header={{ height: hh }} footer={{ height: fh }} padding={0}>
      <AppShellHeader>
        <Header
          createProject={handleCreateNewProject}
          handleUpload={handleUpload}
        />
      </AppShellHeader>
      <AppShellMain
        style={{ background: "var(--mantine-color-body)", overflowX: "clip" }}
      >
        <Container size="lg" px={{ base: "md", sm: "lg" }} py="lg">
          {!projects || projects.length === 0 ? (
            <Box px={{ base: "md", sm: "lg" }} py="lg">
              <Title order={2} mb="sm">
                No tienes algún proyecto todavía
              </Title>
              <Button onClick={handleCreateNewProject}>Crear proyecto</Button>
            </Box>
          ) : (
            <Grid gutter="lg">
              {projects.map((p) => (
                <GridCol key={p.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                  <Paper radius="md" shadow="md" withBorder p="lg" h="100%">
                    <Group justify="center" mb="xs" wrap="nowrap">
                      <Title order={3} lineClamp={1}>
                        {p.name}
                      </Title>
                    </Group>

                    <Text size="sm" c="dimmed" mb="md">
                      {p.created_at}
                    </Text>

                    <Group gap="xs" wrap="wrap" justify="center" grow={!isMdUp}>
                      <Button
                        onClick={() => handleOpenProject(p.id)}
                        variant="outline"
                        size="sm"
                      >
                        Abrir proyecto
                      </Button>

                      <Button
                        onClick={() => handleDeleteProject(p.id)}
                        variant="outline"
                        size="sm"
                        color="red"
                      >
                        Borrar proyecto
                      </Button>
                    </Group>
                  </Paper>
                </GridCol>
              ))}
            </Grid>
          )}
          {/* <Modal opened={opened} onClose={close} title="Machotes"> */}
          {/*   <Stack> */}
          {/*     <form onSubmit={form.onSubmit((v) => handleUpload(v))}> */}
          {/*       <FileInput */}
          {/*         key={form.key("sheet")} */}
          {/*         required */}
          {/*         withAsterisk */}
          {/*         rightSection={<IconFileImport width={25} />} */}
          {/*         label="Añadir imagen de machote" */}
          {/*         placeholder="Imagen de machote" */}
          {/*         clearable={true} */}
          {/*         multiple={true} */}
          {/*         {...form.getInputProps("machotes")} */}
          {/*       /> */}
          {/*       <Button type="submit">Submitir</Button> */}
          {/*     </form> */}
          {/*   </Stack> */}
          {/* </Modal> */}
        </Container>
      </AppShellMain>
      <AppShellFooter>
        <Title> </Title>
      </AppShellFooter>
    </AppShell>
  );
}

export default Home;
