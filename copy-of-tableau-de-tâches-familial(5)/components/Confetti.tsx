import React, { useEffect, useState } from 'react';

interface ConfettiProps {
  isFiring: boolean;
}

interface Particle {
  id: number;
  finalTransform: string;
  style: React.CSSProperties;
}

const Confetti: React.FC<ConfettiProps> = ({ isFiring }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (isFiring) {
      const newParticles: Particle[] = Array.from({ length: 150 }).map((_, index) => {
        const colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6', '#f59e0b'];
        const animDuration = 3 + Math.random() * 2;
        const finalTransform = `translateY(${window.innerHeight + 100}px) translateX(${Math.random() * 400 - 200}px) rotate(${Math.random() * 720}deg)`;
        
        return {
          id: performance.now() + index,
          finalTransform,
          style: {
            position: 'fixed' as const,
            left: `${Math.random() * 100}%`,
            top: `${-10 - Math.random() * 20}%`,
            width: `${Math.random() * 8 + 6}px`,
            height: `${Math.random() * 8 + 6}px`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            borderRadius: '50%',
            transition: `transform ${animDuration}s ease-out, opacity ${animDuration}s ease-out`,
            transform: 'translateY(0) translateX(0) rotate(0)', // Initial state
            opacity: 1,
          },
        };
      });
      setParticles(newParticles);

      // Trigger the animation by updating styles after a short delay
      setTimeout(() => {
        setParticles(currentParticles => currentParticles.map(p => ({
          ...p,
          style: {
            ...p.style,
            opacity: 0,
            transform: p.finalTransform,
          }
        })));
      }, 50);

      // Cleanup particles after the animation is complete
      const cleanupTimer = setTimeout(() => {
        setParticles([]);
      }, 5500);

      return () => clearTimeout(cleanupTimer);
    }
  }, [isFiring]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[99]">
      {particles.map(p => (
        <div key={p.id} style={p.style}></div>
      ))}
    </div>
  );
};

export default Confetti;