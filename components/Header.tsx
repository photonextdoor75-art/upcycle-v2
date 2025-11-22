import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full max-w-7xl my-8 flex justify-center text-center">
      <div className="flex flex-col items-center justify-center gap-2">
        <img 
            src="/assets/logo.png" 
            alt="Logo Upcycle" 
            className="h-32 w-32 object-contain"
            onError={(e) => {
                // Placeholder visuel si l'image manque, pour garder la mise en page
                e.currentTarget.style.opacity = '0.3';
            }}
        />
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight hidden">L'Évaluateur de Potentiel Upcycle</h1>
        <p className="text-slate-600 text-lg">L'outil qui chiffre la seconde vie de nos objets.</p>
      </div>
    </header>
  );
};

export default Header;