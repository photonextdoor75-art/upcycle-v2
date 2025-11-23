
export enum AppState {
  LANDING,
  LOADING,
  RESULTS,
  ERROR,
  DASHBOARD,
  TEST_MAP // Nouvel état pour tester la carte isolément
}

export interface FurnitureInfo {
  weight_kg: number;
  new_price: number; // Prix d'un équivalent neuf
}

export interface ImpactData {
  co2Saved: number;          // En kg (Physique)
  communityCostAvoided: number; // En € (Bénéfice Ville)
  valueCreated: number;      // En € (Bénéfice Citoyen)
}

export interface AnalysisResult {
  furnitureType: string;
  furnitureMaterial: string;
  impact: ImpactData;
}

// Interface pour les données récupérées de Firebase
export interface StoredAnalysis {
  id: string;
  furnitureType: string;
  furnitureMaterial: string;
  co2Saved: number;
  communityCostAvoided: number;
  valueCreated: number;
  imageUrl: string;
  location: string;
  timestamp: any;
}
