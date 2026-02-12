import { useState, useEffect } from 'react';
import './App.css';

// Fallback for calling backend method directly if bindings aren't fully generated yet
// In a real scenario, you usually import from "../wailsjs/go/main/App"
const ListFonts = async (): Promise<string[]> => {
    // Access the exposed Go method via standard Wails window object
    if ((window as any).go && (window as any).go.main && (window as any).go.main.App && (window as any).go.main.App.ListFonts) {
        return (window as any).go.main.App.ListFonts();
    }
    // If checking in standard browser or bindings missing
    console.warn("Wails backend not detected or ListFonts not bound yet.");
    return [];
}

function App() {
    const [fonts, setFonts] = useState<string[]>([]);
    const [previewText, setPreviewText] = useState("The quick brown fox jumps over the lazy dog");
    const [fontSize, setFontSize] = useState(32);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        // Fetch fonts on mount
        ListFonts().then((data: string[]) => {
            if (data) {
                // Filter duplicates if any
                const uniqueFonts = Array.from(new Set(data));
                setFonts(uniqueFonts);
            }
            setLoading(false);
        }).catch(err => {
            console.error("Failed to load fonts:", err);
            setLoading(false);
        });
    }, []);

    const filteredFonts = fonts.filter(font => 
        font.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div id="app">
            <header>
                <div className="title-area">
                    <h1>Font Manager</h1>
                </div>
                <div className="controls">
                     <div className="input-group">
                        <label htmlFor="search">Search Font</label>
                        <input 
                            id="search"
                            type="text" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            placeholder="Search family..."
                            style={{width: '200px'}}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="preview">Preview Text</label>
                        <input 
                            id="preview"
                            type="text" 
                            value={previewText} 
                            onChange={(e) => setPreviewText(e.target.value)} 
                            placeholder="Type preview text..."
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
                            onChange={(e) => setFontSize(parseInt(e.target.value))} 
                        />
                    </div>
                </div>
            </header>
            <main>
                {loading ? (
                    <div style={{textAlign: 'center', marginTop: '50px'}}>Scanning system fonts...</div>
                ) : (
                    <div className="font-grid">
                        {filteredFonts.length > 0 ? filteredFonts.map((font, idx) => (
                            <div className="font-card" key={idx} title={font}>
                                <div className="font-header">
                                    <span className="font-name">{font}</span>
                                </div>
                                <div 
                                    className="font-preview" 
                                    style={{ fontFamily: font, fontSize: `${fontSize}px` }}
                                >
                                    {previewText || font}
                                </div>
                            </div>
                        )) : (
                            <div style={{gridColumn: '1/-1', textAlign: 'center'}}>No fonts found matching "{searchTerm}"</div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
