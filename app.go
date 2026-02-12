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
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// ListFonts returns a list of installed font families
func (a *App) ListFonts() ([]string, error) {
	fontMap := make(map[string]bool)

	// Helper to read from registry
	readFonts := func(k registry.Key, path string) {
		key, err := registry.OpenKey(k, path, registry.QUERY_VALUE)
		if err != nil {
			return
		}
		defer key.Close()

		names, err := key.ReadValueNames(-1)
		if err != nil {
			return
		}

		for _, name := range names {
			// Key is usually "Name (TrueType)" or similar
			// Example: "Arial (TrueType)" -> "Arial"
			cleanName := name
			if idx := strings.LastIndex(cleanName, " ("); idx != -1 {
				cleanName = cleanName[:idx]
			}
			fontMap[cleanName] = true
		}
	}

	readFonts(registry.LOCAL_MACHINE, `SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts`)
	readFonts(registry.CURRENT_USER, `SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts`)

	var fonts []string
	for f := range fontMap {
		fonts = append(fonts, f)
	}
	sort.Strings(fonts)

	return fonts, nil
}
