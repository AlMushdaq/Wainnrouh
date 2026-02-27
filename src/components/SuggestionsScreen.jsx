import React, { useState } from 'react';
import { Plus, Sparkles, MapPin, X, Navigation, Check, Search, Loader, Star, Route } from 'lucide-react';

export default function SuggestionsScreen({ city, category, suggestions, onAdd, onStartSpin, t, userLocation }) {
    const [showManualAdd, setShowManualAdd] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [newPlaceName, setNewPlaceName] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchStatus, setSearchStatus] = useState('');
    const [results, setResults] = useState(null);
    const [selected, setSelected] = useState(new Set());
    const [lastSortBy, setLastSortBy] = useState(null);
    const [seenNames, setSeenNames] = useState([]);

    const handleManualAdd = (e) => {
        e.preventDefault();
        if (newPlaceName.trim()) {
            onAdd({ name: newPlaceName.trim(), category, isAi: false });
            setNewPlaceName('');
            setShowManualAdd(false);
        }
    };

    const smartSearch = async (sortBy) => {
        setIsSearching(true);
        setResults(null);
        setSelected(new Set());
        setLastSortBy(sortBy);
        setSearchStatus(t.searchingMaps);

        try {
            // Determine the mood query modifier based on the sort type
            let moodModifier = '';
            if (sortBy === 'rating') moodModifier = 'top rated';
            if (sortBy === 'distance') moodModifier = 'closest';
            if (sortBy === 'trending') moodModifier = 'popular trending';

            // Point to the new FastAPI backend endpoint if in local dev, or relative path if deployed
            const apiUrl = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api/scrape` : '/api/scrape';

            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    city,
                    category,
                    mood: moodModifier,
                    userLat: userLocation?.lat || null,
                    userLng: userLocation?.lng || null,
                }),
            });

            let data;
            const contentType = res.headers.get("content-type");

            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await res.json();
            } else {
                const text = await res.text();
                throw new Error(`Backend Error (Check VITE_API_BASE_URL): ${text.slice(0, 50)}...`);
            }

            if (!res.ok) {
                throw new Error(data.error || data.details || `API error: ${res.status}`);
            }

            if (data.suggestions && data.suggestions.length > 0) {
                setResults(data.suggestions);
                setSeenNames(prev => [...prev, ...data.suggestions.map(s => s.name)]);
            } else if (seenNames.length > 0) {
                // All places exhausted — reset and search fresh
                setSeenNames([]);
                setResults(null);
                alert(t.allPlacesSeen || 'شفت كل الأماكن! نبدأ من جديد');
            } else {
                alert(t.noSuggestions);
            }
        } catch (err) {
            console.error('Smart search failed:', err);
            alert(`Error: ${err.message}`);
        } finally {
            setIsSearching(false);
            setSearchStatus('');
        }
    };

    const toggleSelect = (idx) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(idx)) {
                next.delete(idx);
            } else {
                next.add(idx);
            }
            return next;
        });
    };

    const handleAddSelected = () => {
        if (selected.size === 0) return;
        selected.forEach(idx => {
            const place = results[idx];
            onAdd({ name: place.name, category, isAi: false, address: place.address || '' });
        });
        setResults(null);
        setSelected(new Set());
        setShowSearch(false);
    };

    const closeSearch = () => {
        setShowSearch(false);
        setResults(null);
        setSelected(new Set());
        setIsSearching(false);
        setSearchStatus('');
        setSeenNames([]);
    };

    return (
        <div className="suggestions-container fade-in">
            <div className="suggestions-header">
                <div className="location-badge">
                    <MapPin size={16} />
                    {city} • {category}
                </div>
                <h2>{t.whosPickingNext}</h2>
                <p>{t.passPhone}</p>
            </div>

            <div className="cards-grid">
                {suggestions.map((s) => (
                    <div key={s.id} className="suggestion-card fade-in">
                        <div className="card-content">
                            <h3>{s.name}</h3>
                            {s.isAi && <Sparkles size={16} className="ai-icon" />}
                        </div>
                    </div>
                ))}
            </div>

            {showManualAdd && (
                <div className="modal-overlay fade-in">
                    <div className="modal-content">
                        <button className="close-btn" onClick={() => setShowManualAdd(false)}>
                            <X size={24} />
                        </button>
                        <h3>{t.iknowASpot}</h3>
                        <form onSubmit={handleManualAdd}>
                            <input
                                type="text"
                                placeholder={t.whatsThePlaceCalled}
                                value={newPlaceName}
                                onChange={(e) => setNewPlaceName(e.target.value)}
                                autoFocus
                            />
                            <button type="submit" className="btn-primary" disabled={!newPlaceName.trim()}>
                                {t.addToMix}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showSearch && (
                <div className="modal-overlay fade-in">
                    <div className="modal-content ai-modal">
                        <button className="close-btn" onClick={closeSearch}>
                            <X size={24} />
                        </button>
                        <h3><Sparkles size={20} /> {t.smartSearch}</h3>

                        {!results && !isSearching ? (
                            <div className="sort-choices">
                                <p className="sort-choices-label">{t.howToSort || 'كيف تبي نرتبهم؟'}</p>
                                <button className="sort-choice-btn sort-distance" onClick={() => smartSearch('distance')}>
                                    <Route size={28} />
                                    <span className="sort-choice-title">{t.sortByDistance || 'الأقرب'}</span>
                                    <span className="sort-choice-desc">{t.sortByDistanceDesc || 'أقرب الأماكن لموقعك'}</span>
                                </button>
                                <button className="sort-choice-btn sort-stars" onClick={() => smartSearch('stars')}>
                                    <Star size={28} />
                                    <span className="sort-choice-title">{t.sortByStars || 'الأفضل تقييم'}</span>
                                    <span className="sort-choice-desc">{t.sortByStarsDesc || 'أعلى تقييم ومراجعات'}</span>
                                </button>
                            </div>
                        ) : isSearching ? (
                            <div className="search-loading">
                                <Loader size={32} className="spin-icon" />
                                <p>{searchStatus}</p>
                            </div>
                        ) : (
                            <div className="ai-results-list">
                                <p className="ai-results-label">{t.pickOne}</p>
                                {results.map((place, idx) => (
                                    <button
                                        key={idx}
                                        className={`ai-result-card fade-in ${selected.has(idx) ? 'ai-result-selected' : ''}`}
                                        onClick={() => toggleSelect(idx)}
                                        style={{ animationDelay: `${idx * 0.08}s` }}
                                    >
                                        <div className="ai-result-check">
                                            {selected.has(idx) ? <Check size={18} /> : <span className="ai-result-dot" />}
                                        </div>
                                        <div className="ai-result-info">
                                            <span className="ai-result-name">{place.name}</span>
                                            {place.address && <span className="ai-result-address">{place.address}</span>}
                                            <div className="ai-result-meta">
                                                {place.rating && (
                                                    <span className="ai-result-rating">⭐ {place.rating}{place.reviews ? ` (${place.reviews.toLocaleString()})` : ''}</span>
                                                )}
                                            </div>
                                        </div>
                                        {place.distanceKm !== null && place.distanceKm !== undefined && (
                                            <div className="ai-result-distance">
                                                <Navigation size={14} />
                                                <span>{place.distanceKm} km</span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                                <div className="ai-results-actions">
                                    <button
                                        className="btn-primary btn-ai"
                                        onClick={handleAddSelected}
                                        disabled={selected.size === 0}
                                    >
                                        {selected.size > 0
                                            ? `${t.addToMix} (${selected.size})`
                                            : t.addToMix}
                                    </button>
                                    <button className="btn-secondary ai-retry-btn" onClick={() => smartSearch(lastSortBy)}>
                                        <Search size={16} /> {t.searchAgain || 'ابحث مره ثانية'}
                                    </button>
                                    <button className="btn-secondary ai-retry-btn" onClick={() => { setResults(null); setSelected(new Set()); }}>
                                        {t.tryAgain}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="action-buttons">
                <button className="btn-secondary" onClick={() => setShowManualAdd(true)}>
                    <Plus size={20} /> {t.typeAPlace}
                </button>
                <button className="btn-secondary ai-btn" onClick={() => setShowSearch(true)}>
                    <Sparkles size={18} />
                    <Search size={18} />
                    {t.smartSearch}
                </button>
            </div>

            <button
                className="btn-primary start-btn"
                onClick={onStartSpin}
                disabled={suggestions.length < 2}
            >
                {suggestions.length < 2 ? t.needMore(2 - suggestions.length) : t.letsGo}
            </button>

        </div>
    );
}
