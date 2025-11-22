
import React, { useMemo } from 'react';

interface ParisMapProps {
  data: { [key: string]: number }; // ex: { "75011": 15, "75020": 8 }
}

// Représentation schématique vectorielle des 20 arrondissements (Forme "Escargot")
const ARRONDISSEMENTS = [
  { zip: "75001", name: "1er", path: "M485,335 L510,330 L530,345 L515,365 L490,360 Z", cx: 505, cy: 345 },
  { zip: "75002", name: "2e", path: "M485,315 L520,310 L535,330 L510,330 L485,335 Z", cx: 510, cy: 320 },
  { zip: "75003", name: "3e", path: "M535,330 L560,325 L570,350 L545,360 L530,345 Z", cx: 550, cy: 340 },
  { zip: "75004", name: "4e", path: "M515,365 L530,345 L545,360 L560,375 L530,390 Z", cx: 535, cy: 365 },
  { zip: "75005", name: "5e", path: "M490,390 L530,390 L550,420 L510,435 L480,410 Z", cx: 515, cy: 410 },
  { zip: "75006", name: "6e", path: "M450,380 L490,360 L490,390 L480,410 L450,400 Z", cx: 470, cy: 390 },
  { zip: "75007", name: "7e", path: "M400,360 L450,345 L450,380 L450,400 L410,390 Z", cx: 430, cy: 370 },
  { zip: "75008", name: "8e", path: "M380,290 L430,280 L450,345 L400,360 L370,320 Z", cx: 410, cy: 320 },
  { zip: "75009", name: "9e", path: "M430,280 L470,270 L485,315 L485,335 L450,345 Z", cx: 460, cy: 300 },
  { zip: "75010", name: "10e", path: "M470,270 L530,250 L560,280 L560,325 L535,330 L520,310 L485,315 Z", cx: 520, cy: 290 },
  { zip: "75011", name: "11e", path: "M560,325 L560,280 L610,290 L620,360 L570,380 L560,375 L545,360 L570,350 Z", cx: 580, cy: 330 },
  { zip: "75012", name: "12e", path: "M570,380 L620,360 L680,450 L600,480 L550,420 L560,375 Z", cx: 610, cy: 420 },
  { zip: "75013", name: "13e", path: "M510,435 L550,420 L600,480 L540,530 L490,490 Z", cx: 540, cy: 470 },
  { zip: "75014", name: "14e", path: "M410,450 L480,410 L510,435 L490,490 L430,500 Z", cx: 460, cy: 460 },
  { zip: "75015", name: "15e", path: "M340,400 L410,390 L410,450 L430,500 L370,520 L320,460 Z", cx: 380, cy: 450 },
  { zip: "75016", name: "16e", path: "M280,350 L340,320 L370,320 L400,360 L340,400 L320,460 L270,420 Z", cx: 330, cy: 380 },
  { zip: "75017", name: "17e", path: "M340,320 L390,260 L430,280 L380,290 L370,320 Z", cx: 390, cy: 290 },
  { zip: "75018", name: "18e", path: "M390,260 L450,220 L530,250 L470,270 L430,280 Z", cx: 460, cy: 250 },
  { zip: "75019", name: "19e", path: "M530,250 L580,210 L630,270 L610,290 L560,280 Z", cx: 580, cy: 250 },
  { zip: "75020", name: "20e", path: "M610,290 L630,270 L660,330 L620,360 Z", cx: 630, cy: 310 },
];

const ParisMap: React.FC<ParisMapProps> = ({ data }) => {
  
  // Calculer le max pour l'échelle de couleur
  const maxCount = useMemo(() => {
    const vals = Object.values(data);
    return vals.length > 0 ? Math.max(...vals) : 1;
  }, [data]);

  // Fonction pour interpoler la couleur (Gris -> Orange -> Rouge)
  const getColor = (count: number) => {
    if (!count) return '#F1F5F9'; // Slate-100 (Vide)
    const ratio = count / maxCount;
    
    // Dégradé simple du Orange clair au Orange foncé/Rouge
    if (ratio < 0.3) return '#FED7AA'; // Orange-200
    if (ratio < 0.6) return '#FB923C'; // Orange-400
    return '#EA580C'; // Orange-600
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">
      <svg viewBox="250 200 450 350" className="w-full h-full max-h-[500px] drop-shadow-sm">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* SEINE (Approximative pour le style) */}
        <path 
          d="M680,450 C600,420 550,380 500,380 C450,380 400,400 340,400" 
          fill="none" 
          stroke="#93C5FD" 
          strokeWidth="15" 
          opacity="0.5"
          strokeLinecap="round"
        />

        {ARRONDISSEMENTS.map((arr) => {
          const count = data[arr.zip] || 0;
          const color = getColor(count);
          const isActive = count > 0;

          return (
            <g key={arr.zip} className="group transition-all duration-300 hover:-translate-y-1">
              <path
                d={arr.path}
                fill={color}
                stroke="white"
                strokeWidth="2"
                className={`cursor-pointer transition-colors duration-300 ${isActive ? 'hover:fill-indigo-500' : 'hover:fill-slate-200'}`}
              >
                <title>{`${arr.name} Arrondissement : ${count} meuble(s)`}</title>
              </path>
              
              {/* Label Numéro */}
              <text
                x={arr.cx}
                y={arr.cy}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-[10px] font-bold pointer-events-none ${isActive ? 'fill-white' : 'fill-slate-400'}`}
              >
                {arr.name}
              </text>
            </g>
          );
        })}
      </svg>
      
      {/* Légende simple */}
      <div className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-lg text-xs text-slate-600 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full bg-[#EA580C]"></span> Fort impact
        </div>
        <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full bg-[#FED7AA]"></span> Impact moyen
        </div>
        <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#F1F5F9] border border-slate-200"></span> Pas de données
        </div>
      </div>
    </div>
  );
};

export default ParisMap;
