# Data Model - Hyuga v2

## 1) Project Structure (Folder-Based)
Each project is a folder containing a JSON file plus assets. This matches v1 and avoids base64 image storage.

Example:
```
Hyuga-Project-2025-07-15/
  project.json
  source/
    draft.pdf
  thumbs/
    page-001.jpg
    page-002.jpg
  exports/
    polished.pdf
```

## 2) Autosave Behavior
- Autosave on page change (leaving the current page in the grid or preview).
- Metadata edits are only committed when the user clicks Save in the metadata modal.
- Manual Save not required for basic use.

## 3) Stored Fields
**Project-level**
- projectId
- projectName
- createdAt
- updatedAt
- appVersion
- sourcePdfPath (relative to project folder)
- outputPdfPath (relative to project folder)
- layoutSettingsSnapshot

**Page-level**
- pageIndex
- sourceImagePath (relative to project folder)
- publicationId
- pageNumber
- section
- date
- status (complete/incomplete)

## 4) Recent Projects
- App maintains a recent list (most recent 5 to 10) stored in user settings.
- On launch, show recent list on Home screen.

## 5) Recovery
- If project JSON is missing or corrupt, offer a recovery dialog.
- If source PDF is missing, show a warning and allow relink.
