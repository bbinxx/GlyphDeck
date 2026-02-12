import { useState, useEffect, useMemo } from 'react';
import './App.css';
import { GetFonts } from "../wailsjs/go/main/App";
import { main } from "../wailsjs/go/models";

type ViewMode = 'grid' | 'list';
const CATEGORIES = ['All', 'Sans Serif', 'Serif', 'Monospace', 'Handwriting', 'Display', 'Symbol'];

function App() {
    const [fonts, setFonts] = useState<main.FontInfo[]>([]);
    const [previewText, setPreviewText] = useState("The quick brown fox jumps over the lazy dog");
    const [fontSize, setFontSize] = useState(28);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        GetFonts()
            .then((data) => {
                if (data && data.length > 0) {
                    setFonts(data);
                } else {
                    setError("No fonts found on this system.");
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to load fonts:", err);
                setError("Failed to load fonts: " + String(err));
                setLoading(false);
            });
    }, []);

    const filteredFonts = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return fonts.filter(f => {
            const matchesSearch = f.name.toLowerCase().includes(term);
            const matchesCategory = activeCategory === 'All' || f.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [fonts, searchTerm, activeCategory]);

    // Count fonts per category
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { All: fonts.length };
        for (const f of fonts) {
            counts[f.category] = (counts[f.category] || 0) + 1;
        }
        return counts;
    }, [fonts]);

    return (
        <div id="app">
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
                                    {/* Grid icon */}
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <rect x="1" y="1" width="6" height="6" rx="1" />
                                        <rect x="9" y="1" width="6" height="6" rx="1" />
                                        <rect x="1" y="9" width="6" height="6" rx="1" />
                                        <rect x="9" y="9" width="6" height="6" rx="1" />
                                    </svg>
                                </button>
                                <button
                                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                    onClick={() => setViewMode('list')}
                                    title="List View"
                                >
                                    {/* List icon */}
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <rect x="1" y="1" width="14" height="3" rx="1" />
                                        <rect x="1" y="6.5" width="14" height="3" rx="1" />
                                        <rect x="1" y="12" width="14" height="3" rx="1" />
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
                            className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
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
                                        <span className="font-category-badge">{font.category}</span>
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
                                <span className="emoji">🔍</span>
                                <span>No fonts matching "<strong>{searchTerm}</strong>" in {activeCategory}</span>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
