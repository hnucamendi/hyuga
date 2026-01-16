using Hyuga.Core.Models;
using Hyuga.Core.Services;
using Xunit;

namespace Hyuga.Core.Tests;

public sealed class RecentProjectsStoreTests
{
    [Fact]
    public void Load_WhenMissingFile_ReturnsEmptyList()
    {
        var projectFolder = TestPaths.CreateTempFolder();
        try
        {
            var store = new RecentProjectsStore();
            var path = Path.Combine(projectFolder, "recent-projects.json");

            var list = store.Load(path);

            Assert.NotNull(list);
            Assert.Empty(list);
        }
        finally
        {
            TestPaths.CleanupFolder(projectFolder);
        }
    }

    [Fact]
    public void SaveAndLoad_RoundTrip()
    {
        var projectFolder = TestPaths.CreateTempFolder();
        try
        {
            var store = new RecentProjectsStore();
            var path = Path.Combine(projectFolder, "recent-projects.json");
            var items = new List<RecentProject>
            {
                new RecentProject
                {
                    ProjectId = "p1",
                    ProjectName = "Batch 1",
                    ProjectPath = "C:\\Projects\\Batch1",
                    LastOpenedAt = new DateTime(2025, 1, 2, 3, 4, 5, DateTimeKind.Utc)
                },
                new RecentProject
                {
                    ProjectId = "p2",
                    ProjectName = "Batch 2",
                    ProjectPath = "C:\\Projects\\Batch2",
                    LastOpenedAt = new DateTime(2025, 2, 2, 3, 4, 5, DateTimeKind.Utc)
                }
            };

            store.Save(path, items);
            var loaded = store.Load(path);

            Assert.Equal(items.Count, loaded.Count);
            Assert.Equal(items[0].ProjectId, loaded[0].ProjectId);
            Assert.Equal(items[0].ProjectName, loaded[0].ProjectName);
            Assert.Equal(items[0].ProjectPath, loaded[0].ProjectPath);
            Assert.Equal(items[0].LastOpenedAt, loaded[0].LastOpenedAt);
        }
        finally
        {
            TestPaths.CleanupFolder(projectFolder);
        }
    }
}
