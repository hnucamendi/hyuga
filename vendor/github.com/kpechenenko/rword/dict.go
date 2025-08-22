package rword

import (
	"os"
	"path/filepath"
	"runtime"
	"strings"
)

// LoadDictFromFile load dictionary from file.
// 1 line - 1 word, skip empty lines.
func LoadDictFromFile(name string) (Dictionary, error) {
	content, err := os.ReadFile(name)
	if err != nil {
		return nil, err
	}
	src := strings.Split(string(content), "\n")
	dict := make(Dictionary, 0, len(src))
	for _, w := range src {
		w = strings.TrimSpace(w)
		if w == "" {
			continue
		}
		dict = append(dict, w)
	}
	return dict, nil
}

const defaultDictFile = "data/dict"

// GetPathToDefaultDict with 370_000+ words.
func GetPathToDefaultDict() string {
	_, path, _, _ := runtime.Caller(0) //nolint:dogsled
	path = filepath.Join(filepath.Dir(path), defaultDictFile)
	return path
}
