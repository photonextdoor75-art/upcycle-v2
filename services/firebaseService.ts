
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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

// Variables pour stocker les instances, initialisées à null
let db: any = null;
let storage: any = null;

// Initialisation sécurisée de Firebase
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log("Firebase initialized for project:", firebaseConfig.projectId);
} catch (error) {
  console.warn("Firebase initialization failed. Saving disabled.", error);
}

/**
 * Sauvegarde l'image dans Storage et les données d'analyse dans Firestore.
 */
export async function saveAnalysisToFirebase(file: File, result: AnalysisResult, location?: string | null): Promise<void> {
  if (!db || !storage) {
    console.warn("Firebase not initialized, skipping save.");
    return;
  }

  try {
    // 1. Upload de l'image
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const filename = `furniture_${timestamp}_${cleanFileName}`;
    const storageRef = ref(storage, `uploads/${filename}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // 2. Préparation des données statistiques
    const statsData = {
      timestamp: serverTimestamp(),
      furnitureType: result.furnitureType,
      furnitureMaterial: result.furnitureMaterial,
      co2Saved: result.impact.co2Saved,
      communityCostAvoided: result.impact.communityCostAvoided,
      valueCreated: result.impact.valueCreated,
      imageUrl: downloadURL,
      originalFileName: file.name,
      imageSize: file.size,
      imageType: file.type,
      location: location || "Non renseigné"
    };

    // 3. Sauvegarde dans Firestore
    await addDoc(collection(db, "analyses"), statsData);
    console.log("Analysis data saved to Firebase successfully!");

  } catch (error) {
    console.error("Error saving to Firebase:", error);
  }
}

/**
 * Récupère toutes les analyses pour le tableau de bord.
 * Note: Dans une app en prod avec des milliers d'entrées, on utiliserait des agrégations côté serveur.
 */
export async function fetchAllAnalyses(): Promise<StoredAnalysis[]> {
  if (!db) return [];

  try {
    const analysesRef = collection(db, "analyses");
    // On récupère les 100 dernières pour ne pas exploser le quota en démo
    const q = query(analysesRef, orderBy("timestamp", "desc"), limit(100));
    const querySnapshot = await getDocs(q);
    
    const analyses: StoredAnalysis[] = [];
    querySnapshot.forEach((doc) => {
      analyses.push({ id: doc.id, ...doc.data() } as StoredAnalysis);
    });
    
    return analyses;
  } catch (error) {
    console.error("Error fetching analyses:", error);
    return [];
  }
}
