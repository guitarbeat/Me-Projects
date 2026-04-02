import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  rotation: number;
  xDrift: number;
}

interface ConfettiProps {
  active: boolean;
  particleCount?: number;
}

const colors = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(340, 82%, 76%)',
  'hsl(280, 70%, 70%)',
  'hsl(200, 80%, 70%)',
  'hsl(45, 90%, 65%)',
];

export const Confetti: React.FC<ConfettiProps> = ({
  active,
  particleCount = 50,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const newParticles: Particle[] = Array.from(
      { length: particleCount },
      (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        size: 4 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.3,
        duration: 1.5 + Math.random() * 1.5,
        rotation: Math.random() * 360,
        xDrift: (Math.random() - 0.5) * 40,
      })
    );
    setParticles(newParticles);

    // Clear particles after animation
    const timer = setTimeout(() => setParticles([]), 3500);
    return () => clearTimeout(timer);
  }, [active, particleCount]);

  if (particles.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti-fall"
          style={
            {
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              transform: `rotate(${particle.rotation}deg)`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              '--x-drift': `${particle.xDrift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};
