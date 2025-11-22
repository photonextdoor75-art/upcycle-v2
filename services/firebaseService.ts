
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AnalysisResult } from '../types';

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
// Si cela échoue (ex: bloqueur de pub, erreur réseau), l'app continuera de fonctionner sans la BDD.
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
export async function saveAnalysisToFirebase(file: File, result: AnalysisResult): Promise<void> {
  // Si Firebase n'a pas pu s'initialiser, on arrête tout de suite sans planter
  if (!db || !storage) {
    console.warn("Firebase not initialized, skipping save.");
    return;
  }

  try {
    // 1. Upload de l'image
    const timestamp = Date.now();
    // Nettoyage du nom de fichier pour éviter les caractères spéciaux
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
      // Impact Metrics
      co2Saved: result.impact.co2Saved,
      communityCostAvoided: result.impact.communityCostAvoided,
      valueCreated: result.impact.valueCreated,
      // Image Info
      imageUrl: downloadURL,
      originalFileName: file.name,
      imageSize: file.size,
      imageType: file.type
    };

    // 3. Sauvegarde dans Firestore
    await addDoc(collection(db, "analyses"), statsData);
    console.log("Analysis data saved to Firebase successfully!");

  } catch (error) {
    console.error("Error saving to Firebase:", error);
    // On ne lance pas d'erreur bloquante ici pour ne pas empêcher l'utilisateur de voir ses résultats
  }
}
