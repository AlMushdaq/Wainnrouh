import { useState, useEffect } from 'react';
import SetupScreen from './components/SetupScreen';
import SuggestionsScreen from './components/SuggestionsScreen';
import SpinRevealScreen from './components/SpinRevealScreen';
import { translations } from './translations';
import { Globe } from 'lucide-react';
import FloatingShapes from './components/FloatingShapes';

function App() {
  // Screens: 'setup', 'suggestions', 'spin'
  const [currentScreen, setCurrentScreen] = useState('setup');

  // App State
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [suggestions, setSuggestions] = useState([]); // { id: string, name: string, category: string, isAi: boolean }
  const [language, setLanguage] = useState('ar'); // Default arabic
  const [userLocation, setUserLocation] = useState(null);

  // Get user location on app start
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log('Geolocation denied or unavailable')
      );
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = translations[language];

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'ar' ? 'en' : 'ar'));
  };

  const handleSetupComplete = (selectedCity, selectedCategory) => {
    setCity(selectedCity);
    setCategory(selectedCategory);
    setCurrentScreen('suggestions');
  };

  const handleAddSuggestion = (suggestion) => {
    setSuggestions(prev => [...prev, { ...suggestion, id: crypto.randomUUID() }]);
  };

  const handleStartSpin = () => {
    setCurrentScreen('spin');
  };

  const handleReset = () => {
    setCity('');
    setCategory('');
    setSuggestions([]);
    setCurrentScreen('setup');
  };

  return (
    <>
      <FloatingShapes />
      <main className="app-container">
        <button className="lang-toggle-btn" onClick={toggleLanguage} aria-label="Toggle language">
          <Globe size={20} />
          {language === 'ar' ? 'English' : 'عربي'}
        </button>

        {currentScreen === 'setup' && (
          <SetupScreen onComplete={handleSetupComplete} t={t} />
        )}

        {currentScreen === 'suggestions' && (
          <SuggestionsScreen
            city={city}
            category={category}
            suggestions={suggestions}
            onAdd={handleAddSuggestion}
            onStartSpin={handleStartSpin}
            t={t}
            userLocation={userLocation}
          />
        )}

        {currentScreen === 'spin' && (
          <SpinRevealScreen
            suggestions={suggestions}
            category={category}
            city={city}
            onReset={handleReset}
            t={t}
          />
        )}
      </main>
    </>
  );
}

export default App;
