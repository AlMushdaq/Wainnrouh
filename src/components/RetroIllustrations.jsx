import { Rocket, Map, Plane, MousePointer2 } from 'lucide-react';

export const RubberHoseRocket = ({ className = '' }) => (
    <div className={`retro-ill-rocket ${className}`}>
        <Rocket size={64} color="var(--primary)" strokeWidth={2} />
        {/* Simplified stylistic squiggles to represent motion/smoke */}
        <svg width="40" height="40" viewBox="0 0 100 100" style={{ position: 'absolute', bottom: -20, left: -20 }}>
            <path d="M50 0 Q 30 50 10 100 M50 0 Q 70 50 90 100" stroke="var(--primary)" fill="none" strokeWidth="8" strokeLinecap="round" />
        </svg>
    </div>
);

export const RubberHoseLegs = ({ className = '' }) => (
    <div className={`retro-ill-legs ${className}`}>
        <svg width="100" height="60" viewBox="0 0 100 60">
            {/* Simple stylized boots/legs */}
            <path d="M 20 0 L 20 40 Q 20 60 40 60 L 40 40 Z" fill="var(--bg-app)" stroke="var(--primary)" strokeWidth="4" />
            <path d="M 80 0 L 80 40 Q 80 60 60 60 L 60 40 Z" fill="var(--bg-app)" stroke="var(--primary)" strokeWidth="4" />
        </svg>
    </div>
);

export const RubberHoseMap = ({ className = '' }) => (
    <div className={`retro-ill-map ${className}`}>
        <Map size={32} color="var(--primary)" strokeWidth={2.5} />
    </div>
);

export const RubberHosePlane = ({ className = '' }) => (
    <div className={`retro-ill-plane ${className}`}>
        <Plane size={48} color="var(--primary)" strokeWidth={2} />
    </div>
);

export const RubberHosePointer = ({ className = '' }) => (
    <div className={`retro-ill-pointer ${className}`}>
        <MousePointer2 size={40} color="var(--primary)" strokeWidth={2.5} fill="var(--bg-card)" />
    </div>
);
