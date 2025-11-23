import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { AnalysisResult, StoredAnalysis } from '../types';

// Configuration du projet Firebase "upcycle-00001"
const firebaseConfig = {
  apiKey: "AIzaSyB5MiN90NCiQXPgsXLBcNTnGLZVP3SjN5Q",
  authDomain: "upcycle-00001.firebaseapp.com",
  projectId: "upcycle-00001",
  storageBucket: "upcycle-00001.firebasestorage.app",
  messagingSenderId: "506270647648",
  appId: "1:506270647648:web:1729d3f81880c620dc8a05",
  measurementId: "G-6MPYD4DC91"
};

// Instance Singleton
let dbInstance: any = null;

/**
 * Récupère l'instance de la base de données.
 * Tente de l'initialiser si ce n'est pas déjà fait.
 */
function getDB() {
  if (dbInstance) return dbInstance;

  try {
    console.log("🔄 Initialisation Firebase (Lazy)...");
    const app = initializeApp(firebaseConfig);
    dbInstance = getFirestore(app);
    console.log("✅ Firebase Connecté.");
    return dbInstance;
  } catch (error) {
    console.error("❌ Erreur critique d'initialisation Firebase :", error);
    return null;
  }
}

// Tenter une première initialisation au chargement du fichier
getDB();

/**
 * FONCTION DE TEST MANUEL
 */
export async function testConnection() {
    const db = getDB();
    if (!db) throw new Error("Impossible d'initialiser la base de données (Bloqueur de pub ? Réseau ?)");
    
    try {
        const docRef = await addDoc(collection(db, "debug_test"), {
            message: "Test de connexion réussi (Manuel)",
            timestamp: serverTimestamp(),
            userAgent: navigator.userAgent
        });
        return "Succès ! Document écrit avec l'ID : " + docRef.id;
    } catch (e: any) {
        console.error("Error adding document: ", e);
        throw new Error("Erreur d'écriture : " + e.message);
    }
}

/**
 * Sauvegarde uniquement les données d'analyse dans Firestore.
 * (Aucune image n'est stockée sur le serveur)
 */
export async function saveAnalysisToFirebase(file: File, result: AnalysisResult, location?: string | null): Promise<void> {
  const db = getDB();
  if (!db) {
    console.warn("Firebase inaccessible, sauvegarde annulée.");
    return;
  }

  try {
    // Préparation des données statistiques
    const statsData = {
      timestamp: serverTimestamp(),
      furnitureType: result.furnitureType,
      furnitureMaterial: result.furnitureMaterial,
      co2Saved: result.impact.co2Saved,
      communityCostAvoided: result.impact.communityCostAvoided,
      valueCreated: result.impact.valueCreated,
      imageUrl: "", 
      originalFileName: file.name,
      location: location || "Non renseigné"
    };

    // Sauvegarde dans Firestore
    await addDoc(collection(db, "analyses"), statsData);
    console.log("✅ Données statistiques sauvegardées.");

  } catch (error) {
    console.error("❌ Erreur sauvegarde Firebase:", error);
  }
}

/**
 * Récupère toutes les analyses pour le tableau de bord.
 */
export async function fetchAllAnalyses(): Promise<StoredAnalysis[]> {
  const db = getDB();
  if (!db) return [];

  try {
    const analysesRef = collection(db, "analyses");
    const q = query(analysesRef, orderBy("timestamp", "desc"), limit(100));
    const querySnapshot = await getDocs(q);
    
    const analyses: StoredAnalysis[] = [];
    querySnapshot.forEach((doc) => {
      analyses.push({ id: doc.id, ...doc.data() } as StoredAnalysis);
    });
    
    return analyses;
  } catch (error) {
    console.error("Erreur récupération analyses:", error);
    return [];
  }
}