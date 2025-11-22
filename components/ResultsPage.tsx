
import React, { useRef, useState, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { AnalysisResult } from '../types';
import { CO2_KM_DRIVEN_FACTOR } from '../services/data';
import { LeafIcon, PiggyBankIcon, UsersIcon, DownloadIcon, ArrowPathIcon, SparklesIcon } from './Icons';
import { editImage } from '../services/geminiService';

interface ResultsPageProps {
  result: AnalysisResult;
  originalFile: File;
  originalImageSrc: string;
  onReset: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ result, originalFile, originalImageSrc, onReset }) => {
  const { impact, furnitureType, furnitureMaterial } = result;
  const resultCardRef = useRef<HTMLDivElement>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const handleDownload = useCallback(() => {
    if (resultCardRef.current === null) {
      return;
    }
    toPng(resultCardRef.current, { cacheBust: true, backgroundColor: '#1F2937' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'upcycle-impact.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('oops, something went wrong!', err);
      });
  }, []);

  const handleEditImage = async () => {
    if (!editPrompt.trim()) return;
    setIsEditing(true);
    setEditError(null);
    try {
        const reader = new FileReader();
        reader.readAsDataURL(originalFile);
        reader.onloadend = async () => {
            const base64Data = (reader.result as string).split(',')[1];
            const newImage = await editImage(base64Data, originalFile.type, editPrompt);
            setEditedImageUrl(newImage);
        };
    } catch (error) {
        console.error("Image editing failed:", error);
        setEditError("La modification de l'image a échoué. Veuillez réessayer.");
    } finally {
        setIsEditing(false);
    }
  };

  const imageToDisplay = editedImageUrl || originalImageSrc;

  return (
    <div className="w-full flex flex-col items-center space-y-6">
      <div ref={resultCardRef} className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8">
        {/* Image and Edit Section */}
        <div className="flex flex-col space-y-4">
          <div className="relative aspect-square w-full bg-gray-700 rounded-lg overflow-hidden">
             <img src={imageToDisplay} alt="Furniture" className="w-full h-full object-cover" />
             {isEditing && <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div></div>}
          </div>
          <div className="space-y-2">
            <label htmlFor="edit-prompt" className="font-semibold text-gray-300">Modifier avec l'IA :</label>
            <div className="flex gap-2">
                <input
                id="edit-prompt"
                type="text"
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="Ex: 'Ajouter un filtre rétro'"
                className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isEditing}
                />
                <button
                onClick={handleEditImage}
                disabled={isEditing || !editPrompt}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                    <SparklesIcon />
                    <span>Générer</span>
                </button>
            </div>
            {editError && <p className="text-red-400 text-sm mt-1">{editError}</p>}
          </div>
        </div>

        {/* InfoGraphic Section */}
        <div className="flex flex-col justify-center space-y-6 text-white">
          <h2 className="text-2xl md:text-3xl font-bold">Votre <span className="text-green-400">{furnitureType} en {furnitureMaterial}</span> a un potentiel incroyable !</h2>
          <p className="text-gray-300">En le rénovant, vous économisez :</p>
          
          <div className="space-y-5">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-green-500/20 rounded-full"><LeafIcon /></div>
              <div>
                <p className="text-2xl font-bold">{Math.round(impact.co2Saved)} kg de CO2</p>
                <p className="text-gray-400">L'équivalent de {Math.round(impact.co2Saved * CO2_KM_DRIVEN_FACTOR)} km en voiture.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-yellow-500/20 rounded-full"><UsersIcon /></div>
              <div>
                <p className="text-2xl font-bold">{impact.communityCostAvoided.toFixed(2)} € pour la communauté</p>
                <p className="text-gray-400">Le coût évité pour la gestion de ce déchet.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-500/20 rounded-full"><PiggyBankIcon /></div>
              <div>
                <p className="text-2xl font-bold">{impact.valueCreated.toFixed(2)} € de valeur</p>
                <p className="text-gray-400">Le prix moyen d'un article neuf similaire.</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 pt-4 text-right">Généré par The Upcycle Impact Visualizer</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-5xl">
        <button
          onClick={handleDownload}
          className="w-full flex-1 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <DownloadIcon />
          <span>Télécharger et Partager</span>
        </button>
        <button
          onClick={onReset}
          className="w-full sm:w-auto px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowPathIcon />
          <span>Analyser un autre meuble</span>
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;
