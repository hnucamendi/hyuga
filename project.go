package main

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	rpg "github.com/kevinburke/go-random-project-generator"
)

type PhotoType string

const (
	SHEET  PhotoType = "sheet"
	CUTOUT PhotoType = "cutout"
)

type AssetMetadata struct {
	AssetID    string `json:"asset_id"`
	PageNumber string `json:"page_number"`
	Section    string `json:"section"`
}

type Project struct {
	Id        string            `json:"id"`
	Name      string            `json:"name"`
	CreatedAt string            `json:"created_at"`
	Assets    []string          `json:"assets"`
	Metadata  map[string]string `json:"metadata"`
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

	dir, err := os.ReadDir(projectsPath)
	if err != nil {
		return nil, err
	}

	var res = make([]Project, len(dir))
	for i, v := range dir {
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
	path := filepath.Join(base, "projects", id, "project.json")
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

func (a *App) CreateProject() error {
	name := rpg.Generate()
	id := uuid.NewString()
	base, err := getBaseConfigPath()
	if err != nil {
		return err
	}

	projectsDir := filepath.Join(base, "projects", id)
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
		Assets:    []string{},
		Metadata:  map[string]string{},
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

	path := filepath.Join(base, "projects", id)
	err = os.RemoveAll(path)
	if err != nil {
		return err
	}

	return nil
}

func (a *App) UploadPhoto(base64Data string, imageType PhotoType, projectId string, attributeId string) error {
	data, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return fmt.Errorf("failed to decode base64: %w", err)
	}

	base, err := getBaseConfigPath()
	if err != nil {
		return err
	}

	dirPath := filepath.Join(base, "projects", projectId, attributeId, "images")
	err = os.MkdirAll(dirPath, 0755)
	if err != nil {
		return fmt.Errorf("failed to create project path: %w", err)
	}

	timestamp := time.Now().Format("20060102-150405")
	filename := fmt.Sprintf("%s-%s.jpg", strings.ToLower(string(imageType)), timestamp)
	filePath := filepath.Join(dirPath, filename)

	// 4. Write file
	err = os.WriteFile(filePath, data, 0644)
	if err != nil {
		return fmt.Errorf("failed to write image: %w", err)
	}

	return nil
}

func (a *App) SaveAsset(projectId string, assetId string, pageNumber string, section string) error {
	if projectId == "" || assetId == "" {
		return fmt.Errorf("projectId and assetId are required")
	}

	base, err := getBaseConfigPath()
	if err != nil {
		return err
	}

	// Load existing project.json
	projectPath := filepath.Join(base, "projects", projectId, "project.json")
	b, err := os.ReadFile(projectPath)
	if err != nil {
		return fmt.Errorf("failed to read project.json: %w", err)
	}

	var proj Project
	if err := json.Unmarshal(b, &proj); err != nil {
		return fmt.Errorf("invalid project JSON: %w", err)
	}

	metaPath := filepath.Join(base, "projects", projectId, assetId, "metadata.json")
	if err := os.MkdirAll(filepath.Dir(metaPath), 0755); err != nil {
		return fmt.Errorf("failed to create metadata dir: %w", err)
	}

	meta := AssetMetadata{
		AssetID:    assetId,
		PageNumber: pageNumber,
		Section:    section,
	}
	data, err := json.MarshalIndent(meta, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal metadata: %w", err)
	}

	fmt.Println(meta)

	if err := os.WriteFile(metaPath, data, 0644); err != nil {
		return fmt.Errorf("failed to write metadata file: %w", err)
	}

	return nil
}

func (a *App) LoadAssets(projectId string) ([]AssetMetadata, error) {
	if projectId == "" {
		return nil, fmt.Errorf("projectId required")
	}

	base, err := getBaseConfigPath()
	if err != nil {
		return nil, err
	}

	projectDir := filepath.Join(base, "projects", projectId)
	dirs, err := os.ReadDir(projectDir)
	if err != nil {
		return nil, fmt.Errorf("cannot read project folder: %w", err)
	}

	var metas []AssetMetadata
	for _, entry := range dirs {
		if !entry.IsDir() {
			continue
		}
		metaFile := filepath.Join(projectDir, entry.Name(), "metadata.json")
		data, err := os.ReadFile(metaFile)
		if err != nil {
			continue // skip if missing
		}
		var m AssetMetadata
		if err := json.Unmarshal(data, &m); err != nil {
			continue
		}
		metas = append(metas, m)
	}

	return metas, nil
}
