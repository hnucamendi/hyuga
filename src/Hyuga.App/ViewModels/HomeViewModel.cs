using System.Collections.ObjectModel;
using System.Linq;
using System.Reflection;
using System.IO;
using System.Windows.Input;
using Hyuga.App.Infrastructure;
using Hyuga.App.Services;
using Hyuga.Core.Models;
using Hyuga.Core.Services;
using Win32OpenFileDialog = Microsoft.Win32.OpenFileDialog;
using Forms = System.Windows.Forms;

namespace Hyuga.App.ViewModels;

public sealed class HomeViewModel : ViewModelBase
{
    private readonly RelayCommand _openRecentCommand;
    private readonly ProjectStore _projectStore;
    private readonly RecentProjectsStore _recentProjectsStore;
    private readonly ProjectSession _projectSession;
    private RecentProject? _selectedRecentProject;
    private string _statusMessage = "";
    private string _errorMessage = "";

    public HomeViewModel(
        RecentProjectsStore recentProjectsStore,
        ProjectStore projectStore,
        ProjectSession projectSession,
        Action createNewBatch,
        Action openRecent)
    {
        _recentProjectsStore = recentProjectsStore ?? throw new ArgumentNullException(nameof(recentProjectsStore));
        _projectStore = projectStore ?? throw new ArgumentNullException(nameof(projectStore));
        _projectSession = projectSession ?? throw new ArgumentNullException(nameof(projectSession));

        if (createNewBatch == null)
        {
            throw new ArgumentNullException(nameof(createNewBatch));
        }

        if (openRecent == null)
        {
            throw new ArgumentNullException(nameof(openRecent));
        }

        CreateNewBatchCommand = new RelayCommand(_ => CreateNewProject(createNewBatch));
        _openRecentCommand = new RelayCommand(_ => OpenRecentProject(openRecent), _ => SelectedRecentProject != null);
        OpenRecentCommand = _openRecentCommand;

        var recentProjects = _recentProjectsStore.Load(_recentProjectsStore.GetDefaultPath());
        var orderedProjects = recentProjects
            .OrderByDescending(project => project.LastOpenedAt)
            .Take(8)
            .ToList();

        RecentProjects = new ObservableCollection<RecentProject>(orderedProjects);
    }

    public ObservableCollection<RecentProject> RecentProjects { get; }

    public string StatusMessage
    {
        get => _statusMessage;
        set => SetProperty(ref _statusMessage, value);
    }

    public string ErrorMessage
    {
        get => _errorMessage;
        set => SetProperty(ref _errorMessage, value);
    }

    public RecentProject? SelectedRecentProject
    {
        get => _selectedRecentProject;
        set
        {
            if (SetProperty(ref _selectedRecentProject, value))
            {
                _openRecentCommand.RaiseCanExecuteChanged();
            }
        }
    }

    public ICommand CreateNewBatchCommand { get; }
    public ICommand OpenRecentCommand { get; }

    private void CreateNewProject(Action navigateToImport)
    {
        try
        {
            using var dialog = new Forms.FolderBrowserDialog
            {
                Description = "Selecciona la carpeta para el nuevo lote",
                ShowNewFolderButton = true
            };

            if (dialog.ShowDialog() != Forms.DialogResult.OK)
            {
                return;
            }

            var projectFolder = dialog.SelectedPath;
            var projectName = Path.GetFileName(projectFolder.TrimEnd(Path.DirectorySeparatorChar)) ?? "Nuevo lote";

            var project = new ProjectModel
            {
                ProjectName = projectName,
                AppVersion = GetAppVersion(),
                SourcePdfPath = Path.Combine(ProjectPaths.SourceFolderName, "draft.pdf"),
                OutputPdfPath = Path.Combine(ProjectPaths.ExportsFolderName, "polished.pdf")
            };

            _projectStore.InitializeFolders(projectFolder);
            _projectStore.Save(projectFolder, project);
            _projectSession.Start(project, projectFolder);

            UpsertRecentProject(project);
            StatusMessage = $"Lote creado: {project.ProjectName}";
            ErrorMessage = "";
            navigateToImport();
        }
        catch (Exception ex)
        {
            ErrorMessage = $"No se pudo crear el lote: {ex.Message}";
            StatusMessage = "";
        }
    }

    private void OpenRecentProject(Action navigateToImport)
    {
        try
        {
            var projectFolder = SelectedRecentProject?.ProjectPath;
            if (string.IsNullOrWhiteSpace(projectFolder))
            {
                var dialog = new Win32OpenFileDialog
                {
                    Filter = "Proyecto Hyuga (project.json)|project.json",
                    Multiselect = false,
                    CheckFileExists = true
                };

                if (dialog.ShowDialog() != true)
                {
                    return;
                }

                projectFolder = Path.GetDirectoryName(dialog.FileName);
            }

            if (string.IsNullOrWhiteSpace(projectFolder))
            {
                return;
            }

            var project = _projectStore.Load(projectFolder);
            _projectSession.Start(project, projectFolder);
            UpsertRecentProject(project);
            StatusMessage = $"Proyecto abierto: {project.ProjectName}";
            ErrorMessage = "";
            navigateToImport();
        }
        catch (Exception ex)
        {
            ErrorMessage = $"No se pudo abrir el proyecto: {ex.Message}";
            StatusMessage = "";
        }
    }

    private void UpsertRecentProject(ProjectModel project)
    {
        var existing = RecentProjects.FirstOrDefault(item => item.ProjectId == project.ProjectId);
        if (existing == null)
        {
            existing = new RecentProject();
            RecentProjects.Insert(0, existing);
        }
        else
        {
            RecentProjects.Remove(existing);
            RecentProjects.Insert(0, existing);
        }

        existing.ProjectId = project.ProjectId;
        existing.ProjectName = project.ProjectName;
        existing.ProjectPath = _projectSession.ProjectFolder;
        existing.LastOpenedAt = DateTime.UtcNow;

        while (RecentProjects.Count > 10)
        {
            RecentProjects.RemoveAt(RecentProjects.Count - 1);
        }

        _recentProjectsStore.Save(_recentProjectsStore.GetDefaultPath(), RecentProjects.ToList());
    }

    private static string GetAppVersion()
    {
        var version = Assembly.GetExecutingAssembly().GetName().Version;
        return version?.ToString() ?? "0.0.0";
    }
}
