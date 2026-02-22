import React, { useEffect } from 'react';

interface ConfettiProps {
  active: boolean;
  duration?: number;
}

export const Confetti: React.FC<ConfettiProps> = ({ active, duration = 3000 }) => {
  useEffect(() => {
    if (!active) return;

    const colors = ['#740001', '#D3A625', '#1A472A', '#5D5D5D', '#0E1A40', '#946B2D', '#F0C75E'];
    const confettiCount = 50;
    const confettiElements: HTMLDivElement[] = [];

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-particle';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animation = `confetti ${duration}ms ease-out forwards`;
      confetti.style.animationDelay = Math.random() * 500 + 'ms';
      document.body.appendChild(confetti);
      confettiElements.push(confetti);
    }

    const cleanup = setTimeout(() => {
      confettiElements.forEach(el => el.remove());
    }, duration + 500);

    return () => {
      clearTimeout(cleanup);
      confettiElements.forEach(el => el.remove());
    };
  }, [active, duration]);

  return null;
};
