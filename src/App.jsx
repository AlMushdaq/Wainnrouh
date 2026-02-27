import { useState, useEffect } from 'react';
import SetupScreen from './components/SetupScreen';
import SuggestionsScreen from './components/SuggestionsScreen';
import SpinRevealScreen from './components/SpinRevealScreen';
import { translations } from './translations';
import { Globe, Moon, Sun } from 'lucide-react';
const RetroBackground = () => (
  <div className="retro-bg-container">
    {/* Large Stars */}
    <svg className="retro-star" style={{ top: '8%', left: '12%', width: '35px', animationDelay: '0s' }} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
    <svg className="retro-star" style={{ top: '65%', right: '15%', width: '45px', animationDelay: '1.2s' }} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
    <svg className="retro-star" style={{ bottom: '20%', left: '25%', width: '25px', animationDelay: '0.5s' }} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
    <svg className="retro-star" style={{ top: '30%', right: '35%', width: '20px', animationDelay: '2.1s' }} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>

    {/* Squiggles */}
    <svg className="retro-squiggle" style={{ top: '15%', right: '8%', width: '70px' }} viewBox="0 0 100 100">
      <path d="M10,50 Q25,10 50,50 T90,50" />
    </svg>
    <svg className="retro-squiggle" style={{ bottom: '25%', left: '8%', width: '90px', transform: 'rotate(45deg)' }} viewBox="0 0 100 100">
      <path d="M10,50 Q25,80 50,50 T90,50" />
    </svg>
    <svg className="retro-squiggle" style={{ top: '50%', left: '5%', width: '50px', transform: 'rotate(-20deg)' }} viewBox="0 0 100 100">
      <path d="M10,50 Q25,30 50,50 T90,50" />
    </svg>

    {/* Abstract Circles/Dots */}
    <div className="retro-circle" style={{ top: '40%', right: '5%', width: '15px', height: '15px' }}></div>
    <div className="retro-circle" style={{ bottom: '10%', right: '30%', width: '8px', height: '8px' }}></div>
    <div className="retro-circle" style={{ top: '20%', left: '40%', width: '12px', height: '12px' }}></div>
    <div className="retro-circle" style={{ top: '5%', right: '45%', width: '6px', height: '6px' }}></div>
    <div className="retro-circle" style={{ bottom: '40%', left: '15%', width: '10px', height: '10px' }}></div>

    {/* Cross/Plus shapes */}
    <svg className="retro-cross" style={{ top: '75%', left: '10%', width: '20px' }} viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 0h4v10h10v4H14v10h-4V14H0v-4h10V0z" />
    </svg>
    <svg className="retro-cross" style={{ top: '15%', right: '25%', width: '15px', transform: 'rotate(45deg)' }} viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 0h4v10h10v4H14v10h-4V14H0v-4h10V0z" />
    </svg>
  </div>
);

function App() {
  // Screens: 'setup', 'suggestions', 'spin'
  const [currentScreen, setCurrentScreen] = useState('setup');

  // App State
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [suggestions, setSuggestions] = useState([]); // { id: string, name: string, category: string, isAi: boolean }
  const [language, setLanguage] = useState('ar'); // Default arabic
  const [userLocation, setUserLocation] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check local storage or system preference on initial load
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Get user location on app start
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log('Geolocation denied or unavailable')
      );
    }
  }, []);

  // Sync dark mode state with document class and local storage
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

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
      <RetroBackground />
      <main className="app-container">
        <button className="lang-toggle-btn" onClick={toggleLanguage} aria-label="Toggle language">
          <Globe size={20} />
          {language === 'ar' ? 'English' : 'عربي'}
        </button>

        <button
          className="theme-toggle-btn"
          onClick={() => setIsDarkMode(prev => !prev)}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
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

