
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

  // Gestion de la géolocalisation navigateur
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
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

  // Validation manuelle de l'input ville/adresse
  const handleManualLocation = () => {
    if (inputLocation.trim()) {
      onLocationSelect(inputLocation);
      setLocationStatus('found');
    }
  };

  return (
    <div className="w-full max-w-3xl flex flex-col space-y-6">
      
      {/* --- ÉTAPE 1 : LOCALISATION --- */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          Étape 1 : Localisez votre impact <span className="text-sm font-normal text-gray-400">(Optionnel)</span>
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <button
            onClick={handleGeolocation}
            className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap ${
              locationStatus === 'found' ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <MapPinIcon />
            {locationStatus === 'locating' ? '...' : 'Me localiser'}
          </button>

          <span className="text-gray-500 font-medium">ou</span>

          <div className="flex-grow flex gap-2 w-full">
            <input
              type="text"
              value={inputLocation}
              onChange={(e) => setInputLocation(e.target.value)}
              placeholder="Entrez une ville, une adresse..."
              className="flex-grow bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
            <button 
              onClick={handleManualLocation}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Valider
            </button>
          </div>
        </div>
        {locationStatus === 'found' && (
          <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
             ✓ Localisation enregistrée
          </p>
        )}
      </div>

      {/* --- ÉTAPE 2 : TÉLÉVERSEMENT PHOTO --- */}
      <div 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-xl p-10 transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[300px]
          ${isDragging ? 'border-indigo-400 bg-gray-800' : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'}`}
      >
        <h2 className="absolute top-6 left-6 text-lg font-semibold text-white">
            Étape 2 : Téléversez votre photo
        </h2>

        <div className="mt-8 flex flex-col items-center space-y-6">
            <div className="text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                <p className="text-xl font-medium">Glissez-déposez une photo de votre meuble ici</p>
            </div>

            <p className="text-gray-500">ou</p>

            <div className="flex flex-wrap gap-4 justify-center">
                {/* Bouton Caméra (Mobile) */}
                <label className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-lg cursor-pointer hover:bg-pink-700 transition-colors shadow-lg">
                    <CameraIcon />
                    <span>Prendre une photo</span>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        disabled={isLoading}
                    />
                </label>

                {/* Bouton Fichier Classique */}
                <label className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <span>Choisir un fichier</span>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isLoading}
                    />
                </label>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
