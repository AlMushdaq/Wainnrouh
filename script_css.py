import os

css_content = """@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Tajawal:wght@400;500;700;800;900&display=swap');

:root {
  /* Retro Rubber Hose Theme - Light Mode Default */
  --primary: #000000;
  --primary-muted: #1A1A1A;
  --secondary: #F9F9F9;
  --secondary-muted: #E5E5E5;
  
  --text-main: #000000;
  --text-muted: #6B7280;
  --text-placeholder: #6B7280;
  
  --bg-app: #D1D5DB;
  --bg-card: #FFFFFF;
  --bg-input: #FFFFFF;
  
  --border-color: #000000;
  --border-width: 3px;
  --border-thick: 4px;
  
  --radius-sm: 0.5rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  --radius-pill: 9999px;

  --shadow-hard: 8px 8px 0px 0px var(--primary);
  --shadow-sm: 4px 4px 0px 0px var(--primary);
  --shadow-active: 2px 2px 0px 0px var(--primary);
}

@media (prefers-color-scheme: dark) {
  :root {
    --primary: #FFFFFF;
    --primary-muted: #E5E5E5;
    --secondary: #1A1A1A;
    --secondary-muted: #2A2A2A;
    
    --text-main: #FFFFFF;
    --text-muted: #9CA3AF;
    --text-placeholder: #9CA3AF;
    
    --bg-app: #111827;
    --bg-card: #1F2937;
    --bg-input: #374151;
    
    --border-color: #FFFFFF;
  }
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Tajawal', 'Cairo', system-ui, sans-serif;
  background-color: var(--bg-app);
  color: var(--text-main);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  -webkit-font-smoothing: antialiased;
  position: relative;
  overflow-x: hidden;
  
  /* Halftone Space Background */
  background-image: radial-gradient(circle, var(--text-muted) 10%, transparent 10%);
  background-size: 10px 10px;
  background-position: 0 0, 5px 5px;
}

/* Retro Space Background Elements */
.retro-bg-container {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.retro-star {
  position: absolute;
  color: var(--primary);
  animation: twinkle 3s infinite alternate ease-in-out;
}

.retro-squiggle {
  position: absolute;
  stroke: var(--primary);
  stroke-width: var(--border-width);
  fill: none;
  stroke-linecap: round;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

#root {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
}

button {
  font-family: 'Tajawal', 'Cairo', system-ui, sans-serif;
  cursor: pointer;
  border: none;
  background: none;
  color: inherit;
}

input, textarea {
  font-family: 'Tajawal', 'Cairo', system-ui, sans-serif;
}

h1,h2,h3,h4 {
  font-family: 'Cairo', 'Tajawal', system-ui, sans-serif;
}

.fade-in {
  animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes popIn {
  0% { opacity: 0; transform: scale(0.9) translateY(20px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.app-container {
  position: relative;
  z-index: 1;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem 1rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Base Form Shared */
.setup-container, .suggestions-header, .suggestion-card, .btn-secondary, .modal-content, .ai-result-card, .sort-choice-btn, .orbit-card, .winner-card {
  background: var(--bg-card);
  border: var(--border-thick) solid var(--border-color);
  box-shadow: var(--shadow-hard);
  position: relative;
}
.setup-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem;
  padding: 2rem;
  border-radius: var(--radius-lg);
  z-index: 10;
}
.setup-header { text-align: center; position: relative; z-index: 1; }
.setup-header h1 {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: var(--primary);
}
.setup-header p {
  color: var(--text-muted);
  font-size: 1.15rem;
  font-weight: 700;
}
.setup-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  z-index: 1;
}
.input-group { display: flex; flex-direction: column; gap: 0.5rem; }
.input-group label { font-weight: 700; font-size: 1.15rem; color: var(--text-main); }
.input-wrapper { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 1rem; color: var(--primary); }
.input-wrapper input, .modal-content input {
  width: 100%;
  padding: 1.1rem 1rem 1.1rem 3.5rem;
  background: var(--bg-input);
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-main);
  font-size: 1.1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}
.input-wrapper input:focus, .modal-content input:focus {
  outline: none; background: var(--bg-card); transform: translate(-2px, -2px); box-shadow: var(--shadow-hard);
}

.btn-primary {
  background: var(--primary);
  color: var(--secondary);
  padding: 1.4rem;
  border: var(--border-thick) solid var(--primary);
  border-radius: var(--radius-pill);
  font-size: 1.4rem;
  font-weight: 800;
  margin-top: 1rem;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-hard);
  position: relative;
  text-transform: uppercase;
}
.btn-primary::after {
  content: '';
  position: absolute;
  inset: 4px;
  border-radius: var(--radius-pill);
  border: 2px dashed var(--secondary);
  pointer-events: none;
}
.btn-primary:hover:not(:disabled) {
  background: var(--primary-muted);
  transform: translate(-3px, -3px);
  box-shadow: var(--shadow-hard);
}
.btn-primary:active:not(:disabled) {
  transform: translate(2px, 2px);
  box-shadow: none;
}

/* Retro Illustrations */
.retro-ill-rocket { position: absolute; top: -40px; right: -30px; transform: rotate(15deg); z-index: 20; }
[dir="rtl"] .retro-ill-rocket { right: auto; left: -30px; transform: rotate(-15deg) scaleX(-1); }
.retro-ill-legs { position: absolute; bottom: -50px; left: 50%; transform: translateX(-50%); z-index: -1; }
.retro-ill-map { position: absolute; left: -15px; top: 50%; transform: translateY(-50%) rotate(-10deg); background: var(--bg-app); border: var(--border-thick) solid var(--primary); border-radius: var(--radius-md); padding: 0.2rem; z-index: 20; }
[dir="rtl"] .retro-ill-map { left: auto; right: -15px; transform: translateY(-50%) rotate(10deg); }
.retro-ill-plane { position: absolute; left: -60px; top: 0; transform: rotate(20deg); z-index: 20; }
[dir="rtl"] .retro-ill-plane { left: auto; right: -60px; transform: rotate(-20deg) scaleX(-1); }
.retro-ill-pointer { position: absolute; right: -30px; bottom: -20px; transform: rotate(-20deg); z-index: 20; }
[dir="rtl"] .retro-ill-pointer { right: auto; left: -30px; transform: rotate(20deg) scaleX(-1); }

@media (max-width: 640px) {
  .retro-ill-rocket, .retro-ill-plane, .retro-ill-pointer { display: none; }
}

/* Suggestion Card */
.suggestions-container { display: flex; flex-direction: column; gap: 1.5rem; flex: 1; }
.suggestions-header { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1.5rem; border-radius: var(--radius-lg); }
.location-badge { display: inline-flex; align-items: center; gap: 0.35rem; background: var(--bg-input); color: var(--primary); padding: 0.5rem 1.2rem; border: var(--border-width) solid var(--border-color); border-radius: var(--radius-pill); font-size: 1rem; font-weight: 700; box-shadow: var(--shadow-sm); }
.suggestions-header h2 { font-size: 2.4rem; font-weight: 800; color: var(--primary); }
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem; }
.suggestion-card { border-radius: var(--radius-md); padding: 1.2rem; display: flex; align-items: center; justify-content: center; min-height: 85px; text-align: center; box-shadow: var(--shadow-sm); transition: all 0.2s ease; cursor:pointer;}
.suggestion-card:hover { transform: translate(-3px, -3px); box-shadow: var(--shadow-hard); background: var(--bg-input); }
.card-content h3 { font-size: 1.1rem; font-weight: 700; }
.action-buttons { display: flex; gap: 1rem; margin-top: auto; }
.btn-secondary { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; border: var(--border-width) solid var(--border-color); color: var(--primary); padding: 1.2rem; border-radius: var(--radius-md); font-size: 1.1rem; font-weight: 700; transition: all 0.2s ease; box-shadow: var(--shadow-sm); }
.btn-secondary:hover { background: var(--bg-input); transform: translate(-3px, -3px); box-shadow: var(--shadow-hard); }
.btn-secondary:active { transform: translate(2px, 2px); box-shadow: none; }
.start-btn { width: max-content; padding: 1.3rem 4.5rem; font-size: 1.6rem; margin: 0 auto; background: var(--primary); color: var(--secondary); letter-spacing: 3px; position:relative; }
.start-btn::after {
  content: ''; position: absolute; inset: 4px; border-radius: var(--radius-pill); border: 2px dashed var(--secondary); pointer-events: none;
}
.start-btn:hover:not(:disabled) { background: var(--primary-muted); transform: translate(-3px, -3px); box-shadow: var(--shadow-hard); }
.start-btn:active { transform: translate(2px,2px); box-shadow:none; }

/* Modals */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 1rem; }
.modal-content { border-radius: var(--radius-lg); padding: 2.5rem; width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 1.5rem; }
.close-btn { position: absolute; top: -14px; right: -14px; background: var(--bg-card); border: var(--border-thick) solid var(--border-color); border-radius: 50%; width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; color: var(--primary); transition: all 0.1s ease; box-shadow: var(--shadow-sm); }
.close-btn:hover { background: var(--bg-input); transform: translate(-2px,-2px); box-shadow: var(--shadow-hard); }
.modal-content h3 { font-size: 1.6rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem; }
.modal-content form { display: flex; flex-direction: column; gap: 1rem; margin-top: 0.5rem; }
.btn-google { background: var(--primary); color:var(--secondary); text-transform:uppercase; font-weight:800; letter-spacing:1px; position:relative;}
.btn-google:hover { background:var(--primary-muted); color:var(--secondary);}

/* AI Results */
.ai-results-list { display: flex; flex-direction: column; gap: 0.6rem; }
.ai-result-card { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 1rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); transition: all 0.2s ease; width: 100%; }
.ai-result-card:hover { background: var(--bg-input); transform: translate(-3px, -3px); box-shadow: var(--shadow-hard); border-color: var(--primary); }
.ai-result-card:active { transform: translate(2px, 2px); box-shadow: none; }
.ai-result-info { display: flex; flex-direction: column; gap: 0.15rem; flex: 1; min-width: 0; }
.ai-result-name { font-weight: 700; font-size: 1.05rem; }
.ai-result-address { font-size: 0.85rem; color: var(--text-muted); font-weight: 500; }
.ai-result-distance { display: flex; align-items: center; gap: 0.3rem; background: var(--secondary); color: var(--primary); padding: 0.3rem 0.7rem; border-radius: var(--radius-pill); font-size: 0.85rem; font-weight: 700; border: var(--border-width) solid var(--border-color); box-shadow: var(--shadow-sm); }
.ai-result-check { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; min-width: 24px; border-radius: 50%; border: var(--border-thick) solid var(--border-color); background: var(--bg-app); color: transparent; transition: all 0.2s ease; }
.ai-result-selected .ai-result-check { background: var(--primary); color: var(--secondary); }
.ai-result-selected { background: var(--bg-input); }
.ai-result-meta { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.source-badge { display: inline-flex; align-items: center; gap: 0.2rem; font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 1rem; border: var(--border-width) solid var(--border-color); background:var(--bg-app); color:var(--primary); }
.sort-choice-btn { display: flex; align-items: center; gap: 1rem; padding: 1.2rem 1.5rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); transition: all 0.2s ease; width: 100%; }
.sort-choice-btn:hover { background: var(--bg-input); transform: translate(-3px, -3px); box-shadow: var(--shadow-hard); }
.sort-choice-title { font-weight: 800; font-size: 1.2rem; display: block; }
.sort-choice-desc { font-size: 0.85rem; font-weight: 500; opacity: 0.7; display: block; }
.search-loading { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 2rem 0; font-weight: 700;}
.spin-icon { animation: spinIcon 1s linear infinite; }
@keyframes spinIcon { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* SpinReveal */
.spin-container { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; min-height: 70vh; }
.spin-orbit-view { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; gap: 4rem; flex: 1; }
.spin-orbit-view h2 { font-size: 3.8rem; font-weight: 800; color: var(--primary); text-transform: uppercase; text-shadow: 4px 4px 0px var(--secondary-muted); letter-spacing: 2px; }
.orbit-center { position: relative; width: 10px; height: 10px; display: flex; align-items: center; justify-content: center; margin-top: 50px; margin-bottom: 150px; }
.orbit-card { border-radius: var(--radius-md); padding: 1.2rem; width: max-content; max-width: 220px; text-align: center; display: flex; align-items: center; gap: 0.5rem; justify-content: center; will-change: transform; }
.orbit-card h3 { font-size: 1.4rem; font-weight: 700; word-break: break-word; }
.reveal-view { display: flex; flex-direction: column; align-items: center; gap: 3rem; width: 100%; }
.winner-card { border-radius: 2.5rem; padding: 5rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 2rem; width: 100%; max-width: 500px; }
.crown-icon { background: var(--bg-input); border: var(--border-thick) solid var(--border-color); border-radius: 50%; width: 110px; height: 110px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); z-index: 10; }
.winner-card h2 { font-size: 4.2rem; font-weight: 900; text-align: center; line-height: 1.1; text-wrap: balance; color: var(--primary); text-transform: uppercase; text-shadow: 4px 4px 0px var(--secondary-muted); }
.winner-meta { display: flex; gap: 1rem; align-items: center; justify-content: center; }
.badge { background: var(--bg-input); color: var(--primary); border: var(--border-width) solid var(--border-color); padding: 0.6rem 1.4rem; border-radius: var(--radius-pill); font-size: 1.1rem; font-weight: 700; text-transform: uppercase; box-shadow: var(--shadow-sm); }
.ai-badge { display: flex; align-items: center; gap: 0.4rem; background: var(--bg-card); color:var(--primary); }
.reset-btn { max-width: 300px; background: var(--bg-input); color: var(--primary); font-weight: 800; border-radius: var(--radius-md); transition: all 0.2s ease; box-shadow: var(--shadow-sm); }
.reset-btn:hover { background: var(--bg-card); transform: translate(-3px, -3px); box-shadow: var(--shadow-hard); }

.google-maps-btn { display: flex; align-items: center; justify-content: center; gap: 0.6rem; width: 100%; max-width: 400px; padding: 1.2rem; background: var(--bg-card); color: var(--primary); border: var(--border-thick) solid var(--border-color); border-radius: var(--radius-md); font-weight: 700; font-size: 1.2rem; text-decoration: none; box-shadow: var(--shadow-hard); transition: all 0.2s ease; }
.google-maps-btn:hover { transform: translate(-3px, -3px); background: var(--bg-input); box-shadow: var(--shadow-hard); }
.google-maps-btn:active { transform: translate(2px, 2px); box-shadow: none; }

.lang-toggle-btn { position: absolute; top: 1rem; left: 1rem; display: flex; align-items: center; gap: 0.5rem; background: var(--bg-card); border: var(--border-thick) solid var(--border-color); border-radius: var(--radius-pill); font-weight: 700; font-size: 1rem; color: var(--primary); box-shadow: var(--shadow-hard); padding: 0.6rem 1.2rem; z-index: 100; transition: all 0.2s ease; }
[dir="rtl"] .lang-toggle-btn { left: auto; right: 1rem; }
.lang-toggle-btn:hover { background: var(--bg-input); transform: translate(-3px, -3px); box-shadow: var(--shadow-hard); }
.lang-toggle-btn:active { transform: translate(2px, 2px); box-shadow: none; }
"""
with open("src/index.css", "w") as f:
    f.write(css_content)
