using Hyuga.App.Services;
using Hyuga.Core.Services;

namespace Hyuga.App.ViewModels;

public sealed class MainViewModel : ViewModelBase
{
    private readonly HomeViewModel _homeViewModel;
    private readonly ImportViewModel _importViewModel;
    private readonly BatchReviewViewModel _batchReviewViewModel;
    private readonly GenerateViewModel _generateViewModel;
    private readonly ExportViewModel _exportViewModel;
    private ViewModelBase _currentViewModel;

    public MainViewModel(
        RecentProjectsStore recentProjectsStore,
        ProjectStore projectStore,
        ProjectSession projectSession,
        PdfImportService pdfImportService)
    {
        if (projectStore == null)
        {
            throw new ArgumentNullException(nameof(projectStore));
        }

        if (projectSession == null)
        {
            throw new ArgumentNullException(nameof(projectSession));
        }

        if (pdfImportService == null)
        {
            throw new ArgumentNullException(nameof(pdfImportService));
        }

        _importViewModel = new ImportViewModel(
            pdfImportService,
            projectSession,
            NavigateToHome,
            NavigateToBatchReview);

        _batchReviewViewModel = new BatchReviewViewModel(
            NavigateToGenerate,
            NavigateToImport);

        _generateViewModel = new GenerateViewModel(
            NavigateToExport,
            NavigateToBatchReview);

        _exportViewModel = new ExportViewModel(NavigateToHome);

        _homeViewModel = new HomeViewModel(
            recentProjectsStore,
            projectStore,
            projectSession,
            NavigateToImport,
            NavigateToImport);

        _currentViewModel = _homeViewModel;
    }

    public HomeViewModel HomeViewModel => _homeViewModel;
    public ImportViewModel ImportViewModel => _importViewModel;
    public BatchReviewViewModel BatchReviewViewModel => _batchReviewViewModel;
    public GenerateViewModel GenerateViewModel => _generateViewModel;
    public ExportViewModel ExportViewModel => _exportViewModel;

    public ViewModelBase CurrentViewModel
    {
        get => _currentViewModel;
        private set => SetProperty(ref _currentViewModel, value);
    }

    private void NavigateTo(ViewModelBase viewModel)
    {
        CurrentViewModel = viewModel;
    }

    private void NavigateToHome() => NavigateTo(_homeViewModel);
    private void NavigateToImport() => NavigateTo(_importViewModel);
    private void NavigateToBatchReview() => NavigateTo(_batchReviewViewModel);
    private void NavigateToGenerate() => NavigateTo(_generateViewModel);
    private void NavigateToExport() => NavigateTo(_exportViewModel);
}
