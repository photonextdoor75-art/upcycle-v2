
import React, { useRef, useState, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { AnalysisResult } from '../types';
import { DownloadIcon, ArrowPathIcon } from './Icons';
import MethodologyModal from './MethodologyModal';

interface ResultsPageProps {
  result: AnalysisResult;
  originalFile: File;
  originalImageSrc: string;
  onReset: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ result, originalFile, originalImageSrc, onReset }) => {
  const { impact, furnitureType, furnitureMaterial } = result;
  const resultCardRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <div className="w-full flex flex-col items-center space-y-8">
      
      {/* --- MODALE METHODOLOGIE --- */}
      <MethodologyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* --- CARD DESIGN (Comme sur la capture) --- */}
      {/* C'est cette div qui sera téléchargée en PNG */}
      <div 
        ref={resultCardRef} 
        className="w-full max-w-md bg-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-gray-700 flex flex-col relative"
      >
        {/* Container Image */}
        <div className="relative w-full aspect-[4/5] bg-gray-700 group">
             <img 
                src={originalImageSrc} 
                alt="Furniture" 
                className="w-full h-full object-cover" 
             />
             
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

        {/* Sources Footer */}
        <div className="bg-gray-900 p-4 border-t border-gray-700 text-center">
            <p className="text-[10px] md:text-xs text-gray-500 uppercase font-semibold tracking-wider mb-2">
                Sources & Méthodologie certifiées
            </p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[9px] md:text-[10px] text-gray-500 leading-tight">
                <span>• <strong>Climat :</strong> Rapport Quinet / Bilan GES Paris 2022</span>
                <span>• <strong>Ville :</strong> Plan Prévention Déchets Paris</span>
                <span>• <strong>Citoyen :</strong> Manifeste "Le Cycle"</span>
            </div>
        </div>
      </div>

      {/* --- ACTIONS --- */}
      <div className="w-full max-w-md space-y-4">
        
        {/* Information Button */}
        <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-2 text-sm text-indigo-400 hover:text-indigo-300 underline flex items-center justify-center gap-2 transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Comprendre le calcul (Sources & Détails)
        </button>

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
