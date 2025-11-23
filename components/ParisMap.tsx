
import React, { useState } from 'react';

interface ParisMapProps {
  data?: { [key: string]: number }; // Format attendu : { '75001': 5, '75011': 12 ... }
}

// Données de démonstration si aucune donnée n'est fournie
const DEMO_DATA: { [key: string]: number } = {
  '75001': 2, '75002': 5, '75003': 8, '75004': 3, '75005': 12,
  '75006': 7, '75007': 4, '75008': 6, '75009': 15, '75010': 22,
  '75011': 45, '75012': 18, '75013': 20, '75014': 14, '75015': 25,
  '75016': 9, '75017': 30, '75018': 40, '75019': 35, '75020': 28
};

// Chemins SVG simplifiés des arrondissements
const ARRONDISSEMENTS = [
  { cp: '75001', name: '1er', path: 'M425 335 L455 330 L470 350 L440 365 Z' },
  { cp: '75002', name: '2e', path: 'M425 335 L440 315 L465 310 L475 325 L455 330 Z' },
  { cp: '75003', name: '3e', path: 'M475 325 L495 315 L510 340 L485 355 L470 350 Z' },
  { cp: '75004', name: '4e', path: 'M470 350 L485 355 L515 380 L480 390 L455 370 Z' },
  { cp: '75005', name: '5e', path: 'M440 385 L480 390 L490 425 L450 435 L430 400 Z' },
  { cp: '75006', name: '6e', path: 'M400 375 L440 365 L440 385 L430 400 L410 415 Z' },
  { cp: '75007', name: '7e', path: 'M350 355 L400 345 L410 415 L360 400 Z' },
  { cp: '75008', name: '8e', path: 'M340 300 L390 290 L415 320 L350 355 L320 325 Z' },
  { cp: '75009', name: '9e', path: 'M415 320 L430 290 L460 295 L465 310 L440 315 Z' },
  { cp: '75010', name: '10e', path: 'M460 295 L490 270 L540 285 L510 340 L495 315 Z' },
  { cp: '75011', name: '11e', path: 'M510 340 L550 320 L580 380 L515 380 Z' },
  { cp: '75012', name: '12e', path: 'M515 380 L580 380 L640 420 L600 480 L530 450 L490 425 Z' },
  { cp: '75013', name: '13e', path: 'M450 435 L490 425 L530 450 L500 510 L440 500 Z' },
  { cp: '75014', name: '14e', path: 'M410 415 L450 435 L440 500 L380 480 Z' },
  { cp: '75015', name: '15e', path: 'M300 380 L360 370 L360 400 L410 415 L380 480 L320 470 Z' },
  { cp: '75016', name: '16e', path: 'M250 320 L320 300 L340 300 L320 325 L350 355 L360 370 L300 380 L270 430 Z' },
  { cp: '75017', name: '17e', path: 'M320 240 L380 230 L410 260 L430 290 L415 320 L390 290 L340 300 L320 300 Z' },
  { cp: '75018', name: '18e', path: 'M410 260 L450 220 L510 230 L490 270 L460 295 L430 290 Z' },
  { cp: '75019', name: '19e', path: 'M490 270 L530 220 L580 250 L540 285 Z' },
  { cp: '75020', name: '20e', path: 'M540 285 L580 250 L600 320 L550 320 L510 340 Z' }
];

const ParisMap: React.FC<ParisMapProps> = ({ data = DEMO_DATA }) => {
  const [hoveredArr, setHoveredArr] = useState<string | null>(null);
  const maxValue = Math.max(...Object.values(data), 1);

  const getColor = (value: number) => {
    const intensity = Math.min(value / maxValue, 1);
    if (value === 0) return '#F3F4F6';
    if (intensity < 0.3) return '#FDE047';
    if (intensity < 0.6) return '#FB923C';
    return '#EA580C';
  };

  return (
    <div className="w-full flex flex-col items-center bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
      <h3 className="text-xl font-bold text-slate-700 mb-4">Densité de Collecte par Arrondissement</h3>
      <div className="relative w-full max-w-lg aspect-[4/3]">
        <svg viewBox="200 200 500 350" className="w-full h-full drop-shadow-md">
           <path d="M650 400 Q500 450 400 380 Q300 320 200 350" fill="none" stroke="#BFDBFE" strokeWidth="10" strokeLinecap="round" className="opacity-50"/>
           {ARRONDISSEMENTS.map((arr) => {
             const value = data[arr.cp] || 0;
             const isHovered = hoveredArr === arr.cp;
             return (
               <g key={arr.cp} onMouseEnter={() => setHoveredArr(arr.cp)} onMouseLeave={() => setHoveredArr(null)} className="cursor-pointer transition-all duration-200">
                 <path d={arr.path} fill={getColor(value)} stroke="white" strokeWidth={isHovered ? 3 : 1} className={`transition-all duration-300 ${isHovered ? 'brightness-110 -translate-y-1 shadow-xl' : ''}`} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}/>
                 {value > 0 && (
                    <text x={getCenter(arr.path).x} y={getCenter(arr.path).y} textAnchor="middle" dominantBaseline="middle" fill={value > (maxValue/2) ? "white" : "#374151"} fontSize="10" fontWeight="bold" pointerEvents="none">
                        {arr.cp.slice(3)}
                    </text>
                 )}
               </g>
             );
           })}
        </svg>
        {hoveredArr && (
          <div className="absolute top-4 right-4 bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-10 animate-fade-in">
            <p className="font-bold text-sm">{ARRONDISSEMENTS.find(a => a.cp === hoveredArr)?.name} Arrondissement</p>
            <p className="text-orange-300">{data[hoveredArr] || 0} meubles collectés</p>
          </div>
        )}
      </div>
      <div className="w-full flex justify-center items-center gap-2 mt-6 text-xs text-slate-500">
        <span>Faible</span>
        <div className="w-24 h-2 rounded-full bg-gradient-to-r from-yellow-300 via-orange-400 to-orange-600"></div>
        <span>Élevé</span>
      </div>
    </div>
  );
};

function getCenter(pathStr: string) {
    const coords = pathStr.match(/[0-9]+/g)?.map(Number);
    if (!coords || coords.length === 0) return { x: 0, y: 0 };
    let sumX = 0, sumY = 0, count = 0;
    for (let i = 0; i < coords.length; i += 2) {
        sumX += coords[i];
        sumY += coords[i+1];
        count++;
    }
    return { x: sumX / count, y: sumY / count };
}
export default ParisMap;
