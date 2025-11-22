
import { FurnitureInfo } from '../types';

// --- CONSTANTES MÉTHODOLOGIQUES ---

// II. B. Bénéfice pour la Ville de Paris (Coût de gestion du déchet évité)
// Source: Coût complet de la gestion des encombrants = 400 € / tonne
export const WASTE_MANAGEMENT_COST_PER_TONNE = 400; 

// II. C. Bénéfice pour le Climat (Ratio CO2 matière)
// Source: Ratio ~3,25 kg CO2e par kg de meuble (Production + Fin de vie évitée)
export const CO2_KG_PER_KG_FURNITURE = 3.25; 

// II. A. Bénéfice pour le Citoyen (Gain de pouvoir d'achat)
// Contexte : Auto-réparation (DIY).
// On déduit du prix neuf le coût moyen des matériaux nécessaires (peinture, quincaillerie)
// Estimé à ~20€ pour une petite rénovation.
export const REPAIR_COST_ESTIMATE = 20; 

// --- DONNÉES DE RÉFÉRENCE (Estimations Poids & Prix Neuf) ---

export const furnitureData: { [key: string]: FurnitureInfo } = {
  'wooden chair': {
    weight_kg: 7,      // Chaise standard
    new_price: 80,     // Prix moyen constatée
  },
  'wooden table': {
    weight_kg: 35,     // Table repas
    new_price: 350,
  },
  'wooden cabinet': {
    weight_kg: 50,     // Armoire/Commode
    new_price: 250,    
  },
  'wooden bookshelf': {
    weight_kg: 40,
    new_price: 150,
  },
  'metal chair': {
    weight_kg: 5,
    new_price: 90,
  },
  'metal cabinet': {
    weight_kg: 45,
    new_price: 300,
  },
  'plastic chair': {
    weight_kg: 4,
    new_price: 40,
  },
  'sofa': {
    weight_kg: 60,
    new_price: 600,
  },
  'armchair': {
    weight_kg: 25,
    new_price: 250,
  },
  'bed frame': {
    weight_kg: 40,
    new_price: 200,
  }
};

// Liste des clés valides pour aider l'IA à choisir la bonne catégorie de calcul
export const VALID_FURNITURE_KEYS = Object.keys(furnitureData);
