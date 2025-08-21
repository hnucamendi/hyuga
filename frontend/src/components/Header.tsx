import { useNavigate } from "react-router-dom";
import { Button, Group, Box, Title, Container } from "@mantine/core";
import { IconArrowBack, IconFilePlus } from "@tabler/icons-react";

type HeaderProps = {
  createProject?: any;
  projectId?: string;
};

export default function Header({ createProject, projectId }: HeaderProps) {
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
            <Button
              leftSection={<IconArrowBack size={16} />}
              variant="filled"
              size="sm"
              onClick={() => navigate("/")}
            >
              Atrás
            </Button>
          ) : (
            <Button
              leftSection={<IconFilePlus size={16} />}
              variant="filled"
              size="sm"
              onClick={createProject}
            >
              Crear Proyecto
            </Button>
          )}
        </Group>
      </Container>
    </Box>
  );
}
