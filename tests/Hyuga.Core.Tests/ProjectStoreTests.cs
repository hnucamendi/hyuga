using Hyuga.Core.Models;
using Hyuga.Core.Services;
using Xunit;

namespace Hyuga.Core.Tests;

public sealed class ProjectStoreTests
{
    [Fact]
    public void SaveAndLoad_RoundTrip()
    {
        var projectFolder = TestPaths.CreateTempFolder();
        try
        {
            var store = new ProjectStore();
            var project = new ProjectModel
            {
                ProjectName = "Test Batch",
                AppVersion = "1.0",
                SourcePdfPath = "source/draft.pdf",
                OutputPdfPath = "exports/polished.pdf",
                Pages = new List<PageModel>
                {
                    new PageModel { PageIndex = 0, PageNumber = "1", Section = "A", Date = "01/ENE/2025" },
                    new PageModel { PageIndex = 1, PageNumber = "2", Section = "A", Date = "01/ENE/2025" }
                }
            };

            store.Save(projectFolder, project);
            var loaded = store.Load(projectFolder);

            Assert.Equal(project.ProjectId, loaded.ProjectId);
            Assert.Equal(project.ProjectName, loaded.ProjectName);
            Assert.Equal(project.AppVersion, loaded.AppVersion);
            Assert.Equal(project.SourcePdfPath, loaded.SourcePdfPath);
            Assert.Equal(project.OutputPdfPath, loaded.OutputPdfPath);
            Assert.Equal(project.Pages.Count, loaded.Pages.Count);
        }
        finally
        {
            TestPaths.CleanupFolder(projectFolder);
        }
    }

    [Fact]
    public void InitializeFolders_CreatesExpectedFolders()
    {
        var projectFolder = TestPaths.CreateTempFolder();
        try
        {
            var store = new ProjectStore();

            store.InitializeFolders(projectFolder);

            Assert.True(Directory.Exists(Path.Combine(projectFolder, ProjectPaths.SourceFolderName)));
            Assert.True(Directory.Exists(Path.Combine(projectFolder, ProjectPaths.ThumbsFolderName)));
            Assert.True(Directory.Exists(Path.Combine(projectFolder, ProjectPaths.ExportsFolderName)));
        }
        finally
        {
            TestPaths.CleanupFolder(projectFolder);
        }
    }

    [Fact]
    public void Load_WhenMissingProjectFile_Throws()
    {
        var projectFolder = TestPaths.CreateTempFolder();
        try
        {
            var store = new ProjectStore();

            Assert.Throws<FileNotFoundException>(() => store.Load(projectFolder));
        }
        finally
        {
            TestPaths.CleanupFolder(projectFolder);
        }
    }
}
