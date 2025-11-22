import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full max-w-7xl mb-8 text-center flex flex-col items-center">
      {/* Logo Integration */}
      <div className="mb-6">
        <img 
            src="/logo.png" 
            alt="Logo Le Cycle" 
            className="h-24 w-auto object-contain"
            onError={(e) => {
                // Fallback si l'image n'est pas trouvée
                e.currentTarget.style.display = 'none';
            }}
        />
      </div>
      
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
        L'Atelier <span className="text-indigo-600">Upcycle</span>
      </h1>
      <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
        Révélez la valeur écologique et économique cachée de votre mobilier.
      </p>
    </header>
  );
};

export default Header;