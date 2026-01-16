# Tech Spec - Hyuga v2

## 1) Scope
Hyuga v2 is a Windows-only WPF desktop app that imports a draft PDF of scanned Machotes, collects per-page metadata, and exports a single polished A4 PDF with a standardized header. The app is offline-first and optimized for low-tech, batch workflows.

This spec implements the behavior described in:
- `docs/PRD-Hyuga-v2.md`
- `docs/UI-Spec-Hyuga-v2.md`
- `docs/Layout-Spec-Hyuga-v2.md`
- `docs/Data-Model-Hyuga-v2.md`

## 2) Architecture Overview
Solution structure:
- `src/Hyuga.App` (WPF UI, MVVM shell, views, view models)
- `src/Hyuga.Core` (models + services + IO)

Key libraries:
- PdfiumSharp (PDF import and rasterization)
- SixLabors.ImageSharp (image processing + resizing)
- QuestPDF (PDF composition and export)

High-level data flow:
1) User creates or opens a project folder.
2) Import flow selects a draft PDF and rasterizes each page to images in `source/` and `thumbs/`.
3) Batch Review updates metadata per page and autosaves to `project.json`.
4) Generate flow composes polished pages (header + image) into a single PDF and saves under `exports/`.
5) Export flow offers save as, open folder, and optional print.

## 3) Project Structure and Files
Project folder contents (from `docs/Data-Model-Hyuga-v2.md`):
```
ProjectFolder/
  project.json
  source/
    draft.pdf
    page-001.png
    page-002.png
  thumbs/
    page-001.jpg
    page-002.jpg
  exports/
    polished.pdf
```

Key files:
- `project.json` stores `ProjectModel` and `PageModel` list.
- `source/` contains original draft PDF plus per-page full-resolution images.
- `thumbs/` contains resized thumbnails for UI grid.
- `exports/` contains final polished PDF.

## 4) Core Models
Existing models in `Hyuga.Core`:
- `ProjectModel` (project metadata, file paths, layout settings snapshot)
- `PageModel` (page index + metadata fields + completion flag)
- `LayoutSettings` (layout constants in mm and pt)
- `RecentProject` (recent list entry)

Fields for `ProjectModel` match `docs/Data-Model-Hyuga-v2.md`. Paths are stored relative to project folder.

## 5) Services and Responsibilities

### 5.1 ProjectStore
- Load and save `ProjectModel` to `project.json`.
- Initialize project folder structure.
- Update `UpdatedAt` on save.

### 5.2 RecentProjectsStore
- Read and write a JSON list stored at `%APPDATA%\Hyuga\recent-projects.json`.
- Keep most recent 5-10 items in descending `LastOpenedAt`.

### 5.3 PdfImportService (new)
Responsibilities:
- Open a draft PDF and determine page count.
- Save the draft PDF to `source/draft.pdf`.
- Render each page to an image:
  - Full resolution image for export (PNG recommended).
  - Thumbnail for the grid (JPG recommended).
- Update `ProjectModel.Pages` with:
  - `PageIndex`
  - `SourceImagePath`
  - default empty metadata fields
- Return a preview image for first page.

Implementation notes:
- Use PdfiumSharp to render pages at a target DPI (300 for export, 96-150 for thumbs).
- Thumbnails should be sized for quick load (e.g., 220 px wide, preserved aspect).
- Use ImageSharp for scaling and format conversion.
- Page images named `page-001.png` (zero-padded).

### 5.4 LayoutEngine (new)
Responsibilities:
- Given a page image and layout settings, compute available header + content rectangles.
- Apply adaptive header gap rules:
  - Use `HeaderGapMm`, but allow shrink to `HeaderMinGapMm` if needed.
- Scale image to fit remaining A4 content area.

Implementation notes:
- Work in millimeters for layout, convert to points for QuestPDF.
- Ensure the header and image always fit on one page.

### 5.5 PdfExportService (new)
Responsibilities:
- Validate all pages have required fields.
- Compose a single PDF using QuestPDF.
- Draw header:
  - Logo on left (publication-specific image).
  - Metadata box on right with `Pag`, `Sec`, `Fecha`.
- Place page image under header with computed spacing.

Implementation notes:
- Use layout rules from `docs/Layout-Spec-Hyuga-v2.md`.
- Metadata box widths are configurable in `LayoutSettings`.
- No OCR or image modifications beyond scale-to-fit.

### 5.6 PublicationAssetsService (new)
Responsibilities:
- Provide a catalog of available publication logos.
- Allow simple CRUD for local logos (if supported later).

Storage:
- Initial logos shipped with the app under `assets/logos/` (pack URI).

## 6) UI Architecture (WPF MVVM)
The UI is a view-model-driven shell with screen navigation via `MainViewModel.CurrentViewModel`.

Screens:
- Home: new batch + recent list.
- Import: file picker, preview, page count.
- Batch Review: page grid + preview + metadata editor.
- Generate: summary and progress bar.
- Export: save/open/print actions.

Guidelines:
- Block "Generate" until all pages are complete.
- Show validation errors inline (missing fields, invalid date).
- Autosave when leaving a page.

## 7) Date Format and Validation
Accepted date format: `DD/MON/YYYY` with Spanish month abbreviations:
`ENE, FEB, MAR, ABR, MAY, JUN, JUL, AGO, SEP, OCT, NOV, DIC`.

Validation rules:
- `PublicationId`, `PageNumber`, `Section`, `Date` must be non-empty.
- Date must match the allowed format (regex validation).
- Export blocked until all pages complete.

## 8) Error Handling
- Missing `project.json`: show recovery prompt.
- Missing source PDF: allow relink.
- Export failure: show dialog with retry.
- PDF render errors: show a message and allow re-import.

## 9) Performance Targets
- Import and export a 40-page batch under 2 minutes on older hardware.
- Thumbnails should load in under 1 second for the initial grid view.

## 10) Threading and UI Responsiveness
- Heavy tasks (PDF rendering, export) run in background tasks.
- UI should remain responsive with progress indicators.
- Use `IProgress<T>` or dispatcher callbacks to update progress.

## 11) Testing Strategy
Focus on deterministic tests in `Hyuga.Core` and non-UI integration tests for IO and PDF output.

### 11.1 Unit Tests (Core Services)
Suggested test project: `tests/Hyuga.Core.Tests` (xUnit).

ProjectStore:
- Save/Load round trip preserves key fields.
- InitializeFolders creates `source/`, `thumbs/`, `exports/`.
- Load missing file throws `FileNotFoundException`.

RecentProjectsStore:
- Save/Load round trip preserves ordering and timestamps.
- Load missing file returns empty list.

LayoutEngine:
- Fits header + image within A4 content area for typical input.
- Shrinks gap to `HeaderMinGapMm` when image is oversized.
- Honors max logo size and metadata box widths.

Date validation:
- Valid format passes (e.g., `15/JUL/2025`).
- Invalid month or missing fields fail.

### 11.2 Integration Tests
PdfImportService:
- Import a small test PDF (2-3 pages) and verify:
  - `source/draft.pdf` exists.
  - page images exist in `source/`.
  - thumbs exist in `thumbs/`.
  - `ProjectModel.Pages` count matches PDF page count.

PdfExportService:
- Given known images and metadata, export a PDF.
- Verify output file exists and has expected page count (via PdfiumSharp page count).

### 11.3 UI Smoke Tests (Manual)
- Create new batch, import PDF, fill metadata, generate, export.
- Confirm autosave on page change and recent list updated.
- Validate blocking when fields are missing.

### 11.4 Performance Checks (Manual)
- Import and export 40 pages with progress indicator.
- Verify UI remains responsive.

## 12) Open Questions / Assumptions
- Is there a fixed list of publication logos to bundle, or should the UI support adding custom logos?
- Confirm date format enforcement vs. free text with warnings.
- Confirm whether export should allow interleaving draft + polished pages (future enhancement).

