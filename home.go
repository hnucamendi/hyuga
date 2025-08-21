package main

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	rpg "github.com/kevinburke/go-random-project-generator"
)

type Project struct {
	Id        string          `json:"id"`
	Name      string          `json:"name"`
	CreatedAt string          `json:"created_at"`
	Assets    []AssetMetadata `json:"assets"`
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
	name := rpg.Generate()
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
