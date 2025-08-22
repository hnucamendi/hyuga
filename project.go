package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"image"
	"image/draw"
	"io"
	"math"
	"os"
	"path/filepath"
	"regexp"
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
		if m := dataURLRe.FindStringIndex(v.Cutout); m != nil {
			v.Cutout = v.Cutout[m[1]:]
		}
		reader := base64.NewDecoder(base64.StdEncoding, strings.NewReader(strings.TrimSpace(v.Cutout)))
		img, format, err := image.Decode(reader)
		if err != nil {
			return err
		}

		rgba := toRGBA(img)
		x, y, rect := fitWithinA4(rgba.Bounds().Dx(), rgba.Bounds().Dy())

		fmt.Println("TAMO", format)

		if err := pdf.ImageFrom(rgba, x, y, rect); err != nil {
			return err
		}

		// if asset.Cutout != "" {
		// 	if err := drawBase64Image(pdf, v.Cutout, pageSize.W/2, pageSize.H/2); err != nil {
		// 		fmt.Printf("warning: failed to decode cutout: %v\n", err)
		// 	}
		// }
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
