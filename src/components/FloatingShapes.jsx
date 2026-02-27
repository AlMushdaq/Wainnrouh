import React from 'react';

const shapes = [
  { size: 20, color: '#ff3b7a', left: '5%',  delay: '0s',   duration: '12s', type: 'circle' },
  { size: 14, color: '#00c9a7', left: '15%', delay: '2s',   duration: '10s', type: 'square' },
  { size: 24, color: '#7c4dff', left: '25%', delay: '4s',   duration: '14s', type: 'circle' },
  { size: 16, color: '#ffa600', left: '35%', delay: '1s',   duration: '11s', type: 'square' },
  { size: 18, color: '#ff3b7a', left: '48%', delay: '3s',   duration: '13s', type: 'circle' },
  { size: 12, color: '#00c9a7', left: '58%', delay: '5s',   duration: '9s',  type: 'square' },
  { size: 22, color: '#7c4dff', left: '68%', delay: '0.5s', duration: '12s', type: 'circle' },
  { size: 15, color: '#ffa600', left: '78%', delay: '3.5s', duration: '10s', type: 'square' },
  { size: 20, color: '#ff3b7a', left: '88%', delay: '1.5s', duration: '14s', type: 'circle' },
  { size: 13, color: '#00c9a7', left: '95%', delay: '4.5s', duration: '11s', type: 'square' },
  { size: 17, color: '#7c4dff', left: '10%', delay: '6s',   duration: '13s', type: 'circle' },
  { size: 19, color: '#ffa600', left: '42%', delay: '7s',   duration: '12s', type: 'square' },
];

export default function FloatingShapes() {
  return (
    <div className="floating-shapes" aria-hidden="true">
      {shapes.map((s, i) => (
        <span
          key={i}
          className={`floating-shape ${s.type}`}
          style={{
            width: s.size,
            height: s.size,
            backgroundColor: s.color,
            left: s.left,
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        />
      ))}
    </div>
  );
}
