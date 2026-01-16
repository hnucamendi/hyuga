# UI Spec - Hyuga v2

## 1) UX Flow (Minimal)
- Start app -> Create new project
- Import draft PDF
- Review pages (thumbnails or list)
- Enter metadata for each page (publication, page, section, date)
- Generate polished PDF
- Export/print

## 2) Screens

### 2.1 Home / New Project
**Purpose:** Fast entry into a new batch.

**Primary actions**
- New Batch
- Open Recent (optional)

**Content**
- Recent projects list (last 3, optional)

**Layout**
- Centered hero actions
- Recent list below

### 2.2 Import Draft PDF
**Purpose:** Select the draft PDF and confirm page count.

**Primary actions**
- Choose PDF
- Continue

**Content**
- File picker
- Preview (first page)
- Page count summary

**Layout**
- Two columns: left for file/summary, right for preview

### 2.3 Batch Review and Metadata
**Purpose:** Assign metadata for each Machote in a batch with a fast grid and live preview.

**Primary actions**
- Apply publication to all
- Copy last metadata
- Mark as done

**Content**
- Page grid with thumbnails, index, status, and inline metadata fields
- Selected page preview (large, always visible)
- Metadata editor for the selected page (opens in a modal with explicit Save):
  - Publication (logo dropdown or grid)
  - Page number (text input)
  - Section (text input)
  - Date (text input, helper format)
- Quick actions:
  - Apply publication to all
  - Copy last metadata (publication only)
  - Reuse last date (optional button)
- Validation indicators for missing fields

**Layout**
- Left column: page grid (scrollable)
- Right column: preview top, metadata editor below

**Keyboard shortcuts (recommended)**
- Enter: save and go to next page (toggle in settings)
- Arrow keys: navigate pages
- Ctrl+L: focus publication
- Ctrl+P: focus page number
- Ctrl+S: focus section
- Ctrl+D: focus date

### 2.4 Generate Polished PDF
**Purpose:** Confirm readiness and export.

**Primary actions**
- Generate

**Content**
- Summary: total pages, missing fields count
- Export path
- Progress bar

**Layout**
- Centered summary with progress state

### 2.5 Export / Print
**Purpose:** Provide finished file and optional print action.

**Primary actions**
- Save As
- Open Folder
- Print (optional)

**Content**
- Output file location
- Success status

**Layout**
- Left: output info
- Right: action buttons

## 3) Interaction Rules
- Block export until all fields are complete (publication, page number, section, date).
- Allow navigation to any page at any time.
- Highlight incomplete pages in the list (red dot or warning icon).
- Preserve metadata when switching pages.
- Metadata edits are committed only when the user clicks Save in the modal.

## 4) Layout Rules
- Target A4 output only.
- Header with logo left and metadata box right.
- Machote image centered below header; adaptive spacing to fit.

## 5) Error States
- Missing file: show inline error near file picker.
- Invalid date: highlight date field and show format helper.
- Export failure: show error dialog with retry.

## 6) Accessibility (Basic)
- Large tap targets and clear labels.
- High-contrast status indicators.
- Keyboard navigation for batch speed.
