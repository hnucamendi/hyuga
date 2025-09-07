package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"image"
	"image/draw"
	"math"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/signintech/gopdf"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	rt "github.com/wailsapp/wails/v2/pkg/runtime"
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
	Model      string `json:"model"`
}

type Region struct {
	X, Y, W, H float64
}

func (a *App) UploadAsset(projectId string, as AssetMetadata) error {
	if projectId == "" || as.ID == "" {
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

	ok := ensureUnique(proj, as)
	if !ok {
		fmt.Println(concat("project: ", proj.Id, " already exists"))
		return nil
	}

	proj.Assets = append(proj.Assets, as)

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

func toRGBA(src image.Image) *image.RGBA {
	if dst, ok := src.(*image.RGBA); ok {
		return dst // already 8-bit RGBA
	}
	b := src.Bounds()
	dst := image.NewRGBA(b)
	draw.Draw(dst, b, src, b.Min, draw.Src)
	return dst
}

func fitWithinRegion(imgWpx, imgHpx int, region Region, padding float64) (x, y float64, r *gopdf.Rect) {
	iw := float64(imgWpx)
	ih := float64(imgHpx)
	if iw <= 0 || ih <= 0 {
		// Fallback: fill region minus padding (unlikely but safe)
		return region.X + padding, region.Y + padding,
			&gopdf.Rect{W: region.W - 2*padding, H: region.H - 2*padding}
	}
	availW := region.W - 2*padding
	availH := region.H - 2*padding
	scale := math.Min(availW/iw, availH/ih)
	drawW := iw * scale
	drawH := ih * scale
	x = region.X + (region.W-drawW)/2.0
	y = region.Y + (region.H-drawH)/2.0
	return x, y, &gopdf.Rect{W: drawW, H: drawH}
}

func fitWithinA4(imgWpx, imgHpx int) (x, y float64, r *gopdf.Rect) {
	margin := 36.0 // 0.5 inch margins
	maxW := gopdf.PageSizeA4.W - 2*margin
	maxH := gopdf.PageSizeA4.H - 2*margin

	iw := float64(imgWpx)
	ih := float64(imgHpx)

	// handle degenerate case
	if iw <= 0 || ih <= 0 {
		return margin, margin, &gopdf.Rect{W: maxW, H: maxH}
	}

	scale := math.Min(maxW/iw, maxH/ih)
	drawW := iw * scale
	drawH := ih * scale

	x = (gopdf.PageSizeA4.W - drawW) / 2.0
	y = (gopdf.PageSizeA4.H - drawH) / 2.0
	return x, y, &gopdf.Rect{W: drawW, H: drawH}
}

func configSavePath(ctx context.Context, proj Project) (string, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	dir := filepath.Join(homeDir, "Downloads")
	dialogOpts := rt.SaveDialogOptions{
		DefaultDirectory:           dir,
		DefaultFilename:            concat(proj.Name, ".pdf"),
		Title:                      "Choose location to save PDF",
		ShowHiddenFiles:            false,
		CanCreateDirectories:       false,
		TreatPackagesAsDirectories: false,
	}

	path, err := rt.SaveFileDialog(ctx, dialogOpts)
	if err != nil {
		return "", err
	}
	return path, nil
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

	path, err := configSavePath(a.ctx, proj)
	if err != nil {
		return err
	}
	if path == "" {
		return errors.New("no file path provided")
	}

	pdf := &gopdf.GoPdf{}
	pageSize := *gopdf.PageSizeA4
	pdf.Start(gopdf.Config{PageSize: pageSize})

	fontPath := filepath.Join("fonts", "times.ttf")
	if err := pdf.AddTTFFont("times", fontPath); err != nil {
		return fmt.Errorf("failed to load font: %w", err)
	}

	for _, v := range proj.Assets {
		pdf.AddPage()
		var dataURLRe = regexp.MustCompile(`^data:(?P<mime>[-\w.+/]+)?(?:;charset=[\w-]+)?;base64,`)
		if m := dataURLRe.FindStringIndex(v.Sheet); m != nil {
			v.Sheet = v.Sheet[m[1]:]
		}
		if m := dataURLRe.FindStringIndex(v.Cutout); m != nil {
			v.Cutout = v.Cutout[m[1]:]
		}
		if m := dataURLRe.FindStringIndex(v.Model); m != nil {
			v.Model = v.Model[m[1]:]
		}
		sheetReader := base64.NewDecoder(base64.StdEncoding, strings.NewReader(strings.TrimSpace(v.Sheet)))
		cutoutReader := base64.NewDecoder(base64.StdEncoding, strings.NewReader(strings.TrimSpace(v.Cutout)))
		modelReader := base64.NewDecoder(base64.StdEncoding, strings.NewReader(strings.TrimSpace(v.Model)))
		sheetImg, _, err := image.Decode(sheetReader)
		if err != nil {
			return err
		}
		cutoutImg, _, err := image.Decode(cutoutReader)
		if err != nil {
			return err
		}
		modelImg, _, err := image.Decode(modelReader)
		if err != nil {
			return err
		}

		sheetRgba := toRGBA(sheetImg)
		cutoutRgba := toRGBA(cutoutImg)
		modelRgba := toRGBA(modelImg)
		sx, sy, srect := fitWithinA4(sheetRgba.Bounds().Dx(), sheetRgba.Bounds().Dy())
		if err := pdf.ImageFrom(sheetRgba, sx, sy, srect); err != nil {
			return err
		}
		pdf.AddPage()
		const margin = 36.0
		const gap = 12.0
		pageW := gopdf.PageSizeA4.W
		pageH := gopdf.PageSizeA4.H
		contentW := pageW - 2*margin
		contentH := pageH - 2*margin
		topH := contentH * 0.40
		midY := margin + topH + gap
		midH := contentH - topH - gap
		topRegion := Region{
			X: margin,
			Y: margin,
			W: contentW,
			H: topH,
		}
		midRegion := Region{
			X: margin,
			Y: midY,
			W: contentW,
			H: midH,
		}
		const innerPad = 4.0
		mx, my, mrect := fitWithinRegion(modelRgba.Bounds().Dx(), modelRgba.Bounds().Dy(), topRegion, innerPad)
		if err := pdf.ImageFrom(modelRgba, mx, my, mrect); err != nil {
			return err
		}

		cx, cy, crect := fitWithinRegion(cutoutRgba.Bounds().Dx(), cutoutRgba.Bounds().Dy(), midRegion, innerPad)
		if err := pdf.ImageFrom(cutoutRgba, cx, cy, crect); err != nil {
			return err
		}
	}

	if err := pdf.WritePdf(path); err != nil {
		return fmt.Errorf("failed to write PDF: %w", err)
	}

	return nil
}

func (a *App) LoadModels() ([]Model, error) {
	base, err := getBaseConfigPath()
	if err != nil {
		return nil, err
	}

	modelsFile := filepath.Join(base, "models", "models.json")
	modelsByte, err := os.ReadFile(modelsFile)
	if err != nil {
		return nil, err
	}

	var models []Model
	err = json.Unmarshal(modelsByte, &models)
	if err != nil {
		return nil, err
	}

	return models, nil
}

func (a *App) PickImageAndReturnPath() (string, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", err
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

	fp, err := rt.OpenFileDialog(a.ctx, cfg)
	if err != nil {
		return "", err
	}

	return fp, nil
}
