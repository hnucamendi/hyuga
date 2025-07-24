import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { main } from "../../wailsjs/go/models";
import {
  LoadProject,
  UploadPhoto,
  SaveAsset,
  LoadAssets,
} from "../../wailsjs/go/main/App";
import AssetCard from "../components/AssetCard";
import Button from "../components/Button";
import Typography from "../components/Typography";

function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<main.Project>();
  const [assets, setAssets] = useState<main.AssetMetadata[]>([]);
  const [addingNew, setAddingNew] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    LoadProject(projectId).then(setProject).catch(console.error);
    LoadAssets(projectId)
      .then((metas) =>
        setAssets(
          metas.map((m) => ({
            id: m.id,
            sheet: m.sheet,
            cutout: m.cutout,
            pageNumber: m.pageNumber,
            section: m.section,
            saved: true,
          })),
        ),
      )
      .catch(console.error);
  }, [projectId]);

  const updateAsset = (id: string, updates: Partial<main.AssetMetadata>) =>
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    );

  const addEmptyAsset = () => {
    const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    const newAsset: main.AssetMetadata = {
      id,
      sheet: "",
      cutout: "",
      pageNumber: "",
      section: "",
      saved: false,
    };
    setAssets((prev) => [...prev, newAsset]);
    setAddingNew(true);
  };

  const removeAsset = (id: string) =>
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

  const isAssetReady = (a: main.AssetMetadata) =>
    !!a.sheet && !!a.cutout && !!a.pageNumber && !!a.section;

  const saveAsset = async (a: main.AssetMetadata) => {
    if (!projectId || !isAssetReady(a)) return;
    await SaveAsset(projectId, a.id, a.pageNumber!, a.section!);
    updateAsset(a.id, { saved: true });
    setAddingNew(false);
  };

  if (!projectId) return <div>No project selected.</div>;

  return (
    <div>
      <h2>{project?.name || "Loading project..."}</h2>
      <section>
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            editable={!asset.saved}
            onChange={updateAsset}
            onUpload={handleUpload}
            onSave={() => saveAsset(asset)}
            onRemove={() => removeAsset(asset.id)}
          />
        ))}

        {!addingNew && (
          <Button label="Add New Asset" onClick={addEmptyAsset} type="button" />
        )}
      </section>
    </div>
  );
}

export default ProjectPage;
