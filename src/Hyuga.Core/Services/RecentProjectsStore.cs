using System.Text.Json;
using Hyuga.Core.Models;

namespace Hyuga.Core.Services;

public sealed class RecentProjectsStore
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public string GetDefaultPath()
    {
        var appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
        return Path.Combine(appData, "Hyuga", "recent-projects.json");
    }

    public List<RecentProject> Load(string path)
    {
        if (!File.Exists(path))
        {
            return new List<RecentProject>();
        }

        var json = File.ReadAllText(path);
        var list = JsonSerializer.Deserialize<List<RecentProject>>(json, SerializerOptions);
        return list ?? new List<RecentProject>();
    }

    public void Save(string path, List<RecentProject> projects)
    {
        var folder = Path.GetDirectoryName(path) ?? string.Empty;
        if (!string.IsNullOrWhiteSpace(folder))
        {
            Directory.CreateDirectory(folder);
        }

        var json = JsonSerializer.Serialize(projects, SerializerOptions);
        File.WriteAllText(path, json);
    }
}
