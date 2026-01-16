namespace Hyuga.Core.Models;

public sealed class PageModel
{
    public int PageIndex { get; set; }
    public string SourceImagePath { get; set; } = "";
    public string PublicationId { get; set; } = "";
    public string PageNumber { get; set; } = "";
    public string Section { get; set; } = "";
    public string Date { get; set; } = "";
    public bool IsComplete { get; set; }
}
