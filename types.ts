
export enum AppState {
  LANDING,
  LOADING,
  RESULTS,
  ERROR,
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
