
import { GoogleGenAI, Type, Modality } from '@google/genai';
import { AnalysisResult, ImpactData } from '../types';
import { 
  furnitureData, 
  WASTE_MANAGEMENT_COST_PER_TONNE, 
  CO2_KG_PER_KG_FURNITURE, 
  REPAIR_COST_ESTIMATE 
} from './data';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const furnitureTypes = Object.keys(furnitureData);
const materials = ['wood', 'metal', 'particle board', 'plastic', 'fabric', 'leather'];

/**
 * CALCULE L'IMPACT SELON LE MANIFESTE "LE CYCLE"
 */
function calculateImpact(type: string, material: string): ImpactData {
  // 1. Récupération des données de référence (Poids & Prix Neuf)
  // On essaie de trouver une correspondance précise, sinon on prend une valeur par défaut
  let key = `${material} ${type}`.toLowerCase();
  // Si la clé exacte n'existe pas (ex: "fabric wooden chair"), on cherche juste le type (ex: "wooden chair" ou juste "chair")
  let data = furnitureData[key];
  
  if (!data) {
      // Fallback: Recherche partielle ou par défaut
      const fallbackKey = Object.keys(furnitureData).find(k => k.includes(type)) || 'wooden chair';
      data = furnitureData[fallbackKey];
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
  
  const textPart = {
      text: `Analyze this image of a piece of furniture. Identify the main furniture type and its primary material.
      
      Valid furniture types (closest match): ${furnitureTypes.map(t => t.split(' ')[1] || t).join(', ')}
      Valid materials: ${materials.join(', ')}
      
      Respond ONLY with a JSON object matching the specified schema. If you cannot determine the type or material, use "unknown".`
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
                      furnitureType: { type: Type.STRING, description: "The type of furniture (e.g. chair, table, cabinet)." },
                      furnitureMaterial: { type: Type.STRING, enum: materials, description: "The primary material." },
                  },
                  required: ['furnitureType', 'furnitureMaterial']
              },
          },
      });

      let jsonResponseText = response.text.trim();
      
      const firstBrace = jsonResponseText.indexOf('{');
      const lastBrace = jsonResponseText.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1) {
          jsonResponseText = jsonResponseText.substring(firstBrace, lastBrace + 1);
      }

      const result = JSON.parse(jsonResponseText);
      
      const { furnitureType, furnitureMaterial } = result;

      if (furnitureType === 'unknown' || furnitureMaterial === 'unknown') {
        throw new Error('Could not identify furniture type or material.');
      }

      const impact = calculateImpact(furnitureType, furnitureMaterial);

      return {
        furnitureType,
        furnitureMaterial,
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

    throw new Error('No image was generated by the API.');
}
