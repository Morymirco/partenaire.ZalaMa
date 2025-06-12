export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  partenaireId: string;
  role: 'admin' | 'rh' | 'user';
  createdAt: Date;
  lastLogin: Date;
} 