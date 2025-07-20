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

export interface AssetGroup {
  id: string;
  sheet?: string;
  cutout?: string;
  pageNumber?: string;
  section?: string;
  saved?: boolean;
}

function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<main.Project>();
  const [assets, setAssets] = useState<AssetGroup[]>([]);
  const [addingNew, setAddingNew] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    LoadProject(projectId).then(setProject).catch(console.error);
    LoadAssets(projectId)
      .then((metas) =>
        setAssets(
          metas.map((m) => ({
            id: m.asset_id,
            sheet: m.sheet, // ensure PhotoType fields too
            cutout: m.cutout,
            pageNumber: m.page_number,
            section: m.section,
            saved: true,
          })),
        ),
      )
      .catch(console.error);
  }, [projectId]);

  const updateAsset = (id: string, updates: Partial<AssetGroup>) =>
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    );

  const addEmptyAsset = () => {
    const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    const newAsset: AssetGroup = { id, saved: false };
    setAssets((prev) => [...prev, newAsset]);
    setAddingNew(true);
  };

  const removeAsset = (id: string) =>
    setAssets((prev) => prev.filter((a) => a.id !== id));

  const handleUpload = (type: "sheet" | "cutout", id: string) => {
    /* same as before */
  };

  const isAssetReady = (a: AssetGroup) =>
    !!a.sheet && !!a.cutout && !!a.pageNumber && !!a.section;

  const saveAsset = async (a: AssetGroup) => {
    if (!projectId || !isAssetReady(a)) return;
    await SaveAsset(projectId, a.id, a.pageNumber!, a.section!);
    updateAsset(a.id, { saved: true });
    setAddingNew(false);
  };

  if (!projectId) return <div>No project selected.</div>;

  return (
    <>
      <h2>{project?.name || "Loading project..."}</h2>
      <section>
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            editable={!asset.saved}
            onChange={(updates) => updateAsset(asset.id, updates)}
            onUpload={(type) => handleUpload(type, asset.id)}
            onSave={() => saveAsset(asset)}
            onRemove={() => removeAsset(asset.id)}
          />
        ))}

        {!addingNew && (
          <Button label="Add New Asset" onClick={addEmptyAsset} type="button" />
        )}
      </section>
    </>
  );
}

export default ProjectPage;
