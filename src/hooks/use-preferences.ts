import { useState, useEffect, useCallback, useRef } from 'react';
import { Preference, UserPreference } from '@/api/preferences';

export interface PreferencesByCategory {
  status: Preference[];
  zone: Preference[];
  property_type: Preference[];
  budget: Preference[];
}

export interface UsePreferencesReturn {
  // État des données
  preferences: PreferencesByCategory | null;
  userPreferences: UserPreference[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchPreferences: () => Promise<void>;
  fetchUserPreferences: (userId: string) => Promise<void>;
  saveUserPreferences: (userId: string, preferenceIds: string[]) => Promise<boolean>;
  updateUserPreferences: (userId: string, preferenceIds: string[]) => Promise<boolean>;
  deleteUserPreferences: (userId: string) => Promise<boolean>;
  
  // Utilitaires
  getPreferencesByCategory: (category: keyof PreferencesByCategory) => Preference[];
  getUserPreferencesByCategory: (category: string) => UserPreference[];
}

export function usePreferences(): UsePreferencesReturn {
  const [preferences, setPreferences] = useState<PreferencesByCategory | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreference[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  // Récupérer toutes les préférences disponibles
  const fetchPreferences = useCallback(async (): Promise<void> => {
    // Éviter les appels multiples
    if (fetchingRef.current || loading || preferences) {
      return;
    }
    
    fetchingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/preferences');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la récupération des préférences');
      }
      
      setPreferences(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur fetchPreferences:', err);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [loading, preferences]);

  // Récupérer les préférences d'un utilisateur
  const fetchUserPreferences = useCallback(async (userId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/user-preferences?userId=${userId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la récupération des préférences utilisateur');
      }
      
      setUserPreferences(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur fetchUserPreferences:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sauvegarder les préférences d'un utilisateur
  const saveUserPreferences = useCallback(async (userId: string, preferenceIds: string[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/user-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, preferenceIds }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde des préférences');
      }
      
      // Recharger les préférences utilisateur après sauvegarde
      await fetchUserPreferences(userId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur saveUserPreferences:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchUserPreferences]);

  // Mettre à jour les préférences d'un utilisateur
  const updateUserPreferences = useCallback(async (userId: string, preferenceIds: string[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/user-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, preferenceIds }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour des préférences');
      }
      
      // Recharger les préférences utilisateur après mise à jour
      await fetchUserPreferences(userId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur updateUserPreferences:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchUserPreferences]);

  // Supprimer les préférences d'un utilisateur
  const deleteUserPreferences = useCallback(async (userId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/user-preferences?userId=${userId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression des préférences');
      }
      
      setUserPreferences([]);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur deleteUserPreferences:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Utilitaires
  const getPreferencesByCategory = useCallback((category: keyof PreferencesByCategory): Preference[] => {
    return preferences?.[category] || [];
  }, [preferences]);

  const getUserPreferencesByCategory = useCallback((category: string): UserPreference[] => {
    return userPreferences.filter(pref => pref.category === category);
  }, [userPreferences]);

  // Déclenche automatiquement le fetch au montage ou si preferences redevient null
  useEffect(() => {
    if (!preferences && !loading) {
      fetchPreferences();
    }
    // eslint-disable-next-line
  }, [preferences, loading]);

  return {
    // État
    preferences,
    userPreferences,
    loading,
    error,
    
    // Actions
    fetchPreferences,
    fetchUserPreferences,
    saveUserPreferences,
    updateUserPreferences,
    deleteUserPreferences,
    
    // Utilitaires
    getPreferencesByCategory,
    getUserPreferencesByCategory,
  };
} 