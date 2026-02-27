import React, { useState, useEffect, useRef } from 'react';
import { Crown, RotateCcw, Sparkles } from 'lucide-react';
import WinnerMap from './WinnerMap';

export default function SpinRevealScreen({ suggestions, category, city, onReset, t }) {
    const [winner, setWinner] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [isPreReveal, setIsPreReveal] = useState(false);
    const [orbitingCards, setOrbitingCards] = useState([]);

    const requestRef = useRef();
    const startTimeRef = useRef(null);

    useEffect(() => {
        if (!suggestions || suggestions.length === 0) return;

        // Pick a winner right away
        const chosen = suggestions[Math.floor(Math.random() * suggestions.length)];
        setWinner(chosen);

        const orbitDuration = 4800; // Time spent orbiting
        const preRevealDuration = 1000; // Time winner spends scaling up
        const totalDuration = orbitDuration + preRevealDuration;

        let currentProgress = 0;
        let baseVelocity = 0.05;

        const animate = (time) => {
            if (!startTimeRef.current) startTimeRef.current = time;
            const elapsed = time - startTimeRef.current;

            const orbitProgressRatio = Math.min(elapsed / orbitDuration, 1);

            // Speed curve during orbit
            if (orbitProgressRatio < 0.3) {
                baseVelocity += 0.008; // Ramp up wildly
            } else if (orbitProgressRatio > 0.65 && orbitProgressRatio < 1) {
                baseVelocity *= 0.92; // Sharp spin down
            }

            currentProgress += baseVelocity;

            if (elapsed < orbitDuration) {
                // --- PHASE 1: Orbiting ---
                setIsPreReveal(false);
                const newCards = suggestions.map((suggest, index) => {
                    const speedFactor = 1 + (index % 3) * 0.4;
                    const offset = index * ((Math.PI * 2) / suggestions.length);
                    const angle = (currentProgress * speedFactor) + offset;

                    const rx = 100 + ((index * 37) % 120);
                    const ry = 40 + ((index * 19) % 50);

                    const x = Math.cos(angle) * rx;
                    const y = Math.sin(angle) * ry;
                    const tilt = (-Math.sin(angle) * rx * speedFactor) * 0.15;

                    const scale = 0.6 + (((y + ry) / (ry * 2)) * 0.7);
                    const zIndex = Math.floor(y + 200);

                    return {
                        id: suggest.id,
                        name: suggest.name,
                        isAi: suggest.isAi,
                        style: {
                            transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${tilt}deg)`,
                            zIndex: zIndex,
                            opacity: 1
                        }
                    };
                });
                setOrbitingCards(newCards);
                requestRef.current = requestAnimationFrame(animate);

            } else if (elapsed < totalDuration) {
                // --- PHASE 2: Pre-Reveal (Winner steps forward, others fall away) ---
                if (!isPreReveal) setIsPreReveal(true);

                const preRevealElapsed = elapsed - orbitDuration;
                const preRevealProgress = Math.min(preRevealElapsed / preRevealDuration, 1);

                // Easing function for the winner scale 
                const easeOutBack = (x) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2);
                const winnerScale = 1 + (easeOutBack(preRevealProgress) * 1.5);

                // Update card styles based on whether they won
                setOrbitingCards(prevCards => prevCards.map(card => {
                    if (card.id === chosen.id) {
                        // Winner Card
                        return {
                            ...card,
                            style: {
                                ...card.style,
                                transform: `translate(0px, 0px) scale(${winnerScale}) rotate(0deg)`,
                                zIndex: 1000,
                                opacity: 1,
                                boxShadow: `${preRevealProgress * 12}px ${preRevealProgress * 12}px 0px var(--border-color)`
                            }
                        };
                    } else {
                        // Loser Cards: fall and fade out based on their exact last position
                        const lastTranslateYMatch = card.style.transform.match(/translate\([^,]+px,\s*([^p]+)px\)/);
                        const currentY = lastTranslateYMatch ? parseFloat(lastTranslateYMatch[1]) : 0;
                        const newY = currentY + (preRevealProgress * 200); // Fall down

                        return {
                            ...card,
                            style: {
                                ...card.style,
                                transform: card.style.transform.replace(/translate\([^)]+\)/, `translate(0px, ${newY}px)`),
                                zIndex: 1,
                                opacity: 1 - preRevealProgress
                            }
                        };
                    }
                }));

                requestRef.current = requestAnimationFrame(animate);
            } else {
                // --- PHASE 3: Finished! Render Reveal View ---
                setIsFinished(true);
            }
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(requestRef.current);
    }, [suggestions]);

    if (!winner) return null;

    return (
        <div className="spin-container fade-in">
            {!isFinished ? (
                <div className="spin-orbit-view">
                    <h2 style={{ opacity: isPreReveal ? 0 : 1, transition: 'opacity 0.3s' }}>
                        {t.whoWillItBe}
                    </h2>
                    <div className="orbit-center">
                        {orbitingCards.map((card) => (
                            <div
                                key={card.id}
                                className={`orbit-card ${card.id === winner.id && isPreReveal ? 'winner-glow' : ''}`}
                                style={{ ...card.style, transition: isPreReveal ? 'transform 0.1s ease-out, opacity 0.1s ease-out' : 'none' }}
                            >
                                <h3>{card.name}</h3>
                                {card.isAi && <Sparkles size={14} className="ai-icon" />}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="reveal-view pop-in">
                    <div className="winner-card pop-drop-shadow">
                        <div className="crown-icon">
                            <Crown size={64} color="#f59e0b" fill="#fbd38d" />
                        </div>
                        <h2>{winner.name}</h2>
                        <div className="winner-meta">
                            <span className="badge">{category}</span>
                            {winner.isAi && (
                                <span className="badge ai-badge">
                                    <Sparkles size={14} /> {t.aiPick}
                                </span>
                            )}
                        </div>
                    </div>

                    <WinnerMap
                        winnerName={winner.name}
                        city={city}
                        address={winner.address}
                        t={t}
                    />

                    <button className="btn-secondary reset-btn" onClick={onReset}>
                        <RotateCcw size={20} /> {t.letsGoAgain}
                    </button>
                </div>
            )}
        </div>
    );
}
