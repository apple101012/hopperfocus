import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type House = 'gryffindor' | 'slytherin' | 'ravenclaw' | 'hufflepuff';

interface ThemeContextType {
  house: House;
  setHouse: (house: House) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [house, setHouse] = useState<House>(() => {
    const saved = localStorage.getItem('house');
    return (saved as House) || 'gryffindor';
  });

  useEffect(() => {
    // Update CSS class on body
    document.body.className = `theme-${house}`;
    localStorage.setItem('house', house);
  }, [house]);

  return (
    <ThemeContext.Provider value={{ house, setHouse }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
