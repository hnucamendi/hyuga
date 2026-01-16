# Layout Spec - Hyuga v2 (Initial Defaults)

## 1) Page Setup
- Output size: A4 portrait (210 x 297 mm)
- Margins: 10 mm top, 10 mm left/right, 12 mm bottom
- Content width: 190 mm
- Content height: 275 mm

## 2) Header Region
- Header height: 20 mm (configurable)
- Header aligns to content top edge

### Logo Area (Left)
- Max height: 18 mm
- Max width: 70 mm
- Preserve aspect ratio
- Align left within header

### Metadata Box (Right)
- Box height: 12 mm
- Border: 0.5 pt
- Internal vertical separators: 0.5 pt
- Text: Arial 10 to 11 pt
- Labels bold: "Pag:", "Sec:", "Fecha:"
- Cell widths (starting default):
  - Pag: 30 mm
  - Sec: 30 mm
  - Fecha: 45 mm
- Box aligned to the right edge of the content area

## 3) Machote Image Placement
- Placed below header
- Default gap below header: 6 mm
- Minimum gap: 4 mm (shrink if needed to fit)
- Image scales to fit remaining space, preserving aspect ratio
- Center horizontally

## 4) Date Format
- Format: DD/MON/YYYY
- Spanish month abbreviations: ENE, FEB, MAR, ABR, MAY, JUN, JUL, AGO, SEP, OCT, NOV, DIC

## 5) Input Page Notes
- Sample PDF provided uses Letter size (MediaBox 612 x 792 points) with a 2550 x 3300 image at 300 DPI.
- Even if input is Letter, output remains A4; images scale to fit the A4 content area.

## 6) Tuning Targets
- Header height and metadata box widths are expected to be tuned against real samples.
- Expose header height and header-to-image gap in a simple settings panel for quick adjustment.
