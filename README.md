# GlyphDeck

A premium desktop font manager for Windows — browse, preview, search, and organize your installed fonts with a sleek glassmorphism UI.

Built with **Wails** (Go backend + React/TypeScript frontend).

---

## Features

### Core
- **System Font Detection** — Reads all installed fonts from the Windows Registry (HKLM + HKCU)
- **Live Preview** — Type custom text and see it rendered instantly in any font
- **Search** — Filter fonts by name in real-time
- **Font Size Slider** — Adjust preview size from 12px to 96px with smooth transitions

### Views
- **Grid View** — Card-based layout with font name, category badge, and preview
- **List View** — Compact row layout for quick scanning

### Categories
Fonts are automatically classified into:
- Sans Serif
- Serif
- Monospace
- Handwriting
- Display
- Symbol

Classification uses a combination of known font lists and name-based heuristics.

### Favorites
- **★ Toggle** — Click the star on any font to add/remove from favorites
- **Favorites Tab** — Golden-accented tab to filter only favorites
- **Persistent Storage** — Favorites are saved to `%APPDATA%/GlyphDeck/favorites.json` and survive app updates/reinstalls
- **Export** — Save favorites to a JSON file via Save dialog
- **Import** — Load & merge favorites from a JSON file via Open dialog

### Design
- Premium **glassmorphism** UI with backdrop blur and subtle gradients
- **Outfit** font from Google Fonts
- Atmospheric glow orbs and smooth hover animations
- Animated toast notifications
- Custom scrollbar styling
- Fully responsive layout

---

## Screenshots

> Run the app to see the live UI — grid/list views, category tabs, favorites, and more.

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Backend  | Go 1.18+                         |
| Frontend | React 18 + TypeScript + Vite     |
| Framework| Wails v2                         |
| Styling  | Vanilla CSS (glassmorphism)      |
| Font     | Google Fonts (Outfit)            |
| Installer| NSIS                             |

---

## Prerequisites

- [Go](https://go.dev/) 1.18+
- [Node.js](https://nodejs.org/) 16+
- [Wails CLI](https://wails.io/) v2
- [NSIS](https://nsis.sourceforge.io/) (only for building the installer)

---

## Getting Started

### Development

```bash
wails dev
```

Opens the app with hot-reload. Frontend changes reflect instantly.

### Production Build

```bash
wails build
```

Output: `build/bin/GlyphDeck.exe`

### Build with Installer

```bash
wails build -clean -nsis
```

Output: `build/bin/GlyphDeck-amd64-installer.exe`

The installer:
- Installs to `C:\Program Files\GlyphDeck`
- Creates desktop & start menu shortcuts
- Bundles WebView2 runtime
- Supports **in-place upgrades** — detects previous installations and updates files
- Includes uninstaller

---

## Project Structure

```
GlyphDeck/
├── app.go                 # Font listing, category classification
├── favorites.go           # Favorites store (toggle, export, import)
├── main.go                # Wails app entry point
├── wails.json             # Wails project config
├── build/
│   ├── bin/               # Build output (exe + installer)
│   └── windows/
│       └── installer/
│           └── project.nsi # NSIS installer script
├── frontend/
│   ├── index.html         # HTML entry + Google Fonts
│   └── src/
│       ├── App.tsx         # Main React component
│       ├── App.css         # All styles (glassmorphism)
│       └── style.css       # CSS reset
└── .gitignore
```

---

## Data Storage

| Data       | Location                                    | Survives Reinstall |
|------------|---------------------------------------------|--------------------|
| Favorites  | `%APPDATA%/GlyphDeck/favorites.json`        | ✅ Yes             |
| App Files  | `C:\Program Files\GlyphDeck\`               | ❌ Replaced        |

---

## Changelog

### v1.1.0
- Font category classification (Sans Serif, Serif, Monospace, Handwriting, Display, Symbol)
- Grid and List view modes
- Category filter tabs with counts
- Favorites with persistent storage
- Export/Import favorites (backup & restore)
- Toast notifications
- NSIS installer with upgrade support

### v1.0.0
- System font detection from Windows Registry
- Live text preview with custom input
- Font search
- Font size slider
- Premium glassmorphism design
- NSIS installer

---

## Author

**bbinxx** — [bibinraju541@gmail.com](mailto:bibinraju541@gmail.com)

## License

[MIT](https://choosealicense.com/licenses/mit/)
