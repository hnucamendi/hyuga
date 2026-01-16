using System.Text.Json;
using Hyuga.Core.Models;

namespace Hyuga.Core.Services;

public sealed class ProjectStore
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public ProjectModel Load(string projectFolder)
    {
        var projectPath = Path.Combine(projectFolder, ProjectPaths.ProjectFileName);
        if (!File.Exists(projectPath))
        {
            throw new FileNotFoundException("project.json no encontrado.", projectPath);
        }

        var json = File.ReadAllText(projectPath);
        var model = JsonSerializer.Deserialize<ProjectModel>(json, SerializerOptions);
        if (model == null)
        {
            throw new InvalidDataException("project.json no pudo ser leído.");
        }

        return model;
    }

    public void Save(string projectFolder, ProjectModel project)
    {
        Directory.CreateDirectory(projectFolder);
        project.UpdatedAt = DateTime.UtcNow;

        var projectPath = Path.Combine(projectFolder, ProjectPaths.ProjectFileName);
        var json = JsonSerializer.Serialize(project, SerializerOptions);
        File.WriteAllText(projectPath, json);
    }

    public void InitializeFolders(string projectFolder)
    {
        Directory.CreateDirectory(projectFolder);
        Directory.CreateDirectory(Path.Combine(projectFolder, ProjectPaths.SourceFolderName));
        Directory.CreateDirectory(Path.Combine(projectFolder, ProjectPaths.ThumbsFolderName));
        Directory.CreateDirectory(Path.Combine(projectFolder, ProjectPaths.ExportsFolderName));
    }
}
