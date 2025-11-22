import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Analyse de votre meuble...",
  "Calcul des économies de CO2...",
  "Estimation de la valeur pour la communauté...",
  "Préparation de votre rapport d'impact...",
];

const LoadingSpinner: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 border-l-transparent border-r-transparent"></div>
        <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-indigo-100 opacity-50 -z-10"></div>
      </div>
      <p className="text-lg text-gray-600 font-medium animate-pulse">{loadingMessages[messageIndex]}</p>
    </div>
  );
};

export default LoadingSpinner;