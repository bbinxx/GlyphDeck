package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// FavoritesStore manages font favorites with persistence
type FavoritesStore struct {
	mu       sync.Mutex
	favorites map[string]bool
	filePath  string
}

// NewFavoritesStore creates a store that persists to %APPDATA%/GlyphDeck/favorites.json
func NewFavoritesStore() *FavoritesStore {
	appData, err := os.UserConfigDir()
	if err != nil {
		appData = os.Getenv("APPDATA")
	}

	dir := filepath.Join(appData, "GlyphDeck")
	os.MkdirAll(dir, 0755)

	store := &FavoritesStore{
		favorites: make(map[string]bool),
		filePath:  filepath.Join(dir, "favorites.json"),
	}
	store.load()
	return store
}

func (s *FavoritesStore) load() {
	s.mu.Lock()
	defer s.mu.Unlock()

	data, err := os.ReadFile(s.filePath)
	if err != nil {
		return // File doesn't exist yet, that's fine
	}

	var names []string
	if err := json.Unmarshal(data, &names); err != nil {
		return
	}

	s.favorites = make(map[string]bool)
	for _, name := range names {
		s.favorites[name] = true
	}
}

func (s *FavoritesStore) save() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	var names []string
	for name := range s.favorites {
		names = append(names, name)
	}

	data, err := json.MarshalIndent(names, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(s.filePath, data, 0644)
}

// GetFavorites returns the list of favorite font names
func (a *App) GetFavorites() []string {
	a.favStore.mu.Lock()
	defer a.favStore.mu.Unlock()

	var names []string
	for name := range a.favStore.favorites {
		names = append(names, name)
	}
	return names
}

// ToggleFavorite adds or removes a font from favorites
func (a *App) ToggleFavorite(fontName string) bool {
	a.favStore.mu.Lock()
	if a.favStore.favorites[fontName] {
		delete(a.favStore.favorites, fontName)
		a.favStore.mu.Unlock()
		a.favStore.save()
		return false // removed
	}
	a.favStore.favorites[fontName] = true
	a.favStore.mu.Unlock()
	a.favStore.save()
	return true // added
}

// IsFavorite checks if a font is in favorites
func (a *App) IsFavorite(fontName string) bool {
	a.favStore.mu.Lock()
	defer a.favStore.mu.Unlock()
	return a.favStore.favorites[fontName]
}

// ExportFavorites opens a save dialog and exports favorites to a JSON file
func (a *App) ExportFavorites() (string, error) {
	savePath, err := wailsRuntime.SaveFileDialog(a.ctx, wailsRuntime.SaveDialogOptions{
		Title:           "Export Favorites",
		DefaultFilename: "glyphdeck-favorites.json",
		Filters: []wailsRuntime.FileFilter{
			{DisplayName: "JSON Files (*.json)", Pattern: "*.json"},
		},
	})
	if err != nil {
		return "", err
	}
	if savePath == "" {
		return "", nil // user cancelled
	}

	a.favStore.mu.Lock()
	var names []string
	for name := range a.favStore.favorites {
		names = append(names, name)
	}
	a.favStore.mu.Unlock()

	data, err := json.MarshalIndent(names, "", "  ")
	if err != nil {
		return "", fmt.Errorf("failed to marshal favorites: %w", err)
	}

	if err := os.WriteFile(savePath, data, 0644); err != nil {
		return "", fmt.Errorf("failed to write file: %w", err)
	}

	return savePath, nil
}

// ImportFavorites opens a file dialog and imports favorites from a JSON file
func (a *App) ImportFavorites() (int, error) {
	openPath, err := wailsRuntime.OpenFileDialog(a.ctx, wailsRuntime.OpenDialogOptions{
		Title: "Import Favorites",
		Filters: []wailsRuntime.FileFilter{
			{DisplayName: "JSON Files (*.json)", Pattern: "*.json"},
		},
	})
	if err != nil {
		return 0, err
	}
	if openPath == "" {
		return 0, nil // user cancelled
	}

	data, err := os.ReadFile(openPath)
	if err != nil {
		return 0, fmt.Errorf("failed to read file: %w", err)
	}

	var names []string
	if err := json.Unmarshal(data, &names); err != nil {
		return 0, fmt.Errorf("invalid favorites file: %w", err)
	}

	a.favStore.mu.Lock()
	added := 0
	for _, name := range names {
		if !a.favStore.favorites[name] {
			a.favStore.favorites[name] = true
			added++
		}
	}
	a.favStore.mu.Unlock()

	a.favStore.save()
	return added, nil
}
