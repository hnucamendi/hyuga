import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Group, Box, Title } from "@mantine/core";
import { IconArrowBack, IconFilePlus } from "@tabler/icons-react";

type HeaderProps = {
  createProject?: any;
  projectId?: string;
};

const Header: React.FC<HeaderProps> = ({ createProject, projectId }) => {
  const navigate = useNavigate();

  return (
    <Box p="2em">
      {(projectId) ? (
        <Group justify="space-between">
          <Title order={1}>Hyūga</Title>
          <Button
            leftSection={<IconArrowBack size={18} />}
            variant="filled"
            size="sm"
            onClick={() => navigate("/")}
          >
            Atrás
          </Button>
        </Group>
      ) : (
        <Group justify="space-between" align="center">
          <Title order={1}>Hyūga</Title>
          <Button
            leftSection={<IconFilePlus size={18} />}
            variant="filled"
            size="sm"
            onClick={createProject}
          >
            Crear Proyecto
          </Button>
        </Group>
      )}
    </Box>
  )
}

export default Header;
