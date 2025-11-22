
import React, { useRef, useState, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { AnalysisResult } from '../types';
import { DownloadIcon, ArrowPathIcon, SparklesIcon } from './Icons';
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
    // On ajoute un petit délai pour s'assurer que les fonts sont chargées
    setTimeout(() => {
        if (resultCardRef.current) {
            toPng(resultCardRef.current, { cacheBust: true, backgroundColor: '#111827' }) // bg-gray-900 hex
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = 'upcycle-impact.png';
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => {
                console.error('Erreur lors de la génération de l\'image:', err);
            });
        }
    }, 100);
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
    <div className="w-full flex flex-col items-center space-y-8">
      
      {/* --- CARD DESIGN (Comme sur la capture) --- */}
      {/* C'est cette div qui sera téléchargée en PNG */}
      <div 
        ref={resultCardRef} 
        className="w-full max-w-md bg-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-gray-700 flex flex-col relative"
      >
        {/* Container Image */}
        <div className="relative w-full aspect-[4/5] bg-gray-700 group">
             <img 
                src={imageToDisplay} 
                alt="Furniture" 
                className="w-full h-full object-cover" 
             />
             
             {/* Loading Overlay for Edit */}
             {isEditing && (
                 <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
                 </div>
             )}

             {/* STAMP "VALORISÉ" */}
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <div className="border-4 md:border-8 border-yellow-500/90 px-6 py-2 -rotate-12">
                    <span className="text-5xl md:text-7xl font-black text-yellow-500/90 tracking-widest uppercase whitespace-nowrap">
                        VALORISÉ
                    </span>
                </div>
             </div>

             {/* Text Overlay Bottom */}
             <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent p-6 pt-20 text-center z-10">
                <p className="text-white font-bold text-lg md:text-xl leading-snug drop-shadow-md">
                    Votre <span className="text-green-400">{furnitureType} en {furnitureMaterial}</span> a un <br/> potentiel incroyable !
                </p>
             </div>
        </div>

        {/* Metrics Bar */}
        <div className="bg-gray-800 p-6 grid grid-cols-3 divide-x divide-gray-700">
            <div className="flex flex-col items-center justify-center px-2">
                <span className="text-2xl md:text-3xl font-bold text-green-500">{Math.round(impact.co2Saved)} kg</span>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">CO2 Évité</span>
            </div>
            <div className="flex flex-col items-center justify-center px-2">
                <span className="text-2xl md:text-3xl font-bold text-yellow-500">{impact.communityCostAvoided.toFixed(0)} €</span>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Économie</span>
            </div>
            <div className="flex flex-col items-center justify-center px-2">
                <span className="text-2xl md:text-3xl font-bold text-blue-500">{impact.valueCreated.toFixed(0)} €</span>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Valeur</span>
            </div>
        </div>
      </div>

      {/* --- ACTIONS & EDIT (Hors de la capture PNG) --- */}
      <div className="w-full max-w-md space-y-4">
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
            <button
            onClick={handleDownload}
            className="px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
            >
            <DownloadIcon />
            <span>Télécharger</span>
            </button>
            <button
            onClick={() => alert("Fonction de partage bientôt disponible !")}
            className="px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
            >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            <span>Partager</span>
            </button>
        </div>

        {/* Edit Section (Collapsible or subtle) */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mt-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">Envie de changer le style ?</label>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="Ex: Peindre en bleu vintage..."
                    className="flex-grow bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <button
                    onClick={handleEditImage}
                    disabled={isEditing || !editPrompt}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                    <SparklesIcon />
                </button>
            </div>
            {editError && <p className="text-red-400 text-xs mt-2">{editError}</p>}
        </div>

        <button
          onClick={onReset}
          className="w-full py-3 bg-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 mt-2"
        >
          <ArrowPathIcon />
          <span>Analyser un autre meuble</span>
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;
