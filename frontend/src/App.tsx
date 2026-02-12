import { useState, useEffect, useMemo } from 'react';
import './App.css';
import { ListFonts } from "../wailsjs/go/main/App";

function App() {
    const [fonts, setFonts] = useState<string[]>([]);
    const [previewText, setPreviewText] = useState("The quick brown fox jumps over the lazy dog");
    const [fontSize, setFontSize] = useState(32);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        ListFonts()
            .then((data) => {
                if (data && data.length > 0) {
                    const uniqueFonts = Array.from(new Set(data));
                    setFonts(uniqueFonts);
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
        return fonts.filter(font => font.toLowerCase().includes(term));
    }, [fonts, searchTerm]);

    return (
        <div id="app">
            <header>
                <div className="title-area">
                    <h1>GlyphDeck</h1>
                    {!loading && !error && (
                        <span className="font-count">
                            {filteredFonts.length} / {fonts.length} fonts
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
                    <div className="font-grid">
                        {filteredFonts.length > 0 ? (
                            filteredFonts.map((font) => (
                                <div className="font-card" key={font} title={font}>
                                    <div className="font-header">
                                        <span className="font-name">{font}</span>
                                    </div>
                                    <div
                                        className="font-preview"
                                        style={{
                                            fontFamily: `"${font}", sans-serif`,
                                            fontSize: `${fontSize}px`,
                                        }}
                                    >
                                        {previewText || font}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <span className="emoji">🔍</span>
                                <span>No fonts matching "<strong>{searchTerm}</strong>"</span>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
