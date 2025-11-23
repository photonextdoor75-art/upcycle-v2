
import React, { useState } from 'react';

interface ParisMapProps {
  data?: { [key: string]: number }; // Format: { '75001': 10, ... }
}

// Données extraites du SVG Illustrator fourni
const PARIS_DISTRICTS = [
  { cp: '75001', labelX: 461, labelY: 261, points: "505.115,313.364 454.536,278.482 402.386,253.716 423.932,211.272 433.044,209.167 532.284,251.963 529.003,261.104" },
  { cp: '75002', labelX: 511, labelY: 233, points: "532.284,251.963 433.044,209.167 519.229,204.135 546.394,213.024" },
  { cp: '75003', labelX: 559, labelY: 256, points: "608.182,301.896 529.003,261.104 532.284,251.963 546.394,213.024 588.487,225.119" },
  { cp: '75004', labelX: 553, labelY: 316, points: "590.491,364.725 505.115,313.364 529.003,261.104 608.182,301.896 610.787,318.398" },
  { cp: '75005', labelX: 518, labelY: 380, points: "597.564,372.988 535.419,426.001 494.253,416.36 470.689,407.22 505.115,313.364 590.491,364.725" },
  { cp: '75006', labelX: 450, labelY: 354, points: "470.689,407.22 419.146,382.103 384.464,360.843 439.231,320.953 454.536,278.482 505.115,313.364" },
  { cp: '75007', labelX: 361, labelY: 302, points: "384.464,360.843 344.319,354.658 268.465,286.245 319.326,251.087 402.386,253.716 454.536,278.482 439.231,320.953" },
  { cp: '75008', labelX: 358, labelY: 202, points: "402.386,253.716 319.326,251.087 291.628,182.9 320.436,150.07 429.75,119.77 423.932,211.272" },
  { cp: '75009', labelX: 466, labelY: 168, points: "423.932,211.272 429.75,119.77 526.655,118.843 519.229,204.135 433.044,209.167" },
  { cp: '75010', labelX: 561, labelY: 173, points: "588.487,225.119 546.394,213.024 519.229,204.135 526.655,118.843 592.016,114.462 611.979,120.796 645.325,195.695" },
  { cp: '75011', labelX: 632, labelY: 280, points: "740.636,352.104 610.787,318.398 608.182,301.896 588.487,225.119 645.325,195.695" },
  { cp: '75012', labelX: 694, labelY: 408, points: "1009.25,547.352 903.156,546.549 873.741,514.472 830.983,509.714 758.878,475.833 701.734,499.122 597.564,372.988 590.491,364.725 610.787,318.398 740.636,352.104 813.651,361.695 803.63,423.421 816.113,440.099 844.156,387.337 863.52,394.875 951.377,373.639 1035.225,411.201 1028.729,495.265" },
  { cp: '75013', labelX: 561, labelY: 484, points: "502.307,564.354 494.253,416.36 535.419,426.001 597.564,372.988 701.734,499.122 589.707,560.222 556.074,563.027 541.008,548.227" },
  { cp: '75014', labelX: 419, labelY: 472, points: "502.307,564.354 450.46,556.116 373.728,521.458 318.308,502.827 419.146,382.103 470.689,407.22 494.253,416.36" },
  { cp: '75015', labelX: 275, labelY: 400, points: "318.308,502.827 266.802,481.693 229.902,462.11 191.322,478.187 172.697,443.28 151.877,445.082 268.465,286.245 344.319,354.658 384.464,360.843 419.146,382.103" },
  { cp: '75016', labelX: 143, labelY: 271, points: "151.877,445.082 111.966,425.851 88.185,363.723 -14.775,316.495 -8.5,277.831 17.678,214.402 77.999,165.871 119.423,179.694 139.74,141.38 225.964,151.973 291.628,182.9 319.326,251.087 268.465,286.245" },
  { cp: '75017', labelX: 332, labelY: 102, points: "291.628,182.9 225.964,151.973 245.456,105.622 328.921,49.729 398.51,8.336 442.141,3.703 429.75,119.77 320.436,150.07" },
  { cp: '75018', labelX: 506, labelY: 69, points: "429.75,119.77 442.141,3.703 536.71,1.324 597.114,0.774 616.266,0.498 620.528,40.039 592.016,114.462 526.655,118.843" },
  { cp: '75019', labelX: 664, labelY: 112, points: "645.325,195.695 611.979,120.796 592.016,114.462 620.528,40.039 616.266,0.498 699.035,3.754 729.515,36.332 738.811,80.831 746.105,118.042 790.843,152.649" },
  { cp: '75020', labelX: 736, labelY: 253, points: "813.651,361.695 740.636,352.104 645.325,195.695 790.843,152.649 802.001,187.807 810.823,305.576 815.232,344.566" },
];

const ParisMap: React.FC<ParisMapProps> = ({ data = {} }) => {
  const [hoveredArr, setHoveredArr] = useState<string | null>(null);
  
  // Si aucune donnée, max = 1 pour éviter division par zéro, sinon max des données réelles
  const values = Object.values(data);
  const maxValue = values.length > 0 ? Math.max(...values) : 1;

  const getColor = (value: number) => {
    if (!value || value === 0) return '#F3F4F6'; // Gris clair si vide
    
    // Echelle de chaleur simple
    const intensity = value / maxValue;
    if (intensity < 0.3) return '#FDE047'; // Jaune (Faible)
    if (intensity < 0.7) return '#FB923C'; // Orange (Moyen)
    return '#EA580C'; // Rouge/Orange foncé (Fort)
  };

  return (
    <div className="w-full flex flex-col items-center bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
      <h3 className="text-xl font-bold text-slate-700 mb-4">Densité de Collecte par Arrondissement</h3>
      
      <div className="relative w-full max-w-2xl aspect-[1.8]">
        <svg 
            viewBox="-20 -10 1080 600" 
            className="w-full h-full drop-shadow-xl"
            style={{ overflow: 'visible' }}
        >
           <filter id="dropShadow" height="130%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/> 
              <feOffset dx="2" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/>
              </feComponentTransfer>
              <feMerge> 
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/> 
              </feMerge>
            </filter>

           {PARIS_DISTRICTS.map((arr) => {
             const value = data[arr.cp] || 0;
             const isHovered = hoveredArr === arr.cp;
             return (
               <g 
                key={arr.cp} 
                onMouseEnter={() => setHoveredArr(arr.cp)} 
                onMouseLeave={() => setHoveredArr(null)} 
                className="cursor-pointer group"
               >
                 <polygon 
                    points={arr.points} 
                    fill={getColor(value)} 
                    stroke="white" 
                    strokeWidth={isHovered ? 3 : 1.5} 
                    strokeLinejoin="round"
                    className={`transition-all duration-300 ease-out ${isHovered ? 'opacity-100 -translate-y-1 brightness-110' : 'opacity-90'}`}
                    style={{ transformBox: 'fill-box', transformOrigin: 'center', filter: isHovered ? 'url(#dropShadow)' : 'none' }}
                 />
                 
                 {/* Numéro d'arrondissement */}
                 <text 
                    x={arr.labelX} 
                    y={arr.labelY} 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    fill={value > 0 && value > (maxValue/2) ? "white" : "#374151"} 
                    fontSize="24" 
                    fontWeight="bold" 
                    className="pointer-events-none select-none transition-all font-sans"
                    style={{ 
                        transform: isHovered ? 'scale(1.2) translateY(-4px)' : 'scale(1)', 
                        transformBox: 'fill-box', 
                        transformOrigin: 'center',
                        textShadow: '0px 1px 2px rgba(0,0,0,0.1)'
                    }}
                 >
                    {arr.cp.slice(3)}
                 </text>
               </g>
             );
           })}
        </svg>

        {hoveredArr && (
          <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur text-white px-4 py-2 rounded-xl shadow-xl z-20 animate-fade-in pointer-events-none border border-slate-700">
            <p className="font-bold text-sm">{hoveredArr.slice(3)}e Arrondissement</p>
            <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${data[hoveredArr] ? 'bg-orange-400' : 'bg-gray-400'}`}></div>
                <p className="text-slate-200 text-xs">{data[hoveredArr] || 0} meubles sauvés</p>
            </div>
          </div>
        )}
      </div>

      <div className="w-full flex justify-center items-center gap-3 mt-6 text-xs text-slate-500 font-medium">
        <span>Faible</span>
        <div className="w-32 h-2 rounded-full bg-gradient-to-r from-yellow-300 via-orange-400 to-orange-600 shadow-inner"></div>
        <span>Élevé</span>
      </div>
    </div>
  );
};

export default ParisMap;
