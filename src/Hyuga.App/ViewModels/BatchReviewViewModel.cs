using System.Collections.ObjectModel;
using System.Windows.Input;
using Hyuga.App.Infrastructure;
using Hyuga.Core.Models;

namespace Hyuga.App.ViewModels;

public sealed class BatchReviewViewModel : ViewModelBase
{
    private PageModel? _selectedPage;

    public BatchReviewViewModel(Action goNext, Action goBack)
    {
        if (goNext == null)
        {
            throw new ArgumentNullException(nameof(goNext));
        }

        if (goBack == null)
        {
            throw new ArgumentNullException(nameof(goBack));
        }

        Pages = new ObservableCollection<PageModel>();

        ApplyPublicationCommand = new RelayCommand(_ => { });
        CopyLastPublicationCommand = new RelayCommand(_ => { });
        ReuseLastDateCommand = new RelayCommand(_ => { });
        MarkDoneCommand = new RelayCommand(_ => { });
        GenerateCommand = new RelayCommand(_ => goNext());
        BackCommand = new RelayCommand(_ => goBack());
    }

    public ObservableCollection<PageModel> Pages { get; }

    public PageModel? SelectedPage
    {
        get => _selectedPage;
        set => SetProperty(ref _selectedPage, value);
    }

    public ICommand ApplyPublicationCommand { get; }
    public ICommand CopyLastPublicationCommand { get; }
    public ICommand ReuseLastDateCommand { get; }
    public ICommand MarkDoneCommand { get; }
    public ICommand GenerateCommand { get; }
    public ICommand BackCommand { get; }
}
