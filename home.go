package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Project struct {
	Id        string          `json:"id"`
	Name      string          `json:"name"`
	CreatedAt string          `json:"created_at"`
	Assets    []AssetMetadata `json:"assets"`
}

type Model struct {
	Label string `json:"label"`
	Value string `json:"value"`
}

func cleanupDirs(d []os.DirEntry) []os.DirEntry {
	var cd []os.DirEntry
	for _, v := range d {
		if !v.IsDir() {
			continue
		}
		if !strings.Contains(v.Name(), "project-") {
			continue
		}
		cd = append(cd, v)
	}
	return cd
}
func (a *App) LoadProjects() ([]Project, error) {
	base, err := getBaseConfigPath()
	if err != nil {
		return nil, err
	}
	projectsPath := filepath.Join(base, "projects")
	err = os.MkdirAll(projectsPath, 0755)
	if err != nil {
		return nil, err
	}
	dirs, err := os.ReadDir(projectsPath)
	if err != nil {
		return nil, err
	}
	cleanedDirs := cleanupDirs(dirs)
	var res = make([]Project, len(cleanedDirs))
	for i, v := range cleanedDirs {
		if !v.IsDir() {
			continue
		}
		cfgPath := filepath.Join(projectsPath, v.Name(), "project.json")
		data, err := os.ReadFile(cfgPath)
		if err != nil {
			continue
		}
		var p Project
		if err := json.Unmarshal(data, &p); err != nil {
			continue
		}
		res[i] = p
	}
	return res, nil
}
func (a *App) LoadProject(id string) (*Project, error) {
	if id == "" {
		return nil, errors.New("invalid project ID")
	}
	base, err := getBaseConfigPath()
	if err != nil {
		return nil, err
	}
	path := filepath.Join(base, "projects", concat("project-", id), "project.json")
	b, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var p *Project
	err = json.Unmarshal(b, &p)
	if err != nil {
		return nil, err
	}
	return p, nil
}
func getBaseConfigPath() (string, error) {
	dir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	appDir := filepath.Join(dir, PROJECT_NAME)
	return appDir, os.MkdirAll(appDir, 0755)
}
func ensureUnique(p Project, a AssetMetadata) bool {
	for _, v := range p.Assets {
		if v.ID == a.ID {
			return false
		}
	}
	return true
}

func (a *App) CreateProject() error {
	name, err := Generate()
	if err != nil {
		fmt.Println(err)
		return err
	}

	id := uuid.NewString()
	base, err := getBaseConfigPath()
	if err != nil {
		return err
	}
	projectsDir := filepath.Join(base, "projects", concat("project-", id))
	if err := os.MkdirAll(projectsDir, 0755); err != nil {
		return err
	}
	loc, err := time.LoadLocation("Local")
	if err != nil {
		return err
	}
	proj := Project{
		Id:        id,
		Name:      name,
		CreatedAt: time.Now().Local().In(loc).Format(time.DateTime),
		Assets:    []AssetMetadata{},
	}
	data, err := json.MarshalIndent(proj, "", "  ")
	if err != nil {
		return err
	}
	err = os.WriteFile(filepath.Join(projectsDir, "project.json"), data, 0644)
	if err != nil {
		return err
	}
	return nil
}
func (a *App) DeleteProject(id string) error {
	base, err := getBaseConfigPath()
	if err != nil {
		return err
	}
	path := filepath.Join(base, "projects", concat("project-", id))
	err = os.RemoveAll(path)
	if err != nil {
		return err
	}
	return nil
}

func hashFromSavedPath(p string) (string, bool) {
	base := filepath.Base(p)
	noExt := strings.TrimSuffix(base, filepath.Ext(base))
	// support both "<sha>" and "<sha>-anything"
	if i := strings.IndexByte(noExt, '-'); i > 0 {
		noExt = noExt[:i]
	}
	if len(noExt) != 64 {
		return "", false
	}
	if _, err := hex.DecodeString(noExt); err != nil {
		return "", false
	}
	return noExt, true
}

func (a *App) UploadModels() error {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return err
	}

	baseDir, err := getBaseConfigPath()
	if err != nil {
		return err
	}

	imagesDir := filepath.Join(baseDir, "models", "images")
	if err := os.MkdirAll(imagesDir, 0755); err != nil {
		return err
	}

	cfg := runtime.OpenDialogOptions{
		DefaultDirectory:           homeDir,
		ShowHiddenFiles:            false,
		CanCreateDirectories:       false,
		TreatPackagesAsDirectories: false,
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Images (*.jpg;*.png)",
				Pattern:     "*.png;*.jpg",
			},
		},
	}

	modelsFile := filepath.Join(baseDir, "models", "models.json")
	mfb, err := os.ReadFile(modelsFile)
	if err != nil {
		if !errors.Is(err, os.ErrNotExist) {
			return err
		}
		v := []Model{{Label: "Seleciona Machote", Value: "empty"}}
		b, err := json.Marshal(v)
		if err != nil {
			return err
		}
		tmp := modelsFile + ".tmp"
		err = os.WriteFile(tmp, b, 0644)
		if err != nil {
			return err
		}
		err = os.Rename(tmp, modelsFile)
		if err != nil {
			return err
		}
		mfb = b
	}

	var existingModels []Model
	err = json.Unmarshal(mfb, &existingModels)
	if err != nil {
		return err
	}

	seenHash := make(map[string]struct{}, len(existingModels))
	seenPath := make(map[string]struct{}, len(existingModels))
	for _, m := range existingModels {
		if h, ok := hashFromSavedPath(m.Value); ok {
			seenHash[h] = struct{}{}
		}
		seenPath[m.Value] = struct{}{}

	}

	models, err := runtime.OpenMultipleFilesDialog(a.ctx, cfg)
	if err != nil {
		return err
	}

	for _, m := range models {
		fn := filepath.Base(m)
		b, err := os.ReadFile(m)
		if err != nil {
			fmt.Println(concat("could not read file: ", m))
			continue
		}
		sum := sha256.Sum256(b)
		h := hex.EncodeToString(sum[:])
		ext := strings.ToLower(filepath.Ext(fn))
		outName := h + ext
		outPath := filepath.Join(imagesDir, outName)

		if _, dup := seenHash[h]; dup {
			if _, alreadyListed := seenPath[outPath]; alreadyListed {
				continue
			}
			existingModels = append(existingModels, Model{Label: fn, Value: outPath})
			seenPath[outPath] = struct{}{}
			continue
		}

		if _, err := os.Stat(outPath); errors.Is(err, os.ErrNotExist) {
			if err := os.WriteFile(outPath, b, 0644); err != nil {
				fmt.Println(concat("could not write file ", outPath, " err ", err.Error()))
				continue
			}
		}

		existingModels = append(existingModels, Model{Label: fn, Value: outPath})
		seenHash[h] = struct{}{}
		seenPath[outPath] = struct{}{}
	}

	data, err := json.MarshalIndent(existingModels, "", " ")
	if err != nil {
		return err
	}

	err = os.WriteFile(modelsFile, data, 0644)
	if err != nil {
		return err
	}

	return nil
}
