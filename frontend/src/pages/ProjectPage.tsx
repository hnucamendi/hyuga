import Header from "../components/Header"
import { useParams } from "react-router-dom"
import type { main } from "../../wailsjs/go/models";
import { useEffect, useState } from "react"
import { LoadProject, UploadPhoto } from "../../wailsjs/go/main/App"
import Aside from "../components/Aside";
import Button from "../components/Button";

function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [project, setProject] = useState<main.Project>()

  useEffect(() => {
    const fetchProject = async () => {
      const proj = await LoadProject(projectId || "")
      setProject(proj)
    }
    fetchProject()
  })

  const handleAddMetadataPacket = () => {
  }

  const handleUpload = async (type: string) => {
    if (!projectId) return
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result?.toString().split(",")[1] // remove data:image/... prefix
        if (!base64) return

        try {
          switch (type) {
            case "sheet": {
              await UploadPhoto(base64, "sheet", projectId) // send base64 and custom type to backend
              break
            }
            case "cutout": {
              await UploadPhoto(base64, "cutout", projectId) // send base64 and custom type to backend
              break
            }
          }
        } catch (err) {
          console.error("Upload failed", err)
        }
      }
      reader.readAsDataURL(file)
    }

    input.click()
  }

  if (!projectId) {
    return <div>No project ID found.</div>
  }

  return (
    <>
      <Header projectId={projectId} />
      <h2>{project?.name}</h2>
      <Aside />
      <Button
        label="Añadir foto de Hoja"
        onClick={() => handleUpload("sheet")}
      />
      <Button
        label="Añadir foto de Nota"
        onClick={() => handleUpload("cutout")}
      />
      <Button
        label="Añadir"
        onClick={handleAddMetadataPacket}
      />

    </>
  )
}

export default ProjectPage
