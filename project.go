package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"time"

	rpg "github.com/kevinburke/go-random-project-generator"
)

type Project struct {
	Name      string            `json:"name"`
	CreatedAt time.Time         `json:"created_at"`
	Assets    []string          `json:"assets"`
	Metadata  map[string]string `json:"metadata"`
}

func (a *App) LoadProjects() ([]Project, error) {
	base, err := getBaseConfigPath()
	if err != nil {
		return nil, err
	}

	projectsPath := filepath.Join(base, "projects")
	dirs, err := os.ReadDir(projectsPath)
	if err != nil {
		return nil, err
	}

	var res []Project
	for _, e := range dirs {
		if !e.IsDir() {
			continue
		}
		cfgPath := filepath.Join(projectsPath, e.Name(), "project.json")
		data, err := os.ReadFile(cfgPath)
		if err != nil {
			continue
		}
		var p Project
		if err := json.Unmarshal(data, &p); err != nil {
			continue
		}
		res = append(res, p)
	}
	return res, nil
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
	base, err := getBaseConfigPath()
	if err != nil {
		return err
	}

	projectsDir := filepath.Join(base, "projects")
	if err := os.MkdirAll(projectsDir, 0755); err != nil {
		return err
	}

	projectPath := filepath.Join(projectsDir, name)
	if err := os.MkdirAll(projectsDir, 0755); err != nil {
		return err
	}

	proj := Project{
		Name:      name,
		CreatedAt: time.Now(),
		Assets:    []string{},
		Metadata:  map[string]string{},
	}

	data, err := json.MarshalIndent(proj, "", "  ")
	if err != nil {
		return err
	}

	err = os.WriteFile(filepath.Join(projectPath, "project.json"), data, 0644)
	if err != nil {
		return err
	}

	return nil
}
