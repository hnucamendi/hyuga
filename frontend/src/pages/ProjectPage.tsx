import Header from "../components/Header"
import { useParams } from "react-router-dom"
import type { main } from "../../wailsjs/go/models";
import { useEffect, useState } from "react"
import { LoadProject } from "../../wailsjs/go/main/App"

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

  if (!projectId) {
    return <div>No project ID found.</div>
  }

  return (
    <>
      <Header projectId={projectId} />
      <h2>{project?.name}</h2>
    </>
  )
}

export default ProjectPage
