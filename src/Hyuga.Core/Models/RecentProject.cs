namespace Hyuga.Core.Models;

public sealed class RecentProject
{
    public string ProjectId { get; set; } = "";
    public string ProjectName { get; set; } = "";
    public string ProjectPath { get; set; } = "";
    public DateTime LastOpenedAt { get; set; } = DateTime.UtcNow;
}
