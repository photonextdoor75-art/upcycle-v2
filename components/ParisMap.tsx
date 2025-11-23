
import React, { useState } from 'react';

interface ParisMapProps {
  // La donnée est un objet { saved: number, lost: number } par code postal
  data?: { [key: string]: { saved: number, lost: number } }; 
}

// Données extraites du SVG Illustrator "Puzzle" (Tracés précis et coordonnées exactes)
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
  { cp: '75020', labelX: 736, labelY: 253, points: "813.651,361.695 740.636,352.104 645.325,195.695 790.843,152.649 802.001,187.807 810.823,305.576 815.232,344.566" }
];

const ParisMap: React.FC<ParisMapProps> = ({ data = {} }) => {
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);

  const getColor = (cp: string) => {
    const stats = data[cp] || { saved: 0, lost: 0 };
    const count = stats.saved;
    
    if (count === 0) return '#FCD34D'; // Jaune (défaut)
    if (count < 5) return '#F97316'; // Orange clair
    if (count < 10) return '#EA580C'; // Orange moyen
    return '#C2410C'; // Orange foncé/Rouge
  };

  return (
    <div className="w-full h-full flex flex-col items-center relative">
      <h3 className="text-xl font-bold text-slate-700 mb-4">Densité de Collecte par Arrondissement</h3>
      
      <div className="relative w-full max-w-4xl">
        {/* Tooltip Flottant */}
        {hoveredDistrict && (
            <div 
                className="absolute z-50 bg-slate-800 text-white text-xs rounded-lg p-3 shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all"
                style={{ 
                    left: PARIS_DISTRICTS.find(d => d.cp === hoveredDistrict)?.labelX, 
                    top: (PARIS_DISTRICTS.find(d => d.cp === hoveredDistrict)?.labelY || 0) - 10
                }}
            >
                <p className="font-bold text-sm mb-1">
                    {parseInt(hoveredDistrict.slice(3))}ème Arrondissement
                </p>
                <div className="flex gap-3">
                    <div className="text-green-400">
                        <span className="font-bold block text-lg">{data[hoveredDistrict]?.saved || 0}</span>
                        <span>Sauvés</span>
                    </div>
                    <div className="text-red-400 border-l border-slate-600 pl-3">
                        <span className="font-bold block text-lg">{data[hoveredDistrict]?.lost || 0}</span>
                        <span>Perdus</span>
                    </div>
                </div>
            </div>
        )}

        <svg 
            viewBox="-29.836 -17.13 1080 600" 
            className="w-full h-auto drop-shadow-xl filter"
            style={{ maxHeight: '600px' }}
        >
          <g>
            {PARIS_DISTRICTS.map((district) => (
              <polygon
                key={district.cp}
                points={district.points}
                fill={getColor(district.cp)}
                stroke="white"
                strokeWidth="2"
                className="transition-all duration-300 cursor-pointer hover:opacity-90 hover:stroke-[4px]"
                onMouseEnter={() => setHoveredDistrict(district.cp)}
                onMouseLeave={() => setHoveredDistrict(null)}
              />
            ))}
          </g>
          <g className="pointer-events-none">
            {PARIS_DISTRICTS.map((district) => (
              <text
                key={`label-${district.cp}`}
                x={district.labelX}
                y={district.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-800 font-bold text-sm md:text-base opacity-70"
                style={{ pointerEvents: 'none' }}
              >
                {district.cp.slice(3)}
              </text>
            ))}
          </g>
        </svg>
      </div>

      {/* Légende */}
      <div className="flex items-center gap-4 mt-6 text-sm text-slate-600">
        <span>Faible</span>
        <div className="w-32 h-3 bg-gradient-to-r from-yellow-300 via-orange-400 to-orange-800 rounded-full"></div>
        <span>Élevé</span>
      </div>
    </div>
  );
};

export default ParisMap;
