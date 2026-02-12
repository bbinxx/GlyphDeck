package main

import (
	"context"
	"fmt"
	"sort"
	"strings"

	"golang.org/x/sys/windows/registry"
)

// App struct
type App struct {
	ctx      context.Context
	favStore *FavoritesStore
}

// FontInfo holds font name and its detected category
type FontInfo struct {
	Name     string `json:"name"`
	Category string `json:"category"`
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		favStore: NewFavoritesStore(),
	}
}

// startup is called when the app starts
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Well-known font classification lists
var serifFonts = map[string]bool{
	"times new roman": true, "georgia": true, "garamond": true, "palatino linotype": true,
	"book antiqua": true, "cambria": true, "constantia": true, "didot": true,
	"bodoni": true, "rockwell": true, "baskerville": true, "perpetua": true,
	"calisto mt": true, "goudy old style": true, "high tower text": true,
	"lucida bright": true, "sylfaen": true, "bell mt": true, "footlight mt light": true,
	"century schoolbook": true, "batang": true, "mingliu": true, "simsun": true,
	"ms mincho": true, "pmingLiU": true,
}

var monoFonts = map[string]bool{
	"courier new": true, "consolas": true, "lucida console": true, "cascadia code": true,
	"cascadia mono": true, "fira code": true, "jetbrains mono": true, "source code pro": true,
	"roboto mono": true, "ubuntu mono": true, "ibm plex mono": true, "sf mono": true,
	"dejavu sans mono": true, "liberation mono": true, "droid sans mono": true,
	"hack": true, "menlo": true, "monaco": true, "inconsolata": true,
	"noto sans mono": true, "anonymous pro": true, "fixedsys": true, "terminal": true,
	"ms gothic": true, "nsimsun": true,
}

var displayFonts = map[string]bool{
	"impact": true, "stencil": true, "broadway": true, "cooper black": true,
	"bauhaus 93": true, "algerian": true, "playbill": true, "showcard gothic": true,
	"snap itc": true, "ravie": true, "jokerman": true, "chiller": true,
	"harlow solid italic": true, "magneto": true, "castellar": true,
	"forte": true, "goudy stout": true, "wide latin": true, "onyx": true,
	"niagara solid": true, "niagara engraved": true, "old english text mt": true,
	"juice itc": true, "curlz mt": true, "kristen itc": true, "papyrus": true,
}

var handwritingFonts = map[string]bool{
	"comic sans ms": true, "segoe script": true, "script mt bold": true,
	"lucida handwriting": true, "mistral": true, "brush script mt": true,
	"freestyle script": true, "french script mt": true, "edwardian script itc": true,
	"palace script mt": true, "rage italic": true, "pristina": true,
	"vladimir script": true, "vivaldi": true, "monotype corsiva": true,
	"segoe print": true, "tempus sans itc": true, "ink free": true,
	"bradley hand itc": true, "gigi": true, "harrington": true,
}

// classifyFont determines font category based on known lists and name heuristics
func classifyFont(name string) string {
	lower := strings.ToLower(name)

	if monoFonts[lower] {
		return "Monospace"
	}
	if serifFonts[lower] {
		return "Serif"
	}
	if handwritingFonts[lower] {
		return "Handwriting"
	}
	if displayFonts[lower] {
		return "Display"
	}

	// Heuristics based on name keywords
	if strings.Contains(lower, "mono") || strings.Contains(lower, "code") || strings.Contains(lower, "console") || strings.Contains(lower, "terminal") {
		return "Monospace"
	}
	if strings.Contains(lower, "script") || strings.Contains(lower, "handwrit") || strings.Contains(lower, "brush") || strings.Contains(lower, "callig") {
		return "Handwriting"
	}
	if strings.Contains(lower, "display") || strings.Contains(lower, "poster") || strings.Contains(lower, "stencil") || strings.Contains(lower, "decorat") {
		return "Display"
	}
	if strings.Contains(lower, "serif") && !strings.Contains(lower, "sans") {
		return "Serif"
	}
	if strings.Contains(lower, "symbol") || strings.Contains(lower, "wingding") || strings.Contains(lower, "webding") || strings.Contains(lower, "dingbat") || strings.Contains(lower, "emoji") {
		return "Symbol"
	}

	return "Sans Serif"
}

// GetFonts returns a list of FontInfo with name and category
func (a *App) GetFonts() ([]FontInfo, error) {
	fontMap := make(map[string]bool)

	readFonts := func(k registry.Key, path string) {
		key, err := registry.OpenKey(k, path, registry.READ)
		if err != nil {
			fmt.Printf("Error opening registry key %s: %v\n", path, err)
			return
		}
		defer key.Close()

		names, err := key.ReadValueNames(-1)
		if err != nil {
			fmt.Printf("Error reading value names from %s: %v\n", path, err)
			return
		}

		for _, name := range names {
			cleanName := name
			if idx := strings.LastIndex(cleanName, " ("); idx != -1 {
				cleanName = cleanName[:idx]
			}
			fontMap[cleanName] = true
		}
	}

	readFonts(registry.LOCAL_MACHINE, `SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts`)
	readFonts(registry.CURRENT_USER, `SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts`)

	var fonts []FontInfo
	for f := range fontMap {
		fonts = append(fonts, FontInfo{
			Name:     f,
			Category: classifyFont(f),
		})
	}

	sort.Slice(fonts, func(i, j int) bool {
		return strings.ToLower(fonts[i].Name) < strings.ToLower(fonts[j].Name)
	})

	if len(fonts) == 0 {
		fonts = append(fonts,
			FontInfo{Name: "Arial", Category: "Sans Serif"},
			FontInfo{Name: "Courier New", Category: "Monospace"},
			FontInfo{Name: "Georgia", Category: "Serif"},
			FontInfo{Name: "Times New Roman", Category: "Serif"},
			FontInfo{Name: "Verdana", Category: "Sans Serif"},
		)
	}

	return fonts, nil
}

// ListFonts kept for backward compat
func (a *App) ListFonts() ([]string, error) {
	infos, err := a.GetFonts()
	if err != nil {
		return nil, err
	}
	var names []string
	for _, f := range infos {
		names = append(names, f.Name)
	}
	return names, nil
}
