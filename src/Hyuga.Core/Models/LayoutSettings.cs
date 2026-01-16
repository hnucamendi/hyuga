namespace Hyuga.Core.Models;

public sealed class LayoutSettings
{
    public double MarginTopMm { get; set; } = 10;
    public double MarginLeftMm { get; set; } = 10;
    public double MarginRightMm { get; set; } = 10;
    public double MarginBottomMm { get; set; } = 12;
    public double HeaderHeightMm { get; set; } = 20;
    public double HeaderGapMm { get; set; } = 6;
    public double HeaderMinGapMm { get; set; } = 4;
    public double LogoMaxHeightMm { get; set; } = 18;
    public double LogoMaxWidthMm { get; set; } = 70;
    public double MetadataBoxHeightMm { get; set; } = 12;
    public double MetadataBorderPt { get; set; } = 0.5;
    public double MetadataPagWidthMm { get; set; } = 30;
    public double MetadataSecWidthMm { get; set; } = 30;
    public double MetadataFechaWidthMm { get; set; } = 45;
    public string FontFamily { get; set; } = "Arial";
    public double FontSizePt { get; set; } = 10.5;
}
