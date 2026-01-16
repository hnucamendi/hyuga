using System.Text.Json.Serialization;

namespace Hyuga.Core.Models;

public sealed class ProjectModel
{
    public string ProjectId { get; set; } = Guid.NewGuid().ToString("N");
    public string ProjectName { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string AppVersion { get; set; } = "";
    public string SourcePdfPath { get; set; } = "";
    public string OutputPdfPath { get; set; } = "";
    public LayoutSettings LayoutSettingsSnapshot { get; set; } = new();
    public List<PageModel> Pages { get; set; } = new();

    [JsonIgnore]
    public bool IsEmpty => Pages.Count == 0;
}
