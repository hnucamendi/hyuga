using System.Windows.Input;
using Hyuga.App.Infrastructure;

namespace Hyuga.App.ViewModels;

public sealed class ExportViewModel : ViewModelBase
{
    private string _outputPath = "";

    public ExportViewModel(Action startNewBatch)
    {
        if (startNewBatch == null)
        {
            throw new ArgumentNullException(nameof(startNewBatch));
        }

        StartNewBatchCommand = new RelayCommand(_ => startNewBatch());
        SaveAsCommand = new RelayCommand(_ => { });
        OpenFolderCommand = new RelayCommand(_ => { });
        PrintCommand = new RelayCommand(_ => { });
    }

    public string OutputPath
    {
        get => _outputPath;
        set => SetProperty(ref _outputPath, value);
    }

    public ICommand StartNewBatchCommand { get; }
    public ICommand SaveAsCommand { get; }
    public ICommand OpenFolderCommand { get; }
    public ICommand PrintCommand { get; }
}
