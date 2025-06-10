import { cookies } from 'next/headers';

// Fonction pour obtenir les cookies de manière sécurisée
export async function getCookies() {
  return cookies();
}

// Fonction pour définir un cookie
export async function setCookie(name: string, value: string, options: any = {}) {
  const cookieStore = await getCookies();
  cookieStore.set(name, value, options);
}

// Fonction pour obtenir un cookie
export async function getCookie(name: string) {
  const cookieStore = await getCookies();
  return cookieStore.get(name);
}

// Fonction pour supprimer un cookie
export async function deleteCookie(name: string) {
  const cookieStore = await getCookies();
  cookieStore.delete(name);
} 