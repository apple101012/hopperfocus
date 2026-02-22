import React, { useEffect } from 'react';
import { useDemo } from '../contexts/DemoContext';

export const Spotlight: React.FC = () => {
  const { isDemoActive, spotlightElement } = useDemo();

  useEffect(() => {
    if (!isDemoActive || !spotlightElement) {
      // Remove spotlight classes from all elements
      document.querySelectorAll('.spotlight-highlight').forEach(el => {
        el.classList.remove('spotlight-highlight');
      });
      document.body.classList.remove('spotlight-dim');
      return;
    }

    // Add dim to body
    document.body.classList.add('spotlight-dim');

    // Highlight target element
    const targetElement = document.getElementById(spotlightElement);
    if (targetElement) {
      targetElement.classList.add('spotlight-highlight');
    }

    return () => {
      if (targetElement) {
        targetElement.classList.remove('spotlight-highlight');
      }
      document.body.classList.remove('spotlight-dim');
    };
  }, [isDemoActive, spotlightElement]);

  if (!isDemoActive) return null;

  return null; // This component only manages CSS classes
};
