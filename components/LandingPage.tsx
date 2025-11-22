import React, { useState, useCallback } from 'react';
import { MapPinIcon, CameraIcon } from './Icons';

interface LandingPageProps {
  onImageUpload: (file: File) => void;
  isLoading: boolean;
  onLocationSelect: (location: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onImageUpload, isLoading, onLocationSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [inputLocation, setInputLocation] = useState('');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'found' | 'error'>('idle');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (e.dataTransfer.files[0].type.startsWith('image/')) {
        onImageUpload(e.dataTransfer.files[0]);
      } else {
        alert("Veuillez déposer un fichier image.");
      }
    }
  }, [onImageUpload]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée.");
      return;
    }
    setLocationStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locString = `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`;
        onLocationSelect(locString);
        setLocationStatus('found');
        setInputLocation('Position actuelle détectée');
      },
      (error) => {
        console.error("Erreur géolocalisation", error);
        setLocationStatus('error');
      }
    );
  };

  const handleManualLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputLocation.trim()) {
      onLocationSelect(inputLocation);
      setLocationStatus('found');
    }
  };

  return (
    // Container Principal Glassmorphism
    <div className="w-full max-w-3xl text-center space-y-8 p-8 bg-white/40 backdrop-blur-lg rounded-3xl shadow-lg border border-white/20">
      
      {/* --- ÉTAPE 1 : LOCALISATION --- */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-700">
          Étape 1 : Localisez votre impact <span className="text-sm font-normal text-slate-500">(Optionnel)</span>
        </h2>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleGeolocation}
            disabled={locationStatus === 'found' || locationStatus === 'locating'}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full transition-colors disabled:opacity-70 ${
                locationStatus === 'found' 
                ? 'bg-green-600 text-white' 
                : 'bg-slate-700 text-white hover:bg-slate-800'
            }`}
          >
            {locationStatus === 'locating' ? (
                <span>...</span>
            ) : locationStatus === 'found' ? (
                <>✓ Localisé</>
            ) : (
                <>Me localiser</>
            )}
          </button>

          <span className="text-slate-500">ou</span>

          <form onSubmit={handleManualLocation} className="flex gap-2 w-full sm:w-auto">
            <input
              placeholder="Entrez une ville, une adresse..."
              className="bg-white/60 border border-slate-300 rounded-full px-4 py-2 text-slate-800 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none w-full sm:w-64"
              type="text"
              value={inputLocation}
              onChange={(e) => setInputLocation(e.target.value)}
            />
            <button 
              type="submit" 
              className="px-5 py-2.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors shadow-sm"
            >
              Valider
            </button>
          </form>
        </div>
      </div>

      {/* --- SÉPARATEUR --- */}
      <div className="w-1/2 mx-auto h-px bg-slate-300/70"></div>

      {/* --- ÉTAPE 2 : TÉLÉVERSEMENT --- */}
      <div 
        className={`relative rounded-2xl p-10 sm:p-12 transition-all duration-300 bg-transparent
            ${isDragging ? 'bg-white/30 ring-4 ring-orange-200' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <h2 className="text-xl font-semibold text-slate-700 mb-8">Étape 2 : Téléversez votre photo</h2>
        
        {/* Input invisible qui couvre tout pour le drag & drop global sur la zone */}
        <input 
            id="file-upload-global" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            accept="image/*" 
            type="file"
            onChange={handleFileChange}
        />

        <div className="flex flex-col items-center justify-center space-y-4 text-slate-500 relative z-20 pointer-events-none">
            <p className="text-4xl">📤</p>
            <p className="text-lg font-medium">Glissez-déposez une photo de votre meuble ici</p>
            <p>ou</p>
            
            {/* Bouton Visuel (pointer-events-auto pour être cliquable si le drag n'est pas utilisé) */}
            <label 
                htmlFor="file-upload-global" 
                className="pointer-events-auto px-6 py-3 bg-white text-orange-600 font-semibold rounded-full cursor-pointer hover:bg-orange-50 transition-colors shadow-md"
            >
                Cliquez pour téléverser
            </label>

            {/* Option Caméra Mobile */}
            <label className="pointer-events-auto mt-4 sm:hidden flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-full cursor-pointer text-sm">
                <CameraIcon className="h-4 w-4" />
                <span>Prendre photo</span>
                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                />
            </label>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;