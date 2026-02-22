import React from 'react';

interface WaxSealProps {
  show: boolean;
  onAnimationEnd?: () => void;
}

export const WaxSeal: React.FC<WaxSealProps> = ({ show, onAnimationEnd }) => {
  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80"
      onAnimationEnd={onAnimationEnd}
    >
      <div className="wax-seal">
        <div className="w-32 h-32 bg-house-primary rounded-full flex items-center justify-center shadow-2xl">
          <div className="text-6xl">✓</div>
        </div>
        <p className="text-white text-2xl font-fantasy mt-6 text-center">
          Quest Complete!
        </p>
      </div>
    </div>
  );
};
