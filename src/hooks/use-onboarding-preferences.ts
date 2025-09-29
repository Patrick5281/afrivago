import { useState } from 'react';
import { useAuth } from '@/Context/AuthUserContext';

export interface OnboardingPreferences {
  statut?: string;
  zone?: string;
  type_logement?: string;
  budget_min?: number;
  budget_max?: number;
}

export interface UseOnboardingPreferencesReturn {
  loading: boolean;
  error: string | null;
  saveOnboardingPreferences: () => Promise<boolean>;
}

export function useOnboardingPreferences(): UseOnboardingPreferencesReturn {
  const { authUser, setAuthUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveOnboardingPreferences = async (): Promise<boolean> => {
    if (!authUser?.id || !authUser?.userDocument) {
      setError('Utilisateur non connecté');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const preferences: OnboardingPreferences = {
        statut: authUser.userDocument.statut,
        zone: authUser.userDocument.zone,
        type_logement: authUser.userDocument.type_logement,
        budget_min: authUser.userDocument.budget_min,
        budget_max: authUser.userDocument.budget_max
      };

      // Sauvegarder les préférences
      const response = await fetch('/api/onboarding/save-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: authUser.id, 
          preferences 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde des préférences');
      }

      // Rafraîchir le userDocument depuis la base de données
      const userResponse = await fetch('/api/me');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.user) {
          setAuthUser(userData.user);
          localStorage.setItem('user', JSON.stringify(userData.user));
        }
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur saveOnboardingPreferences:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    saveOnboardingPreferences,
  };
} 