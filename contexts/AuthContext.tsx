"use client";

import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types pour notre contexte d'authentification
type UserRole = 'admin' | 'rh' | null;

interface AuthUser {
  uid: string;
  email: string | null;
  role: UserRole;
  displayName?: string | null;
  photoURL?: string | null;
  active?: boolean;
  partenaireId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isRH: boolean;
}

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

// Fonction de connexion
const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Obtenir le token ID pour créer le cookie de session
    const idToken = await user.getIdToken();
    
    // Créer le cookie de session via l'API
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });
    
    if (!response.ok) {
      throw new Error('Échec de la création de la session');
    }
    
    // Vérifier les claims personnalisés pour déterminer le rôle
    const idTokenResult = await user.getIdTokenResult();
    console.log(idTokenResult);
    const role = idTokenResult.claims.role;
    console.log(role);
    
    if (role === 'rh') {
      // Si c'est un RH, vérifier que son compte est actif dans Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        if (!userData.active) {
          // Si le compte est désactivé
          await signOut(auth);
          toast.error("Votre compte a été désactivé. Veuillez contacter l'administrateur.");
          return false;
        }
        
        // Mettre à jour la date de dernière connexion
        await updateDoc(doc(db, 'users', user.uid), {
          lastLogin: serverTimestamp()
        });
        
        toast.success("Connexion réussie");
        return true;
      } else {
        // Si les données utilisateur n'existent pas dans Firestore
        await signOut(auth);
        toast.error("Compte utilisateur incomplet. Veuillez contacter l'administrateur.");
        return false;
      }
    } else if (role === 'admin') {
      // Si c'est un admin, vérifier son statut dans Firestore
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      
      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        
        if (!adminData.active) {
          // Si le compte admin est désactivé
          await signOut(auth);
          toast.error("Votre compte administrateur a été désactivé.");
          return false;
        }
        
        // Mettre à jour la date de dernière connexion
        await updateDoc(doc(db, 'admins', user.uid), {
          lastLogin: serverTimestamp()
        });
        
        toast.success("Connexion administrateur réussie");
        return true;
      } else {
        // Si les données admin n'existent pas dans Firestore
        await signOut(auth);
        toast.error("Compte administrateur incomplet.");
        return false;
      }
    } else {
      // Si l'utilisateur n'a pas de rôle valide
      await signOut(auth);
      toast.error("Votre compte n'a pas les autorisations nécessaires.");
      return false;
    }
  } catch (error: any) {
    console.error("Erreur de connexion:", error);
    
    // Messages d'erreur personnalisés selon le code d'erreur
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      toast.error("Email ou mot de passe incorrect");
    } else if (error.code === 'auth/too-many-requests') {
      toast.error("Trop de tentatives de connexion. Veuillez réessayer plus tard.");
    } else if (error.code === 'auth/user-disabled') {
      toast.error("Ce compte a été désactivé.");
    } else {
      toast.error(error.message || "Échec de la connexion");
    }
    
    return false;
  }
};

// Fonction de déconnexion
const logout = async (): Promise<void> => {
  try {
    // Déconnexion de Firebase Auth
    await signOut(auth);
    
    // Supprimer le cookie de session via l'API
    await fetch('/api/auth/session', {
      method: 'DELETE',
    });
    
    toast.success("Déconnexion réussie");
  } catch (error: any) {
    console.error("Erreur lors de la déconnexion:", error);
    toast.error("Erreur lors de la déconnexion");
  }
};

// Composant Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Récupérer les claims personnalisés
          const idTokenResult = await firebaseUser.getIdTokenResult();
          const role = idTokenResult.claims.role as UserRole;
          
          // Récupérer les données supplémentaires selon le rôle
          let userData: any = {};
          
          if (role === 'admin') {
            const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
            if (adminDoc.exists()) {
              userData = adminDoc.data();
            }
          } else if (role === 'rh') {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              userData = userDoc.data();

            }
          }
          
          // Créer l'objet utilisateur avec les données combinées
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: role,
            displayName: firebaseUser.displayName || userData.displayName,
            photoURL: firebaseUser.photoURL || userData.photoURL,
            active: userData.active,
            partenaireId: userData.partenaireId
          });
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Nettoyer l'abonnement lors du démontage
    return () => unsubscribe();
  }, []);

  const isAdmin = user?.role === 'admin';
  const isRH = user?.role === 'rh';

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin,
    isRH
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 

