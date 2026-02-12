import { useState, useEffect, useMemo, useCallback } from 'react';
import './App.css';
import { GetFonts, GetFavorites, ToggleFavorite, ExportFavorites, ImportFavorites } from "../wailsjs/go/main/App";
import { main } from "../wailsjs/go/models";

type ViewMode = 'grid' | 'list';
const CATEGORIES = ['All', 'Favorites', 'Sans Serif', 'Serif', 'Monospace', 'Handwriting', 'Display', 'Symbol'];

function App() {
    const [fonts, setFonts] = useState<main.FontInfo[]>([]);
    const [previewText, setPreviewText] = useState("The quick brown fox jumps over the lazy dog");
    const [fontSize, setFontSize] = useState(28);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [activeCategory, setActiveCategory] = useState('All');
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [toast, setToast] = useState<string | null>(null);

    // Show toast notification
    const showToast = useCallback((msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    }, []);

    useEffect(() => {
        Promise.all([GetFonts(), GetFavorites()])
            .then(([fontData, favData]) => {
                if (fontData && fontData.length > 0) {
                    setFonts(fontData);
                } else {
                    setError("No fonts found on this system.");
                }
                if (favData) {
                    setFavorites(new Set(favData));
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to load:", err);
                setError("Failed to load fonts: " + String(err));
                setLoading(false);
            });
    }, []);

    const handleToggleFavorite = useCallback(async (fontName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const isNowFav = await ToggleFavorite(fontName);
        setFavorites(prev => {
            const next = new Set(prev);
            if (isNowFav) {
                next.add(fontName);
            } else {
                next.delete(fontName);
            }
            return next;
        });
    }, []);

    const handleExport = useCallback(async () => {
        try {
            const path = await ExportFavorites();
            if (path) {
                showToast(`Exported ${favorites.size} favorites`);
            }
        } catch (err) {
            showToast("Export failed: " + String(err));
        }
    }, [favorites.size, showToast]);

    const handleImport = useCallback(async () => {
        try {
            const added = await ImportFavorites();
            if (added > 0) {
                // Refresh favorites from backend
                const favData = await GetFavorites();
                if (favData) setFavorites(new Set(favData));
                showToast(`Imported ${added} new favorites`);
            } else if (added === 0) {
                showToast("No new favorites to import");
            }
        } catch (err) {
            showToast("Import failed: " + String(err));
        }
    }, [showToast]);

    const filteredFonts = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return fonts.filter(f => {
            const matchesSearch = f.name.toLowerCase().includes(term);
            if (activeCategory === 'Favorites') {
                return matchesSearch && favorites.has(f.name);
            }
            const matchesCategory = activeCategory === 'All' || f.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [fonts, searchTerm, activeCategory, favorites]);

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { All: fonts.length, Favorites: favorites.size };
        for (const f of fonts) {
            counts[f.category] = (counts[f.category] || 0) + 1;
        }
        return counts;
    }, [fonts, favorites]);

    return (
        <div id="app">
            {/* Toast */}
            {toast && <div className="toast">{toast}</div>}

            <header>
                <div className="header-top">
                    <div className="title-area">
                        <h1>GlyphDeck</h1>
                        {!loading && !error && (
                            <span className="font-count">
                                {filteredFonts.length} / {fonts.length}
                            </span>
                        )}
                    </div>

                    <div className="controls">
                        <div className="input-group">
                            <label htmlFor="search">Search</label>
                            <input
                                id="search"
                                className="search-input"
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Filter by name..."
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="preview">Preview Text</label>
                            <input
                                id="preview"
                                className="preview-input"
                                type="text"
                                value={previewText}
                                onChange={(e) => setPreviewText(e.target.value)}
                                placeholder="Type to preview..."
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="size">Size: {fontSize}px</label>
                            <input
                                id="size"
                                type="range"
                                min="12"
                                max="96"
                                value={fontSize}
                                onChange={(e) => setFontSize(Number(e.target.value))}
                            />
                        </div>
                        <div className="input-group">
                            <label>View</label>
                            <div className="view-toggle">
                                <button
                                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                    title="Grid View"
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <rect x="1" y="1" width="6" height="6" rx="1"/>
                                        <rect x="9" y="1" width="6" height="6" rx="1"/>
                                        <rect x="1" y="9" width="6" height="6" rx="1"/>
                                        <rect x="9" y="9" width="6" height="6" rx="1"/>
                                    </svg>
                                </button>
                                <button
                                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                    onClick={() => setViewMode('list')}
                                    title="List View"
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <rect x="1" y="1" width="14" height="3" rx="1"/>
                                        <rect x="1" y="6.5" width="14" height="3" rx="1"/>
                                        <rect x="1" y="12" width="14" height="3" rx="1"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        {/* Backup/Restore */}
                        <div className="input-group">
                            <label>Favorites</label>
                            <div className="view-toggle">
                                <button className="view-btn" onClick={handleExport} title="Export Favorites">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M8 1v9M8 1L5 4M8 1l3 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                                    </svg>
                                </button>
                                <button className="view-btn" onClick={handleImport} title="Import Favorites">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M8 10V1M8 10L5 7M8 10l3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="category-bar">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={`category-tab ${activeCategory === cat ? 'active' : ''} ${cat === 'Favorites' ? 'fav-tab' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat === 'Favorites' && '★ '}
                            {cat}
                            <span className="cat-count">{categoryCounts[cat] || 0}</span>
                        </button>
                    ))}
                </div>
            </header>

            <main>
                {loading && (
                    <div className="status-message">
                        <div className="spinner" />
                        <span>Scanning system fonts...</span>
                    </div>
                )}

                {error && (
                    <div className="status-message">
                        <span className="error-text">{error}</span>
                    </div>
                )}

                {!loading && !error && (
                    <div className={viewMode === 'grid' ? 'font-grid' : 'font-list'}>
                        {filteredFonts.length > 0 ? (
                            filteredFonts.map((font) => (
                                <div
                                    className={viewMode === 'grid' ? 'font-card' : 'font-row'}
                                    key={font.name}
                                    title={font.name}
                                >
                                    <div className={viewMode === 'grid' ? 'font-header' : 'font-row-meta'}>
                                        <span className="font-name">{font.name}</span>
                                        <div className="font-meta-right">
                                            <span className="font-category-badge">{font.category}</span>
                                            <button
                                                className={`fav-btn ${favorites.has(font.name) ? 'is-fav' : ''}`}
                                                onClick={(e) => handleToggleFavorite(font.name, e)}
                                                title={favorites.has(font.name) ? 'Remove from favorites' : 'Add to favorites'}
                                            >
                                                {favorites.has(font.name) ? '★' : '☆'}
                                            </button>
                                        </div>
                                    </div>
                                    <div
                                        className="font-preview"
                                        style={{
                                            fontFamily: `"${font.name}", sans-serif`,
                                            fontSize: `${fontSize}px`,
                                        }}
                                    >
                                        {previewText || font.name}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <span className="emoji">{activeCategory === 'Favorites' ? '⭐' : '🔍'}</span>
                                <span>
                                    {activeCategory === 'Favorites'
                                        ? 'No favorites yet. Click ☆ on any font to add it.'
                                        : <>No fonts matching "<strong>{searchTerm}</strong>" in {activeCategory}</>
                                    }
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
