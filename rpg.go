package main

import (
	"path/filepath"
	"strings"

	"github.com/kpechenenko/rword"
)

func Generate() (string, error) {
	adjPath := filepath.Join("spanish_adjectives.txt")
	nounPath := filepath.Join("spanish_nouns.txt")
	adjectives, err := rword.NewWithDict(adjPath)
	if err != nil {
		return "", err
	}
	nouns, err := rword.NewWithDict(nounPath)
	if err != nil {
		return "", err
	}
	return strings.Join([]string{adjectives.Word(), nouns.Word()}, "-"), nil
}
