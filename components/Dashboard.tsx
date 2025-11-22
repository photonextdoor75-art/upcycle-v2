
import React, { useEffect, useState } from 'react';
import { fetchAllAnalyses } from '../services/firebaseService';
import { StoredAnalysis } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowPathIcon, LeafIcon, PiggyBankIcon, MapPinIcon } from './Icons';
import ParisMap from './ParisMap';

interface DashboardProps {
  onClose: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard: React.FC<DashboardProps> = ({ onClose }) => {
  const [data, setData] = useState<StoredAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchAllAnalyses();
      setData(result);
      setLoading(false);
    };
    loadData();
  }, []);

  // --- CALCUL DES AGREGATS ---
  const totalCo2 = data.reduce((acc, curr) => acc + (curr.co2Saved || 0), 0);
  const totalMoneySaved = data.reduce((acc, curr) => acc + (curr.communityCostAvoided || 0) + (curr.valueCreated || 0), 0);
  const totalFurniture = data.length;

  // --- DONNÉES GÉOGRAPHIQUES (PARIS) ---
  // On essaie d'extraire les codes postaux (75001 -> 75020) des localisations
  const parisData: { [zip: string]: number } = {};
  
  data.forEach(item => {
    if (item.location) {
        // Regex simple pour trouver un code postal parisien dans la string de location
        const match = item.location.match(/750(\d{2})/);
        if (match) {
            const zip = match[0]; // ex: 75011
            parisData[zip] = (parisData[zip] || 0) + 1;
        }
    }
  });

  // Préparation données graphiques : Top 5 Types de meubles
  const typeCount: { [key: string]: number } = {};
  data.forEach(item => {
    const type = item.furnitureType || 'Autre';
    typeCount[type] = (typeCount[type] || 0) + 1;
  });
  const pieData = Object.keys(typeCount)
    .map(key => ({ name: key, value: typeCount[key] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Préparation données graphiques : Top 5 Matériaux
  const materialCount: { [key: string]: number } = {};
  data.forEach(item => {
    const mat = item.furnitureMaterial || 'Inconnu';
    materialCount[mat] = (materialCount[mat] || 0) + 1;
  });
  const barData = Object.keys(materialCount)
    .map(key => ({ name: key, count: materialCount[key] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="w-full max-w-6xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Chargement des données de la communauté...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl space-y-8 animate-fade-in pb-12">
      
      {/* Header Dashboard */}
      <div className="flex justify-between items-center bg-white/60 backdrop-blur-md p-6 rounded-3xl shadow-sm">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Tableau de Bord d'Impact</h2>
            <p className="text-slate-600">Suivi en temps réel de la valorisation communautaire.</p>
        </div>
        <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-slate-50 font-medium">
            Retour à l'accueil
        </button>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: CO2 */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-green-100 flex items-center gap-4">
            <div className="p-4 bg-green-100 rounded-full text-green-600">
                <LeafIcon className="w-8 h-8" />
            </div>
            <div>
                <p className="text-slate-500 font-medium uppercase text-xs tracking-wider">CO2 Évité (Total)</p>
                <p className="text-3xl font-bold text-slate-800">{totalCo2.toFixed(1)} <span className="text-lg text-slate-400">kg</span></p>
            </div>
        </div>

        {/* Card 2: Money */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-yellow-100 flex items-center gap-4">
            <div className="p-4 bg-yellow-100 rounded-full text-yellow-600">
                <PiggyBankIcon className="w-8 h-8" />
            </div>
            <div>
                <p className="text-slate-500 font-medium uppercase text-xs tracking-wider">Valeur Sauvée (Total)</p>
                <p className="text-3xl font-bold text-slate-800">{totalMoneySaved.toFixed(0)} <span className="text-lg text-slate-400">€</span></p>
            </div>
        </div>

        {/* Card 3: Items */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-blue-100 flex items-center gap-4">
            <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                <ArrowPathIcon className="w-8 h-8" />
            </div>
            <div>
                <p className="text-slate-500 font-medium uppercase text-xs tracking-wider">Meubles Analysés</p>
                <p className="text-3xl font-bold text-slate-800">{totalFurniture}</p>
            </div>
        </div>
      </div>

      {/* --- SECTION CARTE --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-auto lg:h-[500px]">
        {/* Carte de Paris (Prend 2/3 de la largeur) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-orange-500" />
                    Cartographie de l'Impact Parisien
                </h3>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Données temps réel</span>
            </div>
            <div className="flex-grow bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 p-4">
                <ParisMap data={parisData} />
            </div>
        </div>

        {/* Chart: Distribution Types (Prend 1/3) */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Types de meubles</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>


      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-8">
        {/* Chart Materials Bar */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 min-h-[300px] flex flex-col">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Top 5 Matériaux sauvés</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="count" fill="#F97316" radius={[0, 10, 10, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-700">Derniers objets sauvés</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-xs">
                    <tr>
                        <th className="p-4">Date</th>
                        <th className="p-4">Objet</th>
                        <th className="p-4">Lieu</th>
                        <th className="p-4 text-right">CO2</th>
                        <th className="p-4 text-right">Valeur</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.slice(0, 5).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-xs text-slate-400">
                                {item.timestamp ? new Date(item.timestamp.seconds * 1000).toLocaleDateString('fr-FR') : 'N/A'}
                            </td>
                            <td className="p-4 font-medium text-slate-800">
                                <div className="flex items-center gap-3">
                                    {item.imageUrl && (
                                        <img src={item.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
                                    )}
                                    {item.furnitureType} <span className="text-xs font-normal text-slate-400">({item.furnitureMaterial})</span>
                                </div>
                            </td>
                            <td className="p-4">{item.location}</td>
                            <td className="p-4 text-right font-bold text-green-600">-{item.co2Saved?.toFixed(1)} kg</td>
                            <td className="p-4 text-right font-bold text-blue-600">+{((item.communityCostAvoided || 0) + (item.valueCreated || 0)).toFixed(0)} €</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
