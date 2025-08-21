import Header from "../components/Header";
import { useParams } from "react-router-dom";
import type { main } from "../../wailsjs/go/models";
import { useEffect, useRef, useState } from "react";
import {
  LoadProject,
  UploadAsset,
  DeleteAsset,
} from "../../wailsjs/go/main/App";
import {
  Button,
  Group,
  Image,
  Title,
  Text,
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellFooter,
  FileInput,
  Modal,
  TextInput,
  Stack,
  SimpleGrid,
  Paper,
  Container,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconFileImport, IconTrash } from "@tabler/icons-react";
import { useForm, isNotEmpty } from "@mantine/form";

type FormVals = {
  sheet: File | null;
  cutout: File | null;
  pageNumber: string;
  section: string;
};

function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<main.Project>();
  const [opened, { open, close }] = useDisclosure(false);
  const assetId = useRef("");
  const hh = 70;
  const fh = 80;

  useEffect(() => {
    if (!projectId) return;
    const l = async () => {
      setProject(await LoadProject(projectId));
    };
    l();
  }, [projectId]);

  const form = useForm<FormVals>({
    mode: "controlled",
    initialValues: {
      sheet: null,
      cutout: null,
      pageNumber: "",
      section: "",
    },
    validate: {
      sheet: (v) => (v ? null : "Sube la foto de la hoja"),
      cutout: (v) => (v ? null : "Sube la foto de la hoja"),
      pageNumber: (v) =>
        /^\d+$/.test(v) ? null : "Usa solor numeros (1,2,3...)",
      section: isNotEmpty("Sección requerida"),
    },
  });

  const handleAddAsset = () => {
    assetId.current = `asset-${crypto.randomUUID()}`;
    open();
  };

  const handleDelete = async (id: string) => {
    if (!project) return;
    await DeleteAsset(project?.id, id);
  };

  const toBase64 = (f: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.readAsDataURL(f);
      r.onload = () => resolve(r.result as string);
      r.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async (vals: typeof form.values) => {
    if (
      !vals.sheet ||
      !vals.cutout ||
      vals.section === "" ||
      vals.pageNumber === "" ||
      assetId.current === "" ||
      !projectId
    ) {
      return;
    }

    try {
      const sb64 = await toBase64(vals.sheet);
      const cb64 = await toBase64(vals.cutout);
      await UploadAsset(projectId, {
        id: assetId.current,
        sheet: sb64,
        cutout: cb64,
        pageNumber: vals.pageNumber,
        section: vals.section,
      });

      form.reset();
      close();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AppShell footer={{ height: fh }} header={{ height: hh }} padding={0}>
      <AppShellHeader>
        <Header projectId={projectId} />
      </AppShellHeader>
      {!projectId ? (
        <AppShellMain>
          <Title>No projectID found</Title>
        </AppShellMain>
      ) : (
        <AppShellMain
          style={{ background: "var(--mantine-color-body)", overflowX: "clip" }}
        >
          {project?.assets.map((as) => (
            <Container size="lg" px={{ base: "md", sm: "lg" }}>
              <Title order={2}>{project?.name}</Title>
              <Paper
                my="lg"
                withBorder
                shadow="sm"
                radius="md"
                p={{ base: "md", sm: "lg" }}
                key={as.id}
              >
                <Stack>
                  <Group gap="md" justify="space-between" wrap="wrap">
                    <Group gap="md">
                      <Text fw={500} c="dimmed">
                        Página:
                      </Text>
                      <Text fw={600} size="lg">
                        {as.pageNumber}
                      </Text>
                      <Text fw={500} c="dimmed">
                        Sección:
                      </Text>
                      <Text fw={600} size="lg">
                        {as.section}
                      </Text>
                    </Group>
                    <Group>
                      <Button
                        color="red"
                        size="sm"
                        rightSection={<IconTrash width={18} />}
                        onClick={() => handleDelete(as.id)}
                      >
                        Borrar
                      </Button>
                    </Group>
                  </Group>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                    <Image
                      src={as.sheet}
                      alt="Foto de hoja"
                      radius="md"
                      fit="contain"
                      w="100%"
                    />
                    <Image
                      src={as.cutout}
                      alt="Foto de nota"
                      radius="md"
                      fit="contain"
                      w="100%"
                    />
                  </SimpleGrid>
                </Stack>
              </Paper>
            </Container>
          ))}
          <Modal p="2em" opened={opened} onClose={close} title="Activo">
            <form onSubmit={form.onSubmit((v) => handleUpload(v))}>
              <FileInput
                key={form.key("sheet")}
                required
                withAsterisk
                rightSection={<IconFileImport width={25} />}
                label="Añadir foto de hoja"
                placeholder="Imagen de la hoja"
                clearable={true}
                multiple={false}
                {...form.getInputProps("sheet")}
              />
              <FileInput
                key={form.key("cutout")}
                required
                withAsterisk
                rightSection={<IconFileImport width={25} />}
                label="Añadir foto de nota"
                placeholder="Imagen de la nota"
                clearable={true}
                multiple={false}
                {...form.getInputProps("cutout")}
              />
              <TextInput
                key={form.key("pageNumber")}
                required
                withAsterisk
                label="Numero de Pagina"
                placeholder="123"
                {...form.getInputProps("pageNumber")}
              />
              <TextInput
                key={form.key("section")}
                required
                withAsterisk
                label="Sección de Pagina"
                placeholder="ABC"
                {...form.getInputProps("section")}
              />
              <Button type="submit">Submitir</Button>
            </form>
          </Modal>
          <Button
            variant="gradient"
            gradient={{ from: "blue", to: "cyan" }}
            size="lg"
            onClick={handleAddAsset}
          >
            Agregar activo
          </Button>
        </AppShellMain>
      )}
      <AppShellFooter>
        <Title> </Title>
      </AppShellFooter>
    </AppShell>
  );
}

export default ProjectPage;
