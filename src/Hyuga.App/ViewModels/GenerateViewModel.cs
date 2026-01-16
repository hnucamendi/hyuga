using System.Windows.Input;
using Hyuga.App.Infrastructure;

namespace Hyuga.App.ViewModels;

public sealed class GenerateViewModel : ViewModelBase
{
    private int _totalPages;
    private int _missingFields;
    private string _outputPath = "";
    private double _progressValue;
    private bool _isGenerating;

    public GenerateViewModel(Action generate, Action goBack)
    {
        if (generate == null)
        {
            throw new ArgumentNullException(nameof(generate));
        }

        if (goBack == null)
        {
            throw new ArgumentNullException(nameof(goBack));
        }

        GenerateCommand = new RelayCommand(_ => generate());
        BackCommand = new RelayCommand(_ => goBack());
    }

    public int TotalPages
    {
        get => _totalPages;
        set => SetProperty(ref _totalPages, value);
    }

    public int MissingFields
    {
        get => _missingFields;
        set => SetProperty(ref _missingFields, value);
    }

    public string OutputPath
    {
        get => _outputPath;
        set => SetProperty(ref _outputPath, value);
    }

    public double ProgressValue
    {
        get => _progressValue;
        set => SetProperty(ref _progressValue, value);
    }

    public bool IsGenerating
    {
        get => _isGenerating;
        set => SetProperty(ref _isGenerating, value);
    }

    public ICommand GenerateCommand { get; }
    public ICommand BackCommand { get; }
}
