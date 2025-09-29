import { useAuth as useAuthContext } from '@/Context/AuthUserContext';

export const useAuth = () => {
  const auth = useAuthContext();

  const refreshUserDocument = async () => {
    try {
      const response = await fetch('/api/me');
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          auth.setAuthUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          return data.user;
        }
      }
      return null;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du userDocument:', error);
      return null;
    }
  };

  return {
    ...auth,
    refreshUserDocument,
  };
}; 