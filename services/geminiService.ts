
import { GoogleGenAI, Type, Modality } from '@google/genai';
import { AnalysisResult, ImpactData } from '../types';
import { 
  furnitureData, 
  VALID_FURNITURE_KEYS,
  WASTE_MANAGEMENT_COST_PER_TONNE, 
  CO2_KG_PER_KG_FURNITURE, 
  REPAIR_COST_ESTIMATE 
} from './data';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const materials = ['Bois', 'Métal', 'Panneau de particules', 'Plastique', 'Tissu', 'Cuir', 'Verre', 'Rotin'];

/**
 * CALCULE L'IMPACT SELON LE MANIFESTE "LE CYCLE"
 * @param categoryKey La clé technique (ex: 'wooden chair') pour récupérer poids/prix
 */
function calculateImpact(categoryKey: string): ImpactData {
  // Récupération des données de référence (Poids & Prix Neuf)
  // On essaie de trouver une correspondance précise, sinon on prend une valeur par défaut
  let data = furnitureData[categoryKey];
  
  if (!data) {
      // Fallback: Si l'IA invente une clé, on se rabat sur une chaise en bois par sécurité
      console.warn(`Clé de catégorie inconnue: ${categoryKey}, utilisation du fallback.`);
      data = furnitureData['wooden chair'];
  }

  const { weight_kg, new_price } = data;

  // 2. APPLICATION DES FORMULES DU PDF

  // A. Bénéfice pour le Climat (CO2 Physique)
  // Formule PDF: Poids meuble (kg) * Ratio (3.25 kgCO2e/kg)
  const co2Saved = weight_kg * CO2_KG_PER_KG_FURNITURE;

  // B. Bénéfice pour la Ville de Paris (Économie Gestion Déchets)
  // Formule PDF: Poids (tonnes) * 400 €/tonne
  // Calcul: (weight_kg / 1000) * 400
  const communityCostAvoided = (weight_kg / 1000) * WASTE_MANAGEMENT_COST_PER_TONNE;

  // C. Bénéfice pour le Citoyen (Valeur Créée / Pouvoir d'achat)
  // Formule PDF: Prix meuble neuf - Coût réparation
  const valueCreated = new_price - REPAIR_COST_ESTIMATE;

  // On s'assure que la valeur créée n'est pas négative (si le meuble neuf est moins cher que la réparation)
  const finalValueCreated = Math.max(0, valueCreated);

  return { 
      co2Saved, 
      communityCostAvoided, 
      valueCreated: finalValueCreated 
  };
}

export async function analyzeFurnitureImage(base64Data: string): Promise<AnalysisResult> {
  if (!process.env.API_KEY) {
      console.error("API Key manquante dans process.env.API_KEY");
      throw new Error("La clé API n'est pas configurée.");
  }

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Data,
    },
  };
  
  // PROMPT EN FRANÇAIS
  const textPart = {
      text: `Tu es un expert ébéniste et brocanteur français. Analyse cette image de meuble.
      
      1. Identifie le "nom d'affichage" précis en FRANÇAIS (ex: "Commode Louis XV", "Fauteuil Crapaud", "Chaise Windsor", "Table de ferme"). Sois précis et flatteur.
      2. Identifie le matériau principal en FRANÇAIS (ex: "Chêne massif", "Pin", "Métal industriel").
      3. Pour les calculs écologiques, associe ce meuble à la catégorie technique la plus proche parmi cette liste stricte : ${VALID_FURNITURE_KEYS.join(', ')}.
      
      Réponds UNIQUEMENT avec un objet JSON respectant le schéma.`
  };

  try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [imagePart, textPart] },
          config: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      furnitureDisplayNameFR: { type: Type.STRING, description: "Le nom précis et valorisant du meuble en Français." },
                      furnitureMaterialFR: { type: Type.STRING, description: "Le matériau principal en Français." },
                      calculationCategoryKey: { type: Type.STRING, enum: VALID_FURNITURE_KEYS, description: "La catégorie technique pour le calcul du poids." },
                  },
                  required: ['furnitureDisplayNameFR', 'furnitureMaterialFR', 'calculationCategoryKey']
              },
          },
      });

      let jsonResponseText = response.text.trim();
      
      // Nettoyage basique si l'IA ajoute du markdown ```json ... ```
      const firstBrace = jsonResponseText.indexOf('{');
      const lastBrace = jsonResponseText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
          jsonResponseText = jsonResponseText.substring(firstBrace, lastBrace + 1);
      }

      const result = JSON.parse(jsonResponseText);
      
      const { furnitureDisplayNameFR, furnitureMaterialFR, calculationCategoryKey } = result;

      if (!furnitureDisplayNameFR || !calculationCategoryKey) {
        throw new Error('Impossible d\'identifier le type de meuble.');
      }

      // On utilise la clé technique (anglais) pour les maths, mais on renvoie le nom français pour l'affichage
      const impact = calculateImpact(calculationCategoryKey);

      return {
        furnitureType: furnitureDisplayNameFR,    // Affiche "Commode Louis XV"
        furnitureMaterial: furnitureMaterialFR,   // Affiche "Chêne massif"
        impact,
      };
  } catch (error) {
      console.error("Erreur lors de l'analyse Gemini:", error);
      throw error;
  }
}

export async function editImage(base64Data: string, mimeType: string, prompt: string): Promise<string> {
    if (!process.env.API_KEY) {
        throw new Error("La clé API n'est pas configurée.");
    }

    const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }

    throw new Error("Aucune image n'a été générée par l'API.");
}
