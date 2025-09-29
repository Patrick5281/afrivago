export const getSupabaseErrorMessage = (
  method: string,
  errorCode: string
): string => {
  const errorMessages: Record<string, Record<string, string>> = {
    createUserWithEmailAndPassword: {
      "auth/email-already-in-use": "Cet email est déjà utilisé.",
      "auth/invalid-email": "L'adresse e-mail est mal formatée.",
      "auth/operation-not-allowed": "L'opération n'est pas autorisée.",
      "auth/weak-password": "Le mot de passe est trop faible.",
      "23505": "Cet email est déjà utilisé.", // Code spécifique Supabase pour email déjà utilisé
    },
    signInWithEmailAndPassword: {
      "auth/invalid-email": "L'adresse e-mail est mal formatée.",
      "auth/user-disabled": "Cet utilisateur a été désactivé.",
      "auth/user-not-found": "Email ou mot de passe invalide.",
      "auth/wrong-password": "Email ou mot de passe invalide.",
      "auth/invalid-login-credentials": "Email ou mot de passe invalide.",
    },
    signOut: {
      "auth/invalid-user-token": "Session expirée. Veuillez vous reconnecter.",
    },
    sendPasswordResetEmail: {
      "auth/invalid-email": "L'adresse e-mail est mal formatée.",
      "auth/user-not-found": "Aucun utilisateur trouvé avec cet email.",
    },
    sendEmailVerification: {
      "auth/invalid-email": "L'adresse e-mail est mal formatée.",
    }
  };
  
  return errorMessages[method]?.[errorCode] || `Erreur: ${errorCode}`;
}