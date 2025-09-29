'use client';

console.log("[AuthUserContext] Chargé côté client !");

import { createContext, useContext, useState, useEffect, useRef } from "react";

// Types enrichis
export interface UserDocument {
  uid: string;
  email: string | null;
  creation_date: string;
  onboardingiscompleted: boolean;
  name: string;
  surname: string;
  photourl: string | null;
  // Préférences utilisateur (optionnelles)
  statut?: string;
  zone?: string;
  type_logement?: string;
  budget_min?: number;
  budget_max?: number;
}

export interface User {
  id: string;
  email: string;
  creation_date: string;
  lastActive?: number;
  userDocument?: UserDocument;
}

const authUserContext = createContext({
  authUser: null as User | null,
  authUserIsLoading: true,
  setAuthUser: (_user: User | null) => {},
  signOut: () => {},
  abortController: null as AbortController | null,
});

interface Props {
    children: React.ReactNode;
}

export function AuthUserProvider({ children }: Props) {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authUserIsLoading, setAuthUserIsLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Créer un nouveau AbortController pour cette session
    abortControllerRef.current = new AbortController();
    
    // Appel à l'API pour récupérer l'utilisateur courant
    fetch('/api/me', { 
      signal: abortControllerRef.current.signal 
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) setAuthUser(data.user);
        else setAuthUser(null);
        setAuthUserIsLoading(false);
      })
      .catch((error) => {
        // Ignorer les erreurs d'annulation
        if (error.name !== 'AbortError') {
          console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        }
      setAuthUser(null);
    setAuthUserIsLoading(false);
      });
  }, []);
   
  const signOut = () => {
    // Annuler toutes les requêtes en cours
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Créer un nouveau controller pour les futures requêtes
    abortControllerRef.current = new AbortController();
    
    // Appelle une route API pour supprimer le cookie auth_token
    fetch('/api/auth/logout', { 
      method: 'POST',
      signal: abortControllerRef.current.signal 
    })
    .then(() => {
      setAuthUser(null);
    })
    .catch((error) => {
      // Ignorer les erreurs d'annulation
      if (error.name !== 'AbortError') {
        console.error('Erreur lors de la déconnexion:', error);
      }
    setAuthUser(null);
    });
  };
   
    return (
        <authUserContext.Provider
            value={{
        authUser,
        authUserIsLoading,
        setAuthUser,
        signOut,
        abortController: abortControllerRef.current,
            }}
        >
            {children}
        </authUserContext.Provider>
    );
}

export const useAuth = () => useContext(authUserContext);