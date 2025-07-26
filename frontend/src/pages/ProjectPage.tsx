import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { main } from "../../wailsjs/go/models";
import { LoadProject, SaveAsset, LoadAssets, DeleteAsset, GeneratePDF } from "../../wailsjs/go/main/App";
import AssetCard from "../components/AssetCard";
import Button from "../components/Button";
import AssetCardModal from "../components/AssetCardModal";

function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate()
  const [project, setProject] = useState<main.Project>();
  const [assets, setAssets] = useState<main.AssetMetadata[]>([]);
  const [addingNew, setAddingNew] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadProject = async (pid: string) => {
      const project = await LoadProject(pid)
      setProject(project)
    }

    const loadAssets = async (pid: string) => {
      const assets = await LoadAssets(pid)
      setAssets(assets)
    }

    if (!projectId) return;
    loadProject(projectId)
    loadAssets(projectId)
  }, [projectId, assets]);

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

  const removeAsset = (projectId: string, assetId: string) => {
    DeleteAsset(projectId, assetId)
  }

  const handleUpload = (
    type: "sheet" | "cutout",
    id: string,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file || !projectId) return reject("No file or projectId");

        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result?.toString().split(",")[1];
          if (!base64) return reject("Could not extract base64");

          try {
            updateAsset(id, { [type]: base64 });
            resolve(base64);
          } catch (err) {
            console.error("UploadPhoto error:", err);
            reject(err);
          }
        };
        reader.readAsDataURL(file);
      };

      input.click();
    });
  };

  const isAssetReady = (a: Partial<main.AssetMetadata>) =>
    !!a.sheet && !!a.cutout && !!a.pageNumber && !!a.section;

  const generateId = async (
    a: Partial<main.AssetMetadata>,
  ): Promise<string> => {
    if (!a.cutout || !a.sheet || !a.pageNumber || !a.section)
      throw new Error("missing one of the required fields");

    try {
      const encoder = new TextEncoder();
      const input = `${a.cutout}|${a.sheet}|${a.pageNumber}|${a.section}`;
      const data = encoder.encode(input);

      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      return hashHex;
    } catch (error) {
      throw error;
    }
  };

  const saveAsset = async (a: Partial<main.AssetMetadata>) => {
    if (!projectId || !isAssetReady(a)) return;
    const id = await generateId(a);
    await SaveAsset(
      projectId,
      id,
      a.pageNumber!,
      a.section!,
      a.sheet!,
      a.cutout!,
    );
    updateAsset(id, { saved: true });
    setIsOpen(!isOpen)
  };

  const navigateBack = () => {
    navigate("/")
  }

  const handleGeneratePDF = async () => {
    if (!projectId) throw new Error("missing projectId")
    await GeneratePDF(projectId)
  }

  if (!projectId) return <div>No project selected.</div>;

  return (
    <div>
      <Button label="<- Back" onClick={navigateBack} />
      <h2>{project?.name || "Loading project..."}</h2>
      <section>
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            editable={!asset.saved}
            onRemove={() => removeAsset(projectId, asset.id)}
          />
        ))}

        <AssetCardModal
          isOpen={isOpen}
          onClose={() => setIsOpen(!isOpen)}
          onChange={updateAsset}
          onSave={saveAsset}
          onUpload={handleUpload}
        />

        {!isOpen && (
          <Button
            label="Add New Asset"
            onClick={() => setIsOpen(!isOpen)}
            type="button"
          />
        )}

        <Button label="Generate PDF" onClick={handleGeneratePDF} />
      </section>
    </div>
  );
}

export default ProjectPage;
