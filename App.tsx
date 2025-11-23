
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, AnalysisResult } from './types';
import LandingPage from './components/LandingPage';
import LoadingSpinner from './components/LoadingSpinner';
import ResultsPage from './components/ResultsPage';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import ParisMap from './components/ParisMap';
import { analyzeFurnitureImage } from './services/geminiService';
import { saveAnalysisToFirebase } from './services/firebaseService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    setAppState(AppState.LOADING);
    setErrorMessage(null);
  };

  const handleLocationSelect = (location: string) => {
    setUserLocation(location);
  };

  const runAnalysis = useCallback(async () => {
    if (!imageDataUrl || !uploadedFile) return;

    try {
      const base64Data = imageDataUrl.split(',')[1];
      const result = await analyzeFurnitureImage(base64Data);
      setAnalysisResult(result);
      setAppState(AppState.RESULTS);

      // Sauvegarde silencieuse des données dans Firebase pour les statistiques
      saveAnalysisToFirebase(uploadedFile, result, userLocation)
        .then(() => console.log("Statistiques enregistrées."))
        .catch(err => console.error("Echec de l'enregistrement statistique", err));

    } catch (error) {
      console.error("Analysis failed:", error);
      setErrorMessage("Désolé, l'analyse a échoué. Veuillez réessayer avec une autre image.");
      setAppState(AppState.ERROR);
    }
  }, [imageDataUrl, uploadedFile, userLocation]);

  useEffect(() => {
    if (appState === AppState.LOADING) {
      runAnalysis();
    }
  }, [appState, runAnalysis]);

  const handleReset = () => {
    setAppState(AppState.LANDING);
    setUploadedFile(null);
    setImageDataUrl(null);
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.LOADING:
        return <LoadingSpinner />;
      
      case AppState.RESULTS:
        if (analysisResult && imageDataUrl) {
          return (
            <ResultsPage
              result={analysisResult}
              originalFile={uploadedFile!}
              originalImageSrc={imageDataUrl}
              onReset={handleReset}
            />
          );
        }
        setErrorMessage("Une erreur inattendue est survenue. Les données de résultat sont manquantes.");
        setAppState(AppState.ERROR);
        return null;
      
      case AppState.ERROR:
        return (
          <div className="text-center text-red-500 bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-lg border border-red-100">
            <p className="font-medium">{errorMessage}</p>
            <button
              onClick={handleReset}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
            >
              Recommencer
            </button>
          </div>
        );

      case AppState.DASHBOARD:
        return <Dashboard onClose={() => setAppState(AppState.LANDING)} />;
      
      case AppState.TEST_MAP:
        return (
            <div className="w-full max-w-4xl animate-fade-in flex flex-col gap-4">
                <div className="flex justify-between items-center bg-white/60 backdrop-blur-md p-4 rounded-3xl shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800 px-4">Test de la Carte Vectorielle</h2>
                    <button onClick={() => setAppState(AppState.LANDING)} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 font-medium">
                        Fermer
                    </button>
                </div>
                <ParisMap />
                <p className="text-center text-slate-500 text-sm">
                    Ceci est une vue de test avec des données fictives pour valider le design SVG.
                </p>
            </div>
        );

      case AppState.LANDING:
      default:
        return (
          <LandingPage 
            onImageUpload={handleImageUpload} 
            isLoading={false} 
            onLocationSelect={handleLocationSelect}
          />
        );
    }
  };

  return (
    // On laisse le background transparent pour voir le dégradé du body
    <div className="text-slate-800 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8 w-full">
      {/* On passe la fonction pour ouvrir le dashboard au header */}
      <Header 
        onOpenDashboard={() => setAppState(AppState.DASHBOARD)} 
        onOpenMapTest={() => setAppState(AppState.TEST_MAP)}
      />
      <main className="w-full max-w-7xl flex-grow flex flex-col items-center justify-center mt-4">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
