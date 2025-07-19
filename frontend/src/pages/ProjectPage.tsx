import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { main } from "../../wailsjs/go/models";
import { LoadProject, UploadPhoto } from "../../wailsjs/go/main/App";
import Header from "../components/Header";
import Aside from "../components/Aside";
import Button from "../components/Button";
import Card from "../components/Card";

interface AssetGroup {
  id: string;
  sheet?: string;
  cutout?: string;
  pageNumber?: string;
  section?: string;
}

function generateAssetId() {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<main.Project | undefined>();
  const [assets, setAssets] = useState<AssetGroup[]>([]);

  // Load project metadata on mount or projectId change
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      try {
        const proj = await LoadProject(projectId);
        setProject(proj);
        // (Optional) load initial asset groups from proj if supported
      } catch (err) {
        console.error("LoadProject failed", err);
      }
    };
    fetchProject();
  }, [projectId]);

  // Generic updater for any asset field
  const updateAsset = (id: string, updates: Partial<AssetGroup>) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    );
  };

  // Add a new, empty asset group
  const handleAddAsset = () => {
    const newId = generateAssetId();
    setAssets((prev) => [...prev, { id: newId }]);
  };

  // Remove asset group by ID
  const handleRemoveAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  // Handles sheet or cutout photo uploads for a specific asset group
  const handleUpload = (type: "sheet" | "cutout", id: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !projectId) return;
      const reader = new FileReader();
      reader.onload = async () => {
        const base64str = reader.result?.toString().split(",")[1];
        if (!base64str) return;
        try {
          await UploadPhoto(base64str, type, projectId, id);
          updateAsset(id, { [type]: base64str });
        } catch (err) {
          console.error("Upload failed", err);
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  if (!projectId) {
    return <div>Error: No project ID provided.</div>;
  }

  return (
    <>
      <Header projectId={projectId} />
      <h2>{project?.name || "Cargando proyecto..."}</h2>
      <Aside />

      <section>
        <h3>Assets</h3>
        {assets.map((asset) => (
          <Card
            key={asset.id}
            title={asset.id}
            content={
              <div className="asset-group">
                <Button
                  label={asset.sheet ? "Reemplazar Hoja" : "Subir Hoja"}
                  onClick={() => handleUpload("sheet", asset.id)}
                  type="button"
                />
                {asset.sheet && (
                  <img
                    src={`data:image/jpeg;base64,${asset.sheet}`}
                    alt="Hoja"
                  />
                )}

                <Button
                  label={asset.cutout ? "Reemplazar Nota" : "Subir Nota"}
                  onClick={() => handleUpload("cutout", asset.id)}
                  type="button"
                />
                {asset.cutout && (
                  <img
                    src={`data:image/jpeg;base64,${asset.cutout}`}
                    alt="Nota"
                  />
                )}

                <input
                  type="text"
                  placeholder="Número de página"
                  value={asset.pageNumber || ""}
                  onChange={(e) =>
                    updateAsset(asset.id, { pageNumber: e.target.value })
                  }
                />

                <input
                  type="text"
                  placeholder="Sección"
                  value={asset.section || ""}
                  onChange={(e) =>
                    updateAsset(asset.id, { section: e.target.value })
                  }
                />

                <Button
                  label="Eliminar Asset"
                  type="button"
                  onClick={() => handleRemoveAsset(asset.id)}
                />
              </div>
            }
          />
        ))}
        <Button label="Añadir Asset" onClick={handleAddAsset} type="button" />
      </section>
    </>
  );
}

export default ProjectPage;
