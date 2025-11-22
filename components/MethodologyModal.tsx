
import React from 'react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-800 w-full max-w-2xl max-h-[90vh] rounded-2xl border border-gray-700 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Méthodologie & Sources</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="p-6 overflow-y-auto text-gray-300 space-y-8">
          
          <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-800">
            <p className="text-sm italic text-blue-200">
              "Ce calcul est basé sur le <strong>Manifeste Opérationnel du Projet 'Le Cycle'</strong>. Il détaille l'origine de chaque chiffre, la logique de chaque calcul et les sources qui fondent notre stratégie."
            </p>
          </div>

          {/* SECTION 1: CLIMAT */}
          <section>
            <h3 className="text-xl font-bold text-green-400 mb-3 flex items-center gap-2">
              1. Bénéfice pour le Climat (CO2)
            </h3>
            <div className="pl-4 border-l-2 border-green-400/30 space-y-2">
              <p className="text-white font-mono text-sm bg-gray-900 p-2 rounded">
                Formule : Poids du meuble (kg) × 3,25
              </p>
              <p className="text-sm">
                <strong>Le Calcul :</strong> Nous multiplions le poids estimé du meuble par le ratio d'évitement carbone.
              </p>
              <p className="text-sm">
                <strong>La Source :</strong> Valeur tutélaire du carbone, Rapport Quinet / France Stratégie. Le ratio de <strong>3,25 kg CO2e par kg de meuble</strong> correspond à l'évitement de la production neuve et de la fin de vie (incinération).
              </p>
              <div className="mt-2 text-xs text-gray-400">
                <p>Contexte : <em>"Émissions de CO2 dues aux Déchets Parisiens : 445 290 tonnes de CO2e / an."</em></p>
                <a 
                  href="https://cdn.paris.fr/paris/2025/07/31/synthese-des-emissions-de-gaz-a-effet-de-serre-de-paris-2022-IaQO.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:underline flex items-center gap-1 mt-1"
                >
                  Voir le rapport officiel "Bilan GES Paris 2022" (PDF)
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
            </div>
          </section>

          {/* SECTION 2: VILLE */}
          <section>
            <h3 className="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
              2. Bénéfice pour la Ville (Économie)
            </h3>
            <div className="pl-4 border-l-2 border-yellow-400/30 space-y-2">
              <p className="text-white font-mono text-sm bg-gray-900 p-2 rounded">
                Formule : Poids (tonnes) × 400 €
              </p>
              <p className="text-sm">
                <strong>Le Calcul :</strong> Coût de la gestion du déchet évité pour la collectivité.
              </p>
              <p className="text-sm">
                <strong>La Source :</strong> Coût complet de la gestion des encombrants à Paris (~250€/t pour la collecte + ~150€/t pour l'incinération).
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Citation : <em>"Réduire les déchets de 100 000 tonnes d'ici 2030."</em> — Source: Plan de Prévention des Déchets de Paris.
              </p>
            </div>
          </section>

          {/* SECTION 3: CITOYEN */}
          <section>
            <h3 className="text-xl font-bold text-blue-400 mb-3 flex items-center gap-2">
              3. Bénéfice pour le Citoyen (Valeur)
            </h3>
            <div className="pl-4 border-l-2 border-blue-400/30 space-y-2">
              <p className="text-white font-mono text-sm bg-gray-900 p-2 rounded">
                Formule : Prix Neuf Équivalent - Coût Réparation (~45€)
              </p>
              <p className="text-sm">
                <strong>Le Calcul :</strong> La différence entre le coût d'abandon (racheter neuf) et le coût de notre solution de surcyclage (abonnement + intervention).
              </p>
              <p className="text-sm">
                <strong>La Source :</strong> Comparaison prix public grande distribution vs modèle économique "Le Cycle".
              </p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 text-right">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default MethodologyModal;
