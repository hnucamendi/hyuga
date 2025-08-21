import Header from "../components/Header";
import { useParams } from "react-router-dom";
import type { main } from "../../wailsjs/go/models";
import { useEffect, useRef, useState } from "react";
import { LoadProject, UploadPhoto } from "../../wailsjs/go/main/App";
import Aside from "../components/Aside";
import { Button } from "@mantine/core";


function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<main.Project>();
  const attributeId = useRef(0);

  useEffect(() => {
    const fetchProject = async () => {
      const proj = await LoadProject(projectId || "");
      setProject(proj);
    };
    fetchProject();
  });

  const handleAddMetadataPacket = () => {};

  const handleUpload = async (type: string) => {
    if (!projectId) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result?.toString().split(",")[1]; // remove data:image/... prefix
        if (!base64) return;

        try {
          switch (type) {
            case "sheet": {
              await UploadPhoto(
                base64,
                "sheet",
                projectId,
                attributeId.current.toString(),
              ); // send base64 and custom type to backend
              break;
            }
            case "cutout": {
              await UploadPhoto(
                base64,
                "cutout",
                projectId,
                attributeId.current.toString(),
              ); // send base64 and custom type to backend
              break;
            }
          }
        } catch (err) {
          console.error("Upload failed", err);
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  if (!projectId) {
    return <div>No project ID found.</div>;
  }

  return (
    <>
      <Header projectId={projectId} />
      <h2>{project?.name}</h2>
      <Aside />
      <Button onClick={() => handleUpload("sheet")}>Añadir foto de Hoja</Button>
      <Button onClick={() => handleUpload("cutout")}>
        Añadir foto de Nota
      </Button>
      <Button onClick={handleAddMetadataPacket}>Añadir</Button>
    </>
  );
}

export default ProjectPage;
