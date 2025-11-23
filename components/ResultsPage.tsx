
import React, { useRef, useState, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { AnalysisResult } from '../types';
import { DownloadIcon, ArrowPathIcon, LeafIcon } from './Icons';
import MethodologyModal from './MethodologyModal';

interface ResultsPageProps {
  result: AnalysisResult;
  originalFile: File;
  originalImageSrc: string;
  onReset: () => void;
  onDecision: (status: 'saved' | 'lost') => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ result, originalFile, originalImageSrc, onReset, onDecision }) => {
  const { impact, furnitureType, furnitureMaterial } = result;
  const resultCardRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [decisionMade, setDecisionMade] = useState<'none' | 'saved' | 'lost'>('none');

  const handleDownload = useCallback(() => {
    if (resultCardRef.current === null) {
      return;
    }
    setTimeout(() => {
        if (resultCardRef.current) {
            toPng(resultCardRef.current, { cacheBust: true, backgroundColor: '#ffffff' }) 
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

  const handleDecision = (status: 'saved' | 'lost') => {
      setDecisionMade(status);
      onDecision(status);
  };

  return (
    <div className="w-full flex flex-col items-center space-y-8 animate-fade-in">
      
      {/* --- MODALE METHODOLOGIE --- */}
      <MethodologyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* --- CARD DESIGN (Thème Atelier) --- */}
      <div 
        ref={resultCardRef} 
        className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col relative"
      >
        {/* Container Image */}
        <div className="relative w-full aspect-[4/5] bg-gray-100 group">
             <img 
                src={originalImageSrc} 
                alt="Furniture" 
                className="w-full h-full object-cover" 
             />
             
             {/* STAMP "VALORISÉ" (Seulement si sauvé ou pas encore décidé) */}
             {decisionMade !== 'lost' && (
                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <div className="border-4 md:border-8 border-white/90 px-6 py-2 -rotate-12 bg-yellow-500/80 backdrop-blur-sm shadow-lg">
                        <span className="text-4xl md:text-6xl font-black text-white tracking-widest uppercase whitespace-nowrap drop-shadow-md">
                            POTENTIEL
                        </span>
                    </div>
                 </div>
             )}

             {/* Text Overlay Bottom */}
             <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 pt-20 text-center z-10">
                <p className="text-white font-bold text-lg md:text-xl leading-snug drop-shadow-md">
                    Votre <span className="text-green-400">{furnitureType} en {furnitureMaterial}</span>
                </p>
             </div>
        </div>

        {/* Metrics Bar */}
        <div className="bg-white p-6 grid grid-cols-3 divide-x divide-gray-100">
            <div className="flex flex-col items-center justify-center px-2">
                <span className="text-2xl md:text-3xl font-bold text-green-600">{Math.round(impact.co2Saved)} kg</span>
                <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">CO2 Évité</span>
            </div>
            <div className="flex flex-col items-center justify-center px-2">
                <span className="text-2xl md:text-3xl font-bold text-yellow-600">{impact.communityCostAvoided.toFixed(0)} €</span>
                <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Économie</span>
            </div>
            <div className="flex flex-col items-center justify-center px-2">
                <span className="text-2xl md:text-3xl font-bold text-blue-600">{impact.valueCreated.toFixed(0)} €</span>
                <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Valeur</span>
            </div>
        </div>

        {/* Sources Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-100 text-center">
            <p className="text-[10px] md:text-xs text-gray-400 uppercase font-semibold tracking-wider mb-2">
                Sources & Méthodologie certifiées
            </p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[9px] md:text-[10px] text-gray-400 leading-tight">
                <span>• <strong>Climat :</strong> Bilan GES Paris 2022</span>
                <span>• <strong>Ville :</strong> Plan Déchets Paris</span>
                <span>• <strong>Citoyen :</strong> Comparatif DIY</span>
            </div>
        </div>
      </div>

      {/* --- ACTIONS DE DECISION --- */}
      <div className="w-full max-w-md bg-white/60 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-white space-y-4">
        
        {decisionMade === 'none' ? (
            <>
                <h3 className="text-center text-lg font-bold text-slate-800">Quelle décision prenez-vous ?</h3>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleDecision('saved')}
                        className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-1"
                    >
                        <span className="text-xl">🤩</span>
                        <span>Je le sauve !</span>
                        <span className="text-[10px] font-normal opacity-80">(Réparation, Vente, Don)</span>
                    </button>
                    
                    <button
                        onClick={() => handleDecision('lost')}
                        className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold rounded-xl transition-all flex flex-col items-center justify-center gap-1"
                    >
                        <span className="text-xl">🗑️</span>
                        <span>Je m'en débarrasse</span>
                        <span className="text-[10px] font-normal opacity-70">(Encombrants, Déchèterie)</span>
                    </button>
                </div>
            </>
        ) : (
            <div className={`text-center p-4 rounded-xl border ${decisionMade === 'saved' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-orange-50 border-orange-200 text-orange-800'}`}>
                {decisionMade === 'saved' ? (
                    <>
                        <p className="text-2xl mb-2">🎉</p>
                        <p className="font-bold text-lg">Merci pour votre action !</p>
                        <p className="text-sm mt-1">Votre impact a été enregistré dans les statistiques de votre quartier.</p>
                    </>
                ) : (
                    <>
                        <p className="text-2xl mb-2">📉</p>
                        <p className="font-bold text-lg">Dommage...</p>
                        <p className="text-sm mt-1">Cet objet est comptabilisé comme perte de valeur pour la communauté.</p>
                    </>
                )}
            </div>
        )}

        <div className="w-full h-px bg-slate-200 my-4"></div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-4">
            <button
                onClick={handleDownload}
                className="px-4 py-2 bg-white text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 border border-slate-200 text-sm"
            >
                <DownloadIcon className="w-4 h-4" />
                <span>Télécharger</span>
            </button>
            <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-white text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 border border-slate-200 text-sm"
            >
                <span>ℹ️ Détails calcul</span>
            </button>
        </div>

        <button
          onClick={onReset}
          className="w-full py-3 text-slate-500 font-medium hover:text-slate-800 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span>Analyser un autre meuble</span>
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;
