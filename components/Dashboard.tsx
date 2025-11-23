
import React, { useEffect, useState } from 'react';
import { fetchAllAnalyses } from '../services/firebaseService';
import { StoredAnalysis } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowPathIcon, LeafIcon, PiggyBankIcon } from './Icons';
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
  // On ne compte dans les KPIs positifs QUE ce qui est 'saved' ou indéfini (anciennes données)
  const savedItems = data.filter(d => d.status !== 'lost');
  
  const totalCo2 = savedItems.reduce((acc, curr) => acc + (curr.co2Saved || 0), 0);
  const totalMoneySaved = savedItems.reduce((acc, curr) => acc + (curr.communityCostAvoided || 0) + (curr.valueCreated || 0), 0);
  const totalFurniture = savedItems.length;

  // --- ANALYSE GÉOGRAPHIQUE (Paris) ---
  // Format attendu par ParisMap : { '75001': { saved: 10, lost: 2 }, ... }
  const geoData: { [key: string]: { saved: number, lost: number } } = {};
  
  data.forEach(item => {
    if (item.location) {
        // Regex pour trouver un code postal parisien (75001 à 75020)
        const match = item.location.match(/750\d{2}/);
        if (match) {
            const cp = match[0];
            if (!geoData[cp]) {
                geoData[cp] = { saved: 0, lost: 0 };
            }
            
            if (item.status === 'lost') {
                geoData[cp].lost += 1;
            } else {
                // Par défaut on considère 'saved' si pas de status (rétrocompatibilité)
                geoData[cp].saved += 1;
            }
        }
    }
  });

  // Préparation données graphiques : Top 5 Types de meubles (Uniquement Sauvés)
  const typeCount: { [key: string]: number } = {};
  savedItems.forEach(item => {
    const type = item.furnitureType || 'Autre';
    typeCount[type] = (typeCount[type] || 0) + 1;
  });
  const pieData = Object.keys(typeCount)
    .map(key => ({ name: key, value: typeCount[key] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Préparation données graphiques : Top 5 Matériaux (Uniquement Sauvés)
  const materialCount: { [key: string]: number } = {};
  savedItems.forEach(item => {
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
                <p className="text-slate-500 font-medium uppercase text-xs tracking-wider">CO2 Évité</p>
                <p className="text-3xl font-bold text-slate-800">{totalCo2.toFixed(1)} <span className="text-lg text-slate-400">kg</span></p>
            </div>
        </div>

        {/* Card 2: Money */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-yellow-100 flex items-center gap-4">
            <div className="p-4 bg-yellow-100 rounded-full text-yellow-600">
                <PiggyBankIcon className="w-8 h-8" />
            </div>
            <div>
                <p className="text-slate-500 font-medium uppercase text-xs tracking-wider">Valeur Sauvée</p>
                <p className="text-3xl font-bold text-slate-800">{totalMoneySaved.toFixed(0)} <span className="text-lg text-slate-400">€</span></p>
            </div>
        </div>

        {/* Card 3: Items */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-blue-100 flex items-center gap-4">
            <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                <ArrowPathIcon className="w-8 h-8" />
            </div>
            <div>
                <p className="text-slate-500 font-medium uppercase text-xs tracking-wider">Meubles Sauvés</p>
                <p className="text-3xl font-bold text-slate-800">{totalFurniture}</p>
            </div>
        </div>
      </div>

      {/* SECTION CARTE PARIS */}
      <div className="w-full">
        <ParisMap data={geoData} />
        <p className="text-center text-xs text-slate-400 mt-2">
            * La carte affiche les données des codes postaux Parisiens (75001-75020).
        </p>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Distribution Types */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 min-h-[350px] flex flex-col">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Types de meubles sauvés</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Chart 2: Materials Bar */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 min-h-[350px] flex flex-col">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Matériaux revalorisés</h3>
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
            <h3 className="text-lg font-semibold text-slate-700">Dernières activités</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-xs">
                    <tr>
                        <th className="p-4">Date</th>
                        <th className="p-4">Objet</th>
                        <th className="p-4">Lieu</th>
                        <th className="p-4 text-center">Statut</th>
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
                            <td className="p-4 text-center">
                                {item.status === 'lost' ? (
                                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">Perdu</span>
                                ) : (
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Sauvé</span>
                                )}
                            </td>
                            <td className="p-4 text-right font-bold text-green-600">
                                {item.status === 'lost' ? '0 kg' : `-${item.co2Saved?.toFixed(1)} kg`}
                            </td>
                            <td className="p-4 text-right font-bold text-blue-600">
                                {item.status === 'lost' ? '0 €' : `+${((item.communityCostAvoided || 0) + (item.valueCreated || 0)).toFixed(0)} €`}
                            </td>
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
