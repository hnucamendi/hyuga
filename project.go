package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type PhotoType string

const (
	SHEET  PhotoType = "sheet"
	CUTOUT PhotoType = "cutout"
)

type AssetMetadata struct {
	ID         string `json:"id"`
	Sheet      string `json:"sheet"`
	Cutout     string `json:"cutout"`
	PageNumber string `json:"pageNumber"`
	Section    string `json:"section"`
	Saved      bool   `json:"saved"`
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
		ID:         assetId,
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
	entries, err := os.ReadDir(projectDir)
	if err != nil {
		return nil, fmt.Errorf("cannot read project folder: %w", err)
	}

	var metas []AssetMetadata
	for _, e := range entries {
		if !e.IsDir() {
			continue
		}
		assetDir := filepath.Join(projectDir, e.Name())
		imgDir := filepath.Join(assetDir, "images")
		metaFile := filepath.Join(assetDir, "metadata.json")

		// Load metadata
		b, err := os.ReadFile(metaFile)
		if err != nil {
			continue
		}
		var m AssetMetadata
		if err := json.Unmarshal(b, &m); err != nil {
			continue
		}

		// Load images as base64 if present
		files, err := os.ReadDir(imgDir)
		if err == nil {
			for _, f := range files {
				name := strings.ToLower(f.Name())
				fullPath := filepath.Join(imgDir, f.Name())
				imgBytes, e := os.ReadFile(fullPath)
				if e != nil {
					continue
				}
				encoded := base64.StdEncoding.EncodeToString(imgBytes)
				if strings.HasPrefix(name, "sheet-") && m.Sheet == "" {
					m.Sheet = encoded
				} else if strings.HasPrefix(name, "cutout-") && m.Cutout == "" {
					m.Cutout = encoded
				}
			}
		}

		metas = append(metas, m)
	}

	return metas, nil
}
