package main

import (
	"embed"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	rt "github.com/wailsapp/wails/v2/pkg/runtime"
)

var (
	PROJECT_NAME = "hyuga"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "Hyuga",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 228, G: 228, B: 228, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}

func (a *App) installMenu() error {
	appMenu := menu.NewMenu()

	if runtime.GOOS == "darwin" {
		appMenu.Append(menu.AppMenu())
		appMenu.Append(menu.EditMenu())
	}

	project := appMenu.AddSubmenu("Project")
	project.AddText("Añadir Activo…", keys.CmdOrCtrl("n"), func(_ *menu.CallbackData) {
		_ = a.AddAssetWizard()
	})
	rt.MenuSetApplicationMenu(a.ctx, appMenu)

	return nil
}

func (a *App) AddAssetWizard() error {
	// 1) Pick the sheet image
	sheet, err := rt.OpenFileDialog(a.ctx, rt.OpenDialogOptions{
		Title:   "Seleccionar imagen de HOJA",
		Filters: []rt.FileFilter{{DisplayName: "Images (*.jpg;*.png)", Pattern: "*.png;*.jpg;*.jpeg"}},
	})
	if err != nil {
		return err
	}
	if sheet == "" {
		return nil // user canceled
	}

	// 2) Pick the cutout image
	cutout, err := rt.OpenFileDialog(a.ctx, rt.OpenDialogOptions{
		Title:   "Seleccionar imagen de NOTA",
		Filters: []rt.FileFilter{{DisplayName: "Images (*.jpg;*.png)", Pattern: "*.png;*.jpg;*.jpeg"}},
	})
	if err != nil {
		return err
	}
	if cutout == "" {
		return nil
	}

	// 3) Choose a model (load from models.json)
	models, err := a.loadModels()
	if err != nil {
		return err
	}
	modelName := ""
	if len(models) == 0 {
		// If no models, warn & continue with empty
		_, _ = rt.MessageDialog(a.ctx, rt.MessageDialogOptions{
			Title:   "Modelos no encontrados",
			Message: "No hay modelos definidos. El activo se creará sin machote.",
			Type:    rt.InfoDialog,
		})
	} else {
		// Present a quick inline picker: emulate a radio list using a submenu-like dialog:
		// Wails has no native list dialog; so we use a "question" dialog with Yes/No? – not great.
		// Better: create a dynamic submenu if you want persistent choices.
		// Here, we pick the first as default and let user confirm.
		defaultModel := models[0].Label
		summary := "Modelos disponibles:\n" + strings.Join(modelNames(models), "\n") +
			"\n\nSe usará por defecto: " + defaultModel + "\n\n¿Continuar?"
		resp, _ := rt.MessageDialog(a.ctx, rt.MessageDialogOptions{
			Title:   "Seleccionar machote",
			Message: summary,
			Type:    rt.QuestionDialog,
		})
		_ = resp // user just acknowledges
		modelName = defaultModel
	}

	// 4) Guess pageNumber & section from filename (regex), user can edit later
	guessPage, guessSection := guessMetaFromFilenames(sheet, cutout)

	// 5) Confirm summary
	msg := fmt.Sprintf(
		"Hoja: %s\nNota: %s\nMachote: %s\nPágina: %s\nSección: %s\n\n¿Crear activo?",
		filepath.Base(sheet), filepath.Base(cutout), modelName, guessPage, guessSection,
	)
	resp, _ := rt.MessageDialog(a.ctx, rt.MessageDialogOptions{
		Title:   "Confirmar Activo",
		Message: msg,
		Type:    rt.QuestionDialog,
	})
	_ = resp // just informational

	asset := AssetMetadata{
		ID:         newULID(), // implement to your taste
		Sheet:      sheet,
		Cutout:     cutout,
		Model:      modelName,
		PageNumber: guessPage,
		Section:    guessSection,
	}
	if err := a.saveAsset(asset); err != nil {
		return err
	}

	// 6) If you want immediate editing for page/section:
	//    Notify the frontend to open your existing modal prefilled:
	rt.EventsEmit(a.ctx, "hyuga:edit-asset-meta", asset)

	return nil
}

func (a *App) loadModels() ([]Model, error) {
	baseDir, err := getBaseConfigPath()
	if err != nil {
		return nil, err
	}
	modelsFile := filepath.Join(baseDir, "models", "models.json")
	b, err := os.ReadFile(modelsFile)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return nil, nil
		}
		return nil, err
	}
	var out []Model
	if err := json.Unmarshal(b, &out); err != nil {
		return nil, err
	}
	return out, nil
}

func modelNames(ms []Model) []string {
	names := make([]string, 0, len(ms))
	for _, m := range ms {
		names = append(names, " - "+m.Label)
	}
	return names
}

var pageSectionRE = regexp.MustCompile(`(?i)(?:p(?:ag|age)?[_\-]?(?P<pg>\d{1,4}))?.*?(?:sec(?:tion)?[_\-]?(?P<sec>[A-Za-z]{1,4}))?`)

func guessMetaFromFilenames(sheetPath, cutoutPath string) (page, section string) {
	// look in both filenames, first match wins
	for _, p := range []string{filepath.Base(sheetPath), filepath.Base(cutoutPath)} {
		m := pageSectionRE.FindStringSubmatch(p)
		if len(m) == 0 {
			continue
		}
		for i, name := range pageSectionRE.SubexpNames() {
			if i == 0 || name == "" {
				continue
			}
			switch name {
			case "pg":
				if page == "" {
					page = m[i]
				}
			case "sec":
				if section == "" {
					section = strings.ToUpper(m[i])
				}
			}
		}
	}
	return
}

func (a *App) saveAsset(as AssetMetadata) error {
	// Implement your project-aware storage here:
	// - Copy/move images to the project’s assets dir (optional)
	// - Append to project.json or a dedicated assets.json (atomic write)
	// - Emit events so the React list updates
	rt.EventsEmit(a.ctx, "hyuga:asset-added", as)
	return nil
}

func newULID() string {
	// plug in oklog/ulid or google/uuid
	return "asset_" + strings.ReplaceAll(fmt.Sprint(os.Getpid(), "-", os.Getuid()), " ", "_")
}
