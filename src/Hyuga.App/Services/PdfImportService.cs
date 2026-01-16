using MuPDF.NET;

namespace Hyuga.App.Services;

public sealed class PdfImportService
{
    public PdfImportInfo GetImportInfo(string pdfPath)
    {
        if (string.IsNullOrWhiteSpace(pdfPath))
        {
            throw new ArgumentException("PDF path is required.", nameof(pdfPath));
        }

        var document = new Document(pdfPath);
        try
        {
            var pageCount = document.PageCount;
            return new PdfImportInfo(pageCount);
        }
        finally
        {
            document.Close();
        }
    }

    public byte[] RenderPagePreview(string pdfPath, int pageIndex, int dpi = 120)
    {
        if (string.IsNullOrWhiteSpace(pdfPath))
        {
            throw new ArgumentException("PDF path is required.", nameof(pdfPath));
        }

        var document = new Document(pdfPath);
        try
        {
            using var pixmap = document.GetPagePixmap(pageIndex, matrix: new IdentityMatrix(), dpi: dpi);
            return pixmap.ToBytes("png");
        }
        finally
        {
            document.Close();
        }
    }
}

public sealed record PdfImportInfo(int PageCount);
