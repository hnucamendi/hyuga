package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"image"
	"io"
	"math"
	"mime"
	"os"
	"path/filepath"
	"strings"

	"github.com/signintech/gopdf"
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

func (a *App) SaveAsset(projectId string, assetId string, pageNumber string, section string, sheet string, cutout string) error {
	if projectId == "" || assetId == "" {
		return fmt.Errorf("projectId and assetId are required")
	}

	base, err := getBaseConfigPath()
	if err != nil {
		return err
	}

	projectPath := filepath.Join(base, "projects", concat("project-", projectId), "project.json")
	b, err := os.ReadFile(projectPath)
	if err != nil {
		return fmt.Errorf("failed to read project.json: %w", err)
	}

	var proj Project
	if err := json.Unmarshal(b, &proj); err != nil {
		return fmt.Errorf("invalid project JSON: %w", err)
	}

	asset := AssetMetadata{
		ID:         assetId,
		PageNumber: pageNumber,
		Section:    section,
		Sheet:      sheet,
		Cutout:     cutout,
	}

	ok := ensureUnique(proj, asset)
	if !ok {
		fmt.Println(concat("project: ", proj.Id, " already exists"))
		return nil
	}

	proj.Assets = append(proj.Assets, asset)

	data, err := json.MarshalIndent(proj, "", "  ")
	if err != nil {
		return err
	}

	err = os.WriteFile(projectPath, data, 0644)
	if err != nil {
		return err
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

	projectPath := filepath.Join(base, "projects", concat("project-", projectId), "project.json")
	b, err := os.ReadFile(projectPath)
	if err != nil {
		return nil, fmt.Errorf("cannot read project folder: %w", err)
	}

	var proj Project
	if err := json.Unmarshal(b, &proj); err != nil {
		return nil, fmt.Errorf("invalid project JSON %w", err)
	}

	return proj.Assets, nil
}

func (a *App) DeleteAsset(projectId string, assetId string) error {
	if projectId == "" || assetId == "" {
		return fmt.Errorf("required project or asset ID not found")
	}

	base, err := getBaseConfigPath()
	if err != nil {
		return err
	}

	projectPath := filepath.Join(base, "projects", concat("project-", projectId), "project.json")
	b, err := os.ReadFile(projectPath)
	if err != nil {
		return fmt.Errorf("cannot read project folder: %w", err)
	}

	var proj Project
	if err := json.Unmarshal(b, &proj); err != nil {
		return fmt.Errorf("invalid project JSON %w", err)
	}

	index := -1
	for i, asset := range proj.Assets {
		if asset.ID == assetId {
			index = i
			break
		}
	}

	if index == -1 {
		return fmt.Errorf("asset with ID %s not found in project", assetId)
	}

	proj.Assets[index] = proj.Assets[len(proj.Assets)-1]
	proj.Assets = proj.Assets[:len(proj.Assets)-1]

	updated, err := json.MarshalIndent(proj, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to serialize updated project: %w", err)
	}

	if err := os.WriteFile(projectPath, updated, 0644); err != nil {
		return fmt.Errorf("failed to write updated project file: %w", err)
	}
	return nil
}

func (a *App) UploadPhoto(path string) (string, string, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return "", "", err
	}

	ext := filepath.Ext(path)
	mimeType := mime.TypeByExtension(ext)
	if mimeType == "" {
		mimeType = "image/jpeg" // fallback
	}

	encoded := base64.StdEncoding.EncodeToString(data)
	return encoded, mimeType, nil
}

func (a *App) GeneratePDF(projectId string) error {
	if projectId == "" {
		return fmt.Errorf("required project or asset ID not found")
	}

	base, err := getBaseConfigPath()
	if err != nil {
		return err
	}

	projectPath := filepath.Join(base, "projects", concat("project-", projectId), "project.json")
	b, err := os.ReadFile(projectPath)
	if err != nil {
		return fmt.Errorf("cannot read project folder: %w", err)
	}

	var proj Project
	if err := json.Unmarshal(b, &proj); err != nil {
		return fmt.Errorf("invalid project JSON %w", err)
	}

	fmt.Println("TAMO")

	pdf := &gopdf.GoPdf{}
	pageSize := *gopdf.PageSizeA4
	pdf.Start(gopdf.Config{PageSize: pageSize})

	fontPath := filepath.Join("fonts", "Arial.ttf")
	if err := pdf.AddTTFFont("Arial", fontPath); err != nil {
		return fmt.Errorf("failed to load font: %w", err)
	}
	if err := pdf.SetFont("Arial", "", 14); err != nil {
		return fmt.Errorf("failed to set font: %w", err)
	}

	for _, asset := range proj.Assets {
		pdf.AddPage()

		// Write metadata
		pdf.SetY(40)
		pdf.Cell(nil, fmt.Sprintf("Section: %s", asset.Section))
		pdf.Br(20)
		pdf.Cell(nil, fmt.Sprintf("Page Number: %s", asset.PageNumber))
		pdf.Br(20)

		if asset.Cutout != "" {
			if err := drawBase64Image(pdf, asset.Cutout, pageSize.W/2, pageSize.H/2); err != nil {
				fmt.Printf("warning: failed to decode cutout: %v\n", err)
			}
		}
	}

	outputPath := filepath.Join(projectPath, "../", "output.pdf")
	if err := pdf.WritePdf(outputPath); err != nil {
		return fmt.Errorf("failed to write PDF: %w", err)
	}

	return nil
}

// drawBase64Image decodes a base64 string and draws it at the specified x,y
func drawBase64Image(pdf *gopdf.GoPdf, base64Str string, x, y float64) error {
	// Strip data URI prefix if present
	if idx := strings.Index(base64Str, "base64,"); idx != -1 {
		base64Str = base64Str[idx+7:]
	}

	imgBytes, err := base64.StdEncoding.DecodeString(base64Str)
	if err != nil {
		return fmt.Errorf("base64 decode error: %w", err)
	}

	imgReader := bytes.NewReader(imgBytes)
	img, _, err := image.Decode(imgReader)
	if err != nil {
		return fmt.Errorf("image decode error: %w", err)
	}

	bounds := img.Bounds()
	imgW := float64(bounds.Dx())
	imgH := float64(bounds.Dy())

	margin := 40.0
	maxW := x * margin
	maxH := y * margin

	scaleW := maxW / imgW
	scaleH := maxH / imgH
	scale := math.Min(scaleW, scaleH)

	scaledW := imgW * scale
	scaledH := imgH * scale

	y = (y - scaledH) / 2
	x = (x - scaledW) / 2

	if _, err := imgReader.Seek(0, io.SeekStart); err != nil {
		return fmt.Errorf("failed to reset image reader: %w", err)
	}

	rect := &gopdf.Rect{W: scaledW, H: scaledH}

	if err := pdf.ImageFrom(img, x, y, rect); err != nil {
		return fmt.Errorf("error embedding image in PDF: %w", err)
	}

	return nil
}
