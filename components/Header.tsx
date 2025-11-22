
import React from 'react';
import { UsersIcon } from './Icons';

interface HeaderProps {
  onOpenDashboard?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenDashboard }) => {
  return (
    <header className="w-full max-w-7xl my-8 flex flex-col relative">
      {/* Bouton Dashboard en haut à droite (position absolue pour ne pas gêner le logo) */}
      <div className="absolute top-0 right-0 z-20">
        <button 
            onClick={onOpenDashboard}
            className="flex items-center gap-2 px-4 py-2 bg-white/50 hover:bg-white text-slate-600 text-sm font-medium rounded-full backdrop-blur-sm shadow-sm transition-all"
            title="Voir les statistiques globales"
        >
            <UsersIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Statistiques</span>
        </button>
      </div>

      <div className="flex justify-center text-center">
        <div className="flex flex-col items-center justify-center gap-2">
            <img 
                src="/assets/logo.png" 
                alt="Logo Upcycle" 
                className="h-32 w-32 object-contain"
                onError={(e) => {
                    e.currentTarget.style.opacity = '0.3';
                }}
            />
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight hidden">L'Évaluateur de Potentiel Upcycle</h1>
            <p className="text-slate-600 text-lg">L'outil qui chiffre la seconde vie de nos objets.</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
