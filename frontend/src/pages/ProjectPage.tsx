import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { main } from "../../wailsjs/go/models";
import { LoadProject, UploadPhoto, SaveAsset } from "../../wailsjs/go/main/App";
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
  saved?: boolean;
}

function generateAssetId() {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2);
}

function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<main.Project>();
  const [assets, setAssets] = useState<AssetGroup[]>([]);

  // Load project
  useEffect(() => {
    if (!projectId) return;
    LoadProject(projectId).then(setProject).catch(console.error);
  }, [projectId]);

  const updateAsset = (id: string, updates: Partial<AssetGroup>) =>
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    );

  const handleAddAsset = () =>
    setAssets((prev) => [...prev, { id: generateAssetId() }]);

  const handleRemoveAsset = (id: string) =>
    setAssets((prev) => prev.filter((a) => a.id !== id));

  const handleUpload = (type: "sheet" | "cutout", id: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !projectId) return;
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result?.toString().split(",")[1];
        if (!base64) return;
        try {
          await UploadPhoto(base64, type, projectId, id);
          updateAsset(id, { [type]: base64 });
        } catch (err) {
          console.error("UploadPhoto error:", err);
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const isAssetReady = (a: AssetGroup) =>
    !!a.sheet && !!a.cutout && !!a.pageNumber && !!a.section;

  const handleSaveAsset = async (a: AssetGroup) => {
    if (!isAssetReady(a) || !projectId) return;

    try {
      // Example Go binding: SaveAsset(projectId, assetId, metadata JSON...)
      await SaveAsset(
        projectId,
        a.id,
        JSON.stringify({
          pageNumber: a.pageNumber,
          section: a.section,
        }),
      );
      updateAsset(a.id, { saved: true });
    } catch (err) {
      console.error("SaveAsset failed:", err);
    }
  };

  if (!projectId) return <div>No project selected.</div>;

  return (
    <>
      <Header projectId={projectId} />
      <h2>{project?.name || "Loading project..."}</h2>
      <Aside />

      <section>
        <h3>Asset Groups</h3>
        {assets.map((a) => (
          <Card
            key={a.id}
            title={`Asset: ${a.id}`}
            content={
              <div className="asset-group">
                <Button
                  label={a.sheet ? "Change Sheet" : "Upload Sheet"}
                  onClick={() => handleUpload("sheet", a.id)}
                  type="button"
                />
                {a.sheet && (
                  <img
                    src={`data:image/jpeg;base64,${a.sheet}`}
                    alt="Sheet"
                    width={100}
                  />
                )}

                <Button
                  label={a.cutout ? "Change Cutout" : "Upload Cutout"}
                  onClick={() => handleUpload("cutout", a.id)}
                  type="button"
                />
                {a.cutout && (
                  <img
                    src={`data:image/jpeg;base64,${a.cutout}`}
                    alt="Cutout"
                    width={100}
                  />
                )}

                <input
                  placeholder="Page Number"
                  value={a.pageNumber || ""}
                  onChange={(e) =>
                    updateAsset(a.id, { pageNumber: e.target.value })
                  }
                />
                <input
                  placeholder="Section"
                  value={a.section || ""}
                  onChange={(e) =>
                    updateAsset(a.id, { section: e.target.value })
                  }
                />

                <div className="asset-actions">
                  {isAssetReady(a) && !a.saved && (
                    <Button
                      label="Save Asset"
                      onClick={() => handleSaveAsset(a)}
                      type="button"
                    />
                  )}
                  <Button
                    label="Remove"
                    onClick={() => handleRemoveAsset(a.id)}
                    type="button"
                  />
                </div>
              </div>
            }
          />
        ))}

        <Button
          label="Add New Asset Group"
          onClick={handleAddAsset}
          type="button"
        />
      </section>
    </>
  );
}

export default ProjectPage;
