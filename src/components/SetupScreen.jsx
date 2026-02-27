import { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { RubberHoseRocket, RubberHoseLegs, RubberHoseMap, RubberHosePlane, RubberHosePointer } from './RetroIllustrations';

export default function SetupScreen({ onComplete, t }) {
    const [city, setCity] = useState('');
    const [category, setCategory] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (city.trim() && category.trim()) {
            onComplete(city.trim(), category.trim());
        }
    };

    return (
        <div className="setup-container fade-in">
            <RubberHoseRocket />
            <div className="setup-header">
                <h1>{t.title}</h1>
                <p>{t.subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="setup-form">
                <div className="input-group">
                    <label htmlFor="city">{t.whereAreWe}</label>
                    <div className="input-wrapper">
                        <RubberHoseMap />
                        <MapPin className="input-icon" size={20} style={{ opacity: 0 }} />
                        <input
                            id="city"
                            type="text"
                            placeholder={t.cityPlaceholder}
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label htmlFor="category">{t.whatAreWeLookingFor}</label>
                    <div className="input-wrapper">
                        <Navigation className="input-icon" size={20} style={{ opacity: 0 }} />
                        <input
                            id="category"
                            type="text"
                            placeholder={t.categoryPlaceholder}
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div style={{ position: 'relative', marginTop: '1rem', width: '100%', display: 'flex' }}>
                    <RubberHosePlane />
                    <RubberHosePointer />
                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', margin: 0 }}
                        disabled={!city.trim() || !category.trim()}
                    >
                        {t.startSession}
                    </button>
                </div>
            </form>
            <RubberHoseLegs />
        </div>
    );
}
