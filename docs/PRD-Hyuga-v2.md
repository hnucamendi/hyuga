# Product Requirements Document - Hyuga v2

## 1) Overview
Hyuga v2 is an offline-first Windows desktop app that automates the polishing step for Machote pages. It generates a clean, print-ready PDF by placing a standardized header (logo plus metadata) above each scanned Machote image, while preserving the original draft PDF. The tool is optimized for low-tech workflows and batch processing.

## 2) Goals
- Eliminate manual Adobe Acrobat header replacement.
- Batch-generate polished A4 pages quickly.
- Work fully offline after a one-time install.

## 3) Non-Goals
- OCR or text extraction.
- Cloud sync or multi-user collaboration.
- Auto-detection of metadata from scans.

## 4) Users and Context
- Small CDMX news agency, low technical skill.
- Old Windows machines, limited connectivity.
- 20 to 40 Machotes per session.

## 5) Inputs
- Draft PDF containing scanned Machote images (one per page, already cropped).
- Manual metadata entry per page:
  - Publication (logo selection)
  - Page number (e.g., "18")
  - Section letter (e.g., "A")
  - Date (e.g., "15/JUL/2025")

## 6) Outputs
- Polished PDF (A4 portrait):
  - Header: logo left, metadata box right.
  - Machote image below header, centered and scaled to fit.
- Draft PDF preserved unchanged.
- All polished pages grouped together.

## 7) Core Workflow
1) Import draft PDF.
2) App lists all pages in a batch grid with a live preview.
3) User assigns metadata and publication per page (batch-friendly).
4) Generate polished PDF.
5) Export to USB or print.

## 8) Layout Requirements
- Page size: A4 portrait.
- Header:
  - Logo left.
  - Metadata box right with labels:
    - "Pag: N"
    - "Sec: X"
    - "Fecha: DD/MON/YYYY"
- Machote image placed under header.
- Adaptive spacing:
  - If Machote smaller, leave more whitespace above or below.
  - If larger, reduce top spacing but keep single-page fit.
- Both header and Machote must fit on a single A4 page.
 - Initial layout defaults are documented in `docs/Layout-Spec-Hyuga-v2.md`.

## 9) Functional Requirements
- Import multi-page PDF.
- Display page grid with status (metadata complete or incomplete) and a live preview.
- Manual metadata entry per page with validation (non-empty).
- Default helpers: carry last publication, optional reuse last date.
- Logo library management (preloaded 10 to 15 logos).
- Batch export to single PDF.

## 10) Non-Functional Requirements
- Offline-first; no runtime internet dependency.
- Windows-first compatibility (older hardware).
- Simple UI with minimal steps.
- Fast batch performance for 20 to 40 pages.

## 11) Edge Cases
- Missing metadata blocks export and highlights errors.
- Oversized images are scaled down to fit.
- Invalid date format prompts validation.

## 12) Success Metrics
- Polished PDF generation time under 2 minutes for 40 pages.
- Zero manual layout adjustments needed.
- Staff can complete job without Adobe Acrobat.

## 13) Future Enhancements (Optional)
- Interleaved ordering (draft plus polished pairs).
- CSV import for metadata.
- Template presets per publication.
- Print integration.
