using System.IO;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using Hyuga.App.Infrastructure;
using Hyuga.App.Services;
using Win32OpenFileDialog = Microsoft.Win32.OpenFileDialog;

namespace Hyuga.App.ViewModels;

public sealed class ImportViewModel : ViewModelBase
{
    private readonly RelayCommand _continueCommand;
    private readonly PdfImportService _pdfImportService;
    private string _draftPdfPath = "";
    private string _errorMessage = "";
    private int _pageCount;
    private ImageSource? _previewImage;

    public ImportViewModel(PdfImportService pdfImportService, ProjectSession projectSession, Action goBack, Action continueNext)
    {
        _pdfImportService = pdfImportService ?? throw new ArgumentNullException(nameof(pdfImportService));
        _ = projectSession ?? throw new ArgumentNullException(nameof(projectSession));

        if (goBack == null)
        {
            throw new ArgumentNullException(nameof(goBack));
        }

        if (continueNext == null)
        {
            throw new ArgumentNullException(nameof(continueNext));
        }

        BackCommand = new RelayCommand(_ => goBack());
        _continueCommand = new RelayCommand(_ => continueNext(), _ => PageCount > 0);
        ContinueCommand = _continueCommand;
        BrowseCommand = new RelayCommand(_ => BrowseForPdf());
    }

    public string DraftPdfPath
    {
        get => _draftPdfPath;
        set => SetProperty(ref _draftPdfPath, value);
    }

    public string ErrorMessage
    {
        get => _errorMessage;
        set => SetProperty(ref _errorMessage, value);
    }

    public ImageSource? PreviewImage
    {
        get => _previewImage;
        set => SetProperty(ref _previewImage, value);
    }

    public int PageCount
    {
        get => _pageCount;
        set
        {
            if (SetProperty(ref _pageCount, value))
            {
                _continueCommand.RaiseCanExecuteChanged();
            }
        }
    }

    public ICommand BrowseCommand { get; }
    public ICommand ContinueCommand { get; }
    public ICommand BackCommand { get; }

    private void BrowseForPdf()
    {
        var dialog = new Win32OpenFileDialog
        {
            Filter = "PDF Files (*.pdf)|*.pdf",
            Multiselect = false,
            CheckFileExists = true
        };

        if (dialog.ShowDialog() != true)
        {
            return;
        }

        try
        {
            var info = _pdfImportService.GetImportInfo(dialog.FileName);
            var previewBytes = _pdfImportService.RenderPagePreview(dialog.FileName, 0);
            DraftPdfPath = dialog.FileName;
            PageCount = info.PageCount;
            PreviewImage = LoadImage(previewBytes);
            ErrorMessage = "";
        }
        catch (Exception ex)
        {
            ErrorMessage = $"No se pudo leer el PDF: {ex.Message}";
            PageCount = 0;
            PreviewImage = null;
        }
    }

    private static ImageSource LoadImage(byte[] bytes)
    {
        using var stream = new MemoryStream(bytes);
        var image = new BitmapImage();
        image.BeginInit();
        image.CacheOption = BitmapCacheOption.OnLoad;
        image.StreamSource = stream;
        image.EndInit();
        image.Freeze();
        return image;
    }
}
