import React from 'react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col animate-fade-in">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Méthodologie & Sources</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="p-6 overflow-y-auto text-gray-600 space-y-8">
          
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
            <p className="text-sm italic text-blue-800 leading-relaxed">
              "Ce calcul est basé sur le <strong>Manifeste Opérationnel du Projet 'Le Cycle'</strong>. Il détaille l'origine de chaque chiffre, la logique de chaque calcul et les sources qui fondent notre stratégie."
            </p>
          </div>

          {/* SECTION 1: CLIMAT */}
          <section>
            <h3 className="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
              1. Bénéfice pour le Climat (CO2)
            </h3>
            <div className="pl-4 border-l-4 border-green-100 space-y-3">
              <p className="text-gray-800 font-mono text-sm bg-gray-100 p-2 rounded-md inline-block border border-gray-200">
                Formule : Poids du meuble (kg) × 3,25
              </p>
              <p className="text-sm">
                <strong>Le Calcul :</strong> Nous multiplions le poids estimé du meuble par le ratio d'évitement carbone.
              </p>
              <p className="text-sm">
                <strong>La Source :</strong> Valeur tutélaire du carbone, Rapport Quinet / France Stratégie. Le ratio de <strong>3,25 kg CO2e par kg de meuble</strong> correspond à l'évitement de la production neuve et de la fin de vie (incinération).
              </p>
              <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p className="mb-2">Contexte : <em>"Émissions de CO2 dues aux Déchets Parisiens : 445 290 tonnes de CO2e / an."</em></p>
                <a 
                  href="https://cdn.paris.fr/paris/2025/07/31/synthese-des-emissions-de-gaz-a-effet-de-serre-de-paris-2022-IaQO.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline flex items-center gap-1 font-medium"
                >
                  Voir le rapport officiel "Bilan GES Paris 2022" (PDF)
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
            </div>
          </section>

          {/* SECTION 2: VILLE */}
          <section>
            <h3 className="text-xl font-bold text-yellow-600 mb-3 flex items-center gap-2">
              2. Bénéfice pour la Ville (Économie)
            </h3>
            <div className="pl-4 border-l-4 border-yellow-100 space-y-3">
              <p className="text-gray-800 font-mono text-sm bg-gray-100 p-2 rounded-md inline-block border border-gray-200">
                Formule : Poids (tonnes) × 400 €
              </p>
              <p className="text-sm">
                <strong>Le Calcul :</strong> Coût de la gestion du déchet évité pour la collectivité.
              </p>
              <p className="text-sm">
                <strong>La Source :</strong> Coût complet de la gestion des encombrants à Paris (~250€/t pour la collecte + ~150€/t pour l'incinération).
              </p>
              <p className="text-xs text-gray-500 mt-1 italic">
                Citation : "Réduire les déchets de 100 000 tonnes d'ici 2030." — Source: Plan de Prévention des Déchets de Paris.
              </p>
            </div>
          </section>

          {/* SECTION 3: CITOYEN */}
          <section>
            <h3 className="text-xl font-bold text-blue-600 mb-3 flex items-center gap-2">
              3. Bénéfice pour le Citoyen (Valeur)
            </h3>
            <div className="pl-4 border-l-4 border-blue-100 space-y-3">
              <p className="text-gray-800 font-mono text-sm bg-gray-100 p-2 rounded-md inline-block border border-gray-200">
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
        <div className="p-6 border-t border-gray-100 text-right">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default MethodologyModal;