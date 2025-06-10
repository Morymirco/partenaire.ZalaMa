import * as admin from 'firebase-admin';

// Vérifier si Firebase Admin est déjà initialisé
const apps = admin.apps;

// Configuration Firebase Admin avec les variables d'environnement
const firebaseAdminConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
    : undefined,
};

// Initialiser Firebase Admin si ce n'est pas déjà fait
if (!apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseAdminConfig as admin.ServiceAccount),
      databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
    console.log('Firebase Admin initialisé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de Firebase Admin:', error);
  }
}

// Exporter les services Firebase Admin
export const auth = admin.auth();
export const db = admin.firestore(); 