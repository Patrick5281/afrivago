import { Role } from '@/types/roles';
import { toast } from 'react-toastify';
import { NextRouter } from 'next/router';

/**
 * Récupère les rôles d'un utilisateur depuis l'API backend
 * @param userId ID de l'utilisateur connecté
 * @returns Un tableau contenant les rôles de l'utilisateur
 */
export const getUserRoles = async (userId: string): Promise<Role[]> => {
  try {
    const response = await fetch(`/api/auth/roles?userId=${userId}`);
    const result = await response.json();
    if (!response.ok) {
      toast.error(result.error || "Impossible de récupérer vos rôles. Veuillez réessayer.");
      return [];
    }
    return result.roles || [];
  } catch (error) {
    toast.error("Impossible de récupérer vos rôles. Veuillez réessayer.");
    return [];
  }
};

/**
 * Détermine le rôle actif de l'utilisateur
 * Si l'utilisateur n'a qu'un seul rôle, il est automatiquement sélectionné
 * Si l'utilisateur a plusieurs rôles, la fonction renvoie null et un modal sera affiché
 * @param roles Tableau des rôles de l'utilisateur
 * @returns Le rôle actif ou null si l'utilisateur doit choisir
 */
export const determineActiveRole = (roles: Role[]): Role | null => {
  console.log("Détermination du rôle actif parmi:", roles.length, "rôles");
  
  if (roles.length === 0) {
    console.log("Aucun rôle disponible");
    toast.error("Vous n'avez aucun rôle attribué. Contactez l'administrateur.");
    return null;
  }
  
  if (roles.length === 1) {
    console.log("Un seul rôle disponible, sélection automatique:", roles[0]);
    return roles[0];
  }
  
  console.log("Plusieurs rôles disponibles, l'utilisateur doit choisir");
  return null; // L'utilisateur devra choisir via le modal
};

/**
 * Utilitaire pour récupérer le rôle actif du contexte
 * @param setShowRoleSelector Fonction pour afficher/masquer le sélecteur de rôle
 * @param roles Tableau des rôles de l'utilisateur
 * @param setActiveRole Fonction pour définir le rôle actif dans le contexte
 * @returns Le rôle actif ou null si l'utilisateur doit choisir
 */
export const getActiveRole = (
  setShowRoleSelector: (show: boolean) => void,
  roles: Role[],
  setActiveRole: (role: Role | null) => void
): Role | null => {
  const activeRole = determineActiveRole(roles);
  
  if (!activeRole && roles.length > 1) {
    // Si l'utilisateur a plusieurs rôles, on affiche le sélecteur
    setShowRoleSelector(true);
    return null;
  }
  
  // Si l'utilisateur n'a qu'un seul rôle, on le définit comme actif
  if (activeRole) {
    setActiveRole(activeRole);
    toast.success(`Rôle sélectionné : ${activeRole.nom}`);
  }
  
  return activeRole;
};

/**
 * Gère l'ensemble du processus de détermination et sélection du rôle
 * @param userId ID de l'utilisateur connecté
 * @param router Router Next.js pour la redirection
 * @param setShowRoleSelector Fonction pour afficher/masquer le sélecteur de rôle
 * @param setUserRoles Fonction pour définir les rôles de l'utilisateur dans le contexte
 * @param setActiveRole Fonction pour définir le rôle actif dans le contexte
 */
export const handleUserRoleProcess = async (
  userId: string,
  router: NextRouter,
  setShowRoleSelector: (show: boolean) => void,
  setUserRoles: (roles: Role[]) => void,
  setActiveRole: (role: Role | null) => void
): Promise<void> => {
  console.log("Démarrage du processus de gestion des rôles pour l'utilisateur:", userId);
  
  try {
    // 1. Récupération des rôles de l'utilisateur
    const roles = await getUserRoles(userId);
    
    if (roles.length === 0) {
      toast.error("Vous n'avez aucun rôle attribué. Contactez l'administrateur.");
      return;
    }
    
    // 2. Stockage des rôles dans le contexte
    setUserRoles(roles);
    
    // 3. Détermination du rôle actif
    const activeRole = getActiveRole(setShowRoleSelector, roles, setActiveRole);
    
    // 4. Redirection si un rôle actif est défini automatiquement
    if (activeRole) {
      console.log("Redirection vers /mon-espace avec le rôle actif:", activeRole);
      router.push("/mon-espace");
    }
    // Si aucun rôle actif n'est défini (plusieurs rôles), le modal s'affiche
    // et la redirection sera gérée après la sélection du rôle
    
  } catch (error) {
    console.error("Erreur dans handleUserRoleProcess:", error);
    toast.error("Une erreur est survenue lors du traitement de vos rôles.");
  }
};

/**
 * Gère la sélection d'un rôle par l'utilisateur (depuis le modal)
 */
export const handleRoleSelection = (
  role: Role,
  setActiveRole: (role: Role) => void,
  setShowRoleSelector: (show: boolean) => void,
  router: NextRouter
): void => {
  console.log("Sélection du rôle:", role);
  setActiveRole(role);
  console.log("Rôle passé à setActiveRole :", role);
  setShowRoleSelector(false);
  toast.success(`Rôle sélectionné : ${role.nom}`);
  router.push("/mon-espace");
};