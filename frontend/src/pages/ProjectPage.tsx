import Header from "../components/Header";
import { useParams } from "react-router-dom";
import type { main } from "../../wailsjs/go/models";
import { useEffect, useRef, useState } from "react";
import { LoadProject, UploadPhoto } from "../../wailsjs/go/main/App";
import { Button, Title, Text, AppShell, AppShellHeader, AppShellMain, AppShellAside, AppShellFooter, FileInput } from "@mantine/core";

type ImageType = "sheet" | "cutout"

function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<main.Project>();
  const [sheet, setSheet] = useState<File | null>();
  const [cutout, setCutout] = useState<File | null>();
  const [assets, setAssets] = useState<main.AssetMetadata[]>([]);
  const attributeId = useRef(0);
  const hh = 100;
  const fh = 80;

  const toBase64 = (f: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const r = new FileReader()
      r.readAsDataURL(f)
      r.onload = () => resolve(r.result as string)
      r.onerror = (error) => reject(error)
    })
  }

  useEffect(() => {
    const l = async (f: File) => {
      return await toBase64(f)
    }
    if (!sheet) return
    const b64 = l(sheet)
    console.log(b64)
    UploadPhoto(sheet.name)
  }, [sheet])

  const handleUpload = (type: ImageType) => { }

  const handleAddMetadata = () => { }

  return (
    <AppShell footer={{ height: fh }} header={{ height: hh }}>
      <AppShellHeader>
        <Header projectId={projectId} />
      </AppShellHeader>
      {!projectId ? (
        <AppShellMain>
          <Title>No projectID found</Title>
        </AppShellMain>
      ) : (
        <AppShellMain>
          <h2>{project?.name}</h2>
          <AppShellAside>
            <Text></Text>
            {project?.assets.map(((as) => (
              <>
                <img src={`data:image/jpeg;base64,${as.sheet}`} />
              </>
            )))}
          </AppShellAside>
          <FileInput
            label="Sheet Input"
            placeholder="Insert Sheet"
            clearable={true}
            multiple={false}
            onChange={setSheet}
          />
          <FileInput
            label="Cutout Input"
            placeholder="Insert Cutout"
            clearable={true}
            multiple={false}
            onChange={setCutout}
          />
          {/* <Button onClick={() => handleUpload("sheet")}>Añadir foto de Hoja</Button> */}
          {/* <Button onClick={() => handleUpload("cutout")}> */}
          {/*   Añadir foto de Nota */}
          {/* </Button> */}
          <Button onClick={handleAddMetadata}>Añadir</Button>
        </AppShellMain>
      )}
      <AppShellFooter>
        <Title> </Title>
      </AppShellFooter>
    </AppShell >
  );
}

export default ProjectPage;
