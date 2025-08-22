package rword

import (
	"errors"
	"math/rand"
	"strings"
)

// GenerateRandom a random word/string generator.
type GenerateRandom interface {
	// Word random word.
	Word() string
	// WordList of random words.
	WordList(n int) []string
	// Str get random string of n length.
	Str(n int) string
}

// Dictionary to select random words.
type Dictionary []string

// Generator generates random words using a saved dictionary.
type Generator struct {
	dict Dictionary // final readonly list of word.
}

// Word get a random word.
func (g *Generator) Word() string {
	i := rand.Intn(len(g.dict))
	return g.dict[i]
}

// WordList get a list of random words.
func (g *Generator) WordList(n int) []string {
	var words []string
	if n <= 0 {
		return words
	}
	words = make([]string, n)
	for i := 0; i < n; i++ {
		words[i] = g.Word()
	}
	return words
}

// Str get random string of n length.
func (g *Generator) Str(n int) string {
	if n <= 0 {
		return ""
	}
	var sb strings.Builder
	for {
		word := g.Word() + " "
		remains := n - sb.Len()
		if len(word) > remains {
			word = word[:remains]
		}
		sb.WriteString(word)
		if sb.Len() == n {
			break
		}
	}
	return sb.String()
}

// New create a word generator with saved dictionary.
func New() (*Generator, error) {
	return NewWithDict(GetPathToDefaultDict())
}

var ErrEmptyDict = errors.New("empty dictionary")

// NewWithDict create a word generator using custom dictionary.
// dictionary - text file, 1 line = 1 word in dictionary.
func NewWithDict(file string) (*Generator, error) {
	dict, err := LoadDictFromFile(file)
	if err != nil {
		return nil, err
	}
	if len(dict) == 0 {
		return nil, ErrEmptyDict
	}
	return &Generator{dict: dict}, nil
}
