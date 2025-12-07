# Hyuga

Hyuga is a Wails-based desktop utility that helps organize printed assets. You can create projects, attach
reference photos (hoja, recorte, machote) with metadata, and export a clean A4 PDF package for delivery.

# Core Features

- **Projects** — create, list and delete projects stored locally under the user's config directory. Each project
  is automatically named using the bundled Spanish adjective/noun dictionaries.
- **Assets** — attach a `sheet`, `cutout`, page number, section and `machote` reference to each project. Assets
  are stored directly in the project JSON as base64 images so they stay portable.
- **Machote Library** — import template images once per machine. Files are de-duplicated by their SHA-256 hash
  and saved under `<config>/hyuga/models`, making it easy to reuse them across projects.
- **PDF Export** — generate multi-page PDFs (A4) that include the sheet, machote and cutout layouts. The export
  dialog defaults to your Downloads folder but lets you pick any location.

## Requirements

- Go 1.25 (1.22+ works, but the module is authored with Go 1.25).
- Node.js 18+ with npm (or another package manager) for the Vite/Mantine frontend.
- Wails CLI v2.10+: `go install github.com/wailsapp/wails/v2/cmd/wails@latest`.

## Local Development

1. Install the frontend dependencies once:

   ```bash
   npm install --prefix frontend
   ```

2. Start the all-in-one dev loop:

   ```bash
   wails dev
   ```

   This runs the Go backend plus the Vite dev server with hot reload. You can also use `make dev`.

3. Open the spawned desktop window (or navigate to the URL printed by Wails) and iterate on the UI.

The generated TypeScript bindings for Go live in `frontend/wailsjs` and are regenerated automatically by Wails.

## Building

Generate a production bundle with:

```bash
wails build
```

Artifacts are written to `build/bin` (platform-dependent executables/bundles). Use `make clean` to remove old
builds.

## Typical Workflow

1. **Add machotes** — from the home screen click “Agregar Machotes” and select template images. They are copied
   to `<config>/hyuga/models/images` and listed in the dropdown on each project.
2. **Create a project** — hit “Crear Proyecto”. Hyuga will create `project-<uuid>` folders under
   `<config>/hyuga/projects` containing `project.json`.
3. **Attach assets** — inside a project load assets via “Agregar activo”. Provide the sheet/cutout photos and the
   metadata (page number and section). The selected machote path is saved alongside the asset.
4. **Generate PDFs** — when the project looks good, click “Finalizar PDF” and choose where to save the A4 PDF.
   Each asset becomes two pages: one with the sheet, one with the machote+cutout layout.

## Data Locations

Hyuga stores everything under the per-user config directory reported by `os.UserConfigDir()`:

- macOS: `~/Library/Application Support/hyuga`
- Linux: `~/.config/hyuga`
- Windows: `%AppData%/hyuga`

Within that folder you will find:

- `projects/project-<id>/project.json` — project metadata plus embedded asset images.
- `models/models.json` and `models/images/*` — the machote registry and the deduplicated source files.

## Project Structure

- `main.go`, `home.go`, `project.go`, `rpg.go`, `utils.go` — Go backend, runtime hooks and PDF generation logic.
- `frontend/` — React + Vite app styled with Mantine, includes all views/components and generated bindings.
- `fonts/` — fonts embedded into the generated PDFs.
- `spanish_*.txt` — adjective/noun dictionaries used to create friendly project names.

Feel free to adjust `wails.json` if you need to change bundle identifiers, icons or other runtime settings.
