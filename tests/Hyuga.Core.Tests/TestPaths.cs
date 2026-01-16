namespace Hyuga.Core.Tests;

internal static class TestPaths
{
    public static string CreateTempFolder()
    {
        var folder = Path.Combine(Path.GetTempPath(), "Hyuga.Tests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(folder);
        return folder;
    }

    public static void CleanupFolder(string folder)
    {
        if (string.IsNullOrWhiteSpace(folder))
        {
            return;
        }

        if (Directory.Exists(folder))
        {
            Directory.Delete(folder, true);
        }
    }
}
