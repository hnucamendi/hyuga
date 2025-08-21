import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Group, Box, Title } from "@mantine/core";
import { IconFilePlus } from "@tabler/icons-react";

type HeaderProps = {
  createProject?: any;
  projectId?: string;
};

const Header: React.FC<HeaderProps> = ({ createProject, projectId }) => {
  const navigate = useNavigate();
  const title = <Title order={1}>Hyūga</Title>;
  if (projectId) {
    return (
      <Box p="2em">
        <Group justify="space-between">
          {title}
          <Button
            leftSection={<IconFilePlus size={18} />}
            variant="filled"
            size="sm"
            onClick={createProject}
          >
            Crear Proyecto
          </Button>
        </Group>
      </Box>
    );
  }

  return (
    <Box p="2em">
      <Group justify="space-between">
        {title}
        <Button
          leftSection={<IconFilePlus size={18} />}
          variant="filled"
          size="sm"
          onClick={createProject}
        >
          Crear Proyecto
        </Button>
      </Group>
    </Box>
  );
};

export default Header;
