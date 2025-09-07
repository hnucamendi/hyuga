import Header from "../components/Header";
import { useParams } from "react-router-dom";
import type { main } from "../../wailsjs/go/models";
import { useEffect, useRef, useState } from "react";
import {
  LoadProject,
  UploadAsset,
  DeleteAsset,
  GeneratePDF,
  LoadModels,
  PickImageAndReturnPath,
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
  Modal,
  TextInput,
  Stack,
  SimpleGrid,
  Paper,
  Container,
  NativeSelect,
  LoadingOverlay,
  MenuLabel,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconFileImport, IconSelector, IconTrash } from "@tabler/icons-react";
import { useForm, isNotEmpty } from "@mantine/form";

type FormVals = {
  pageNumber: string;
  section: string;
  model: string;
};

function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<main.Project>();
  const [sheet, setSheet] = useState<string>("");
  const [cutout, setCutout] = useState<string>("");
  const [models, setModels] = useState<main.Model[]>([]);
  const [generatingPDF, setGeneratingPDF] = useState<boolean>(false);
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

  useEffect(() => {
    if (!projectId) return;
    const l = async () => {
      setModels(await LoadModels());
    };
    l();
  }, []);

  const form = useForm<FormVals>({
    mode: "controlled",
    initialValues: {
      pageNumber: "",
      section: "",
      model: "",
    },
    validate: {
      pageNumber: (v) =>
        /^\d+$/.test(v) ? null : "Usa solor numeros (1,2,3...)",
      section: isNotEmpty("Sección requerida"),
      model: isNotEmpty("machote requerido"),
    },
  });

  const handleAddAsset = () => {
    assetId.current = `asset-${crypto.randomUUID()}`;
    open();
  };

  const handleDelete = async (id: string) => {
    if (!project) return;
    await DeleteAsset(project?.id, id);
    setProject(await LoadProject(project.id));
  };

  const handleUploadImage = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const ct = e.currentTarget.id;
    try {
      switch (ct) {
        case "sheet":
          setSheet(await PickImageAndReturnPath());
          break;
        case "cutout":
          setCutout(await PickImageAndReturnPath());
          break;
        default:
          console.error("no valid id");
          break;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toFileURL = (p: string) => "file://" + encodeURI(p); // encodes spaces to %20

  const handleUpload = async (vals: typeof form.values) => {
    if (
      sheet === "" ||
      cutout === "" ||
      vals.section === "" ||
      vals.pageNumber === "" ||
      vals.model === "" ||
      assetId.current === "" ||
      !project?.id
    ) {
      return;
    }

    try {
      await UploadAsset(project.id, {
        id: assetId.current,
        sheet: sheet,
        cutout: cutout,
        pageNumber: vals.pageNumber,
        section: vals.section,
        model: vals.model,
      });

      setProject(await LoadProject(project.id));
      setSheet("");
      setCutout("");
      form.reset();
      close();
    } catch (error) {
      console.log(error);
    }
  };

  const handleProcessPDF = async () => {
    if (!project) return;
    try {
      setGeneratingPDF(true);
      await GeneratePDF(project.id);
      setGeneratingPDF(false);
    } catch (error) {
      setGeneratingPDF(false);
      console.error(error);
    }
  };

  return (
    <AppShell footer={{ height: fh }} header={{ height: hh }} padding={0}>
      <AppShellHeader>
        <Header
          projectId={projectId}
          handleAddAsset={handleAddAsset}
          handleProcessPDF={handleProcessPDF}
        />
      </AppShellHeader>
      {!projectId ? (
        <AppShellMain>
          <Title>No projectID found</Title>
        </AppShellMain>
      ) : (
        <AppShellMain
          style={{ background: "var(--mantine-color-body)", overflowX: "clip" }}
        >
          <LoadingOverlay visible={generatingPDF} />
          <Title order={2}>{project?.name}</Title>
          {project?.assets.map((as) => (
            <Container key={as.id} size="lg" px={{ base: "md", sm: "lg" }}>
              <Paper
                my="lg"
                withBorder
                shadow="sm"
                radius="md"
                p={{ base: "md", sm: "lg" }}
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
                  <Image
                    src={toFileURL(as.model)}
                    alt="Foto de machote"
                    radius="md"
                    fit="contain"
                    w="100%"
                  />
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                    <Image
                      src={toFileURL(as.sheet)}
                      alt="Foto de hoja"
                      radius="md"
                      fit="contain"
                      w="100%"
                    />
                    <Image
                      src={toFileURL(as.cutout)}
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
              <Stack>
                <Text>{sheet}</Text>
                <Button
                  id="sheet"
                  onClick={handleUploadImage}
                  rightSection={<IconFileImport width={25} />}
                  variant="outline"
                  color="black"
                >
                  Añadir foto de hoja
                </Button>
                <Text>{cutout}</Text>
                <Button
                  id="cutout"
                  onClick={handleUploadImage}
                  rightSection={<IconFileImport width={25} />}
                  variant="outline"
                  color="black"
                >
                  Añadir foto de nota
                </Button>
              </Stack>
              <NativeSelect
                key={form.key("model")}
                required
                withAsterisk
                rightSection={<IconSelector width={25} />}
                label="Seleccionar machote"
                data={models}
                {...form.getInputProps("model")}
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
        </AppShellMain>
      )}
      <AppShellFooter>
        <Title> </Title>
      </AppShellFooter>
    </AppShell>
  );
}

export default ProjectPage;
