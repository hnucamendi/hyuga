import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { main } from "../../wailsjs/go/models";
import {
  LoadProject,
  UploadPhoto,
  SaveAsset,
  LoadAssets,
} from "../../wailsjs/go/main/App";
import Button from "../components/Button";
import Card from "../components/Card";

export interface AssetGroup {
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
    LoadAssets(projectId)
      .then((metas) => {
        console.log(metas);
        setAssets(
          metas.map((m) => ({
            id: m.AssetID,
            cutout: m.cutout,
            sheet: m.sheet,
            pageNumber: m.PageNumber,
            section: m.Section,
            saved: true,
          })),
        );
      })
      .catch(console.error);
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
      await SaveAsset(projectId, a.id, a.pageNumber || "", a.section || "");
      updateAsset(a.id, { saved: true });
    } catch (err) {
      console.error("SaveAsset failed:", err);
    }
  };

  if (!projectId) return <div>No project selected.</div>;

  return (
    <>
      <h2>{project?.name || "Loading project..."}</h2>
      <section>
        <h3>Asset Groups</h3>
        {assets.map((a) => (
          <Card
            key={a.id}
            title={""}
            content={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: ".5em",
                  }}
                >
                  {/* <p>{a.id}</p> */}
                  <input
                    style={{
                      padding: "8px 12px",
                      fontSize: "1rem",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      outline: "none",
                      transition: "border-color 0.2s",
                      width: "10em",
                    }}
                    type="number"
                    placeholder="Page Number"
                    value={a.pageNumber || ""}
                    onChange={(e) =>
                      updateAsset(a.id, { pageNumber: e.target.value })
                    }
                  />
                  <input
                    style={{
                      padding: "8px 12px",
                      fontSize: "1rem",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      outline: "none",
                      transition: "border-color 0.2s",
                      width: "10em",
                    }}
                    placeholder="Section"
                    value={a.section || ""}
                    onChange={(e) =>
                      updateAsset(a.id, { section: e.target.value })
                    }
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "1em",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
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
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
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
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1em",
                  }}
                >
                  {!a.saved && (
                    <Button
                      disabled={!isAssetReady(a)}
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

        <div style={{ padding: "1em" }}>
          <Button
            label="Add New Asset Group"
            onClick={handleAddAsset}
            type="button"
          />
        </div>
      </section>
    </>
  );
}

export default ProjectPage;
