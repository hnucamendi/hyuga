import { useNavigate } from "react-router-dom";
import {
  Button,
  Group,
  Box,
  Title,
  Container,
  ButtonGroup,
  Loader,
  LoadingOverlay,
} from "@mantine/core";
import {
  IconArrowBack,
  IconFilePlus,
  IconFileImport,
} from "@tabler/icons-react";

type HeaderProps = {
  createProject?: any;
  openModal?: any;
  projectId?: string;
  handleAddAsset?: any;
  handleProcessPDF?: any;
};

export default function Header({
  createProject,
  projectId,
  openModal,
  handleAddAsset,
  handleProcessPDF,
}: HeaderProps) {
  const navigate = useNavigate();

  return (
    <Box
      // no horizontal padding here; Container below owns the rails
      style={{
        background: "var(--mantine-color-body)",
        overflowX: "clip", // safety net
      }}
    >
      <Container size="lg" px={{ base: "md", sm: "lg" }}>
        <Group
          justify="space-between"
          align="center"
          wrap="wrap"
          gap="md"
          py={{ base: "md", sm: "md" }}
        >
          <Title order={2} style={{ lineHeight: 1.1, wordBreak: "break-word" }}>
            Hyūga
          </Title>

          {projectId ? (
            <Group align="center" justify="center">
              <Button color="green" size="sm" onClick={handleProcessPDF}>
                Finalizar PDF
              </Button>
              <Button variant="filled" size="sm" onClick={handleAddAsset}>
                Agregar activo
              </Button>
              <Button
                leftSection={<IconArrowBack size={16} />}
                variant="outline"
                size="sm"
                onClick={() => navigate("/")}
              >
                Atrás
              </Button>
            </Group>
          ) : (
            <Group>
              <Button
                leftSection={<IconFileImport size={16} />}
                variant="filled"
                size="sm"
                onClick={openModal}
              >
                Agregar Machotes
              </Button>
              <Button
                leftSection={<IconFilePlus size={16} />}
                variant="filled"
                size="sm"
                onClick={createProject}
              >
                Crear Proyecto
              </Button>
            </Group>
          )}
        </Group>
      </Container>
    </Box>
  );
}
