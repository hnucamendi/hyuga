using System.Windows;
using Hyuga.App.Services;
using Hyuga.App.ViewModels;
using Hyuga.App.Views;
using Hyuga.Core.Services;

namespace Hyuga.App;

public partial class App : System.Windows.Application
{
    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        var recentProjectsStore = new RecentProjectsStore();
        var pdfImportService = new PdfImportService();
        var projectStore = new ProjectStore();
        var projectSession = new ProjectSession();
        var mainViewModel = new MainViewModel(
            recentProjectsStore,
            projectStore,
            projectSession,
            pdfImportService);

        var mainWindow = new MainWindow
        {
            DataContext = mainViewModel
        };

        mainWindow.Show();
    }
}
