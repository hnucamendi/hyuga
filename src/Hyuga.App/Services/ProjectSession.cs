using Hyuga.Core.Models;

namespace Hyuga.App.Services;

public sealed class ProjectSession
{
    public string ProjectFolder { get; private set; } = "";
    public ProjectModel? Project { get; private set; }

    public void Start(ProjectModel project, string projectFolder)
    {
        Project = project ?? throw new ArgumentNullException(nameof(project));
        ProjectFolder = projectFolder ?? throw new ArgumentNullException(nameof(projectFolder));
    }

    public void Clear()
    {
        Project = null;
        ProjectFolder = "";
    }
}
