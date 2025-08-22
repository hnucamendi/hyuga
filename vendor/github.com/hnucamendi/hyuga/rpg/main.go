package rpg

import (
	"strings"

	"github.com/kpechenenko/rword"
)

func Generate() (string, error) {
	adjectives, err := rword.NewWithDict("./spanish_adjectives.txt")
	if err != nil {
		return "", err
	}
	nouns, err := rword.NewWithDict("./spanish_nouns.txt")
	if err != nil {
		return "", err
	}
	return strings.Join([]string{adjectives.Word(), nouns.Word()}, "-"), nil
}
