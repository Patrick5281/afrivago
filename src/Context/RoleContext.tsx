import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Role } from '@/types/roles';

// Interface pour le contexte des rôles
interface RoleContextType {
  activeRole: Role | null;
  actifProfil: Role | null; // Alias pour faciliter l'accès
  setActiveRole: (role: Role | null) => void;
  userRoles: Role[];
  setUserRoles: (roles: Role[]) => void;
  clearRoleContext: () => void;
  isRoleReady: boolean;
  setIsRoleReady: (ready: boolean) => void;
}

// Création du contexte avec valeurs par défaut
const RoleContext = createContext<RoleContextType>({
  activeRole: null,
  actifProfil: null,
  setActiveRole: () => {},
  userRoles: [],
  setUserRoles: () => {},
  clearRoleContext: () => {},
  isRoleReady: false,
  setIsRoleReady: () => {},
});

// Hook personnalisé pour faciliter l'utilisation du contexte
export const useRoleContext = () => useContext(RoleContext);

// Props pour le provider
interface RoleProviderProps {
  children: ReactNode;
}

// Provider du contexte
export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [isRoleReady, setIsRoleReady] = useState(false);

  // 1. Restauration du rôle actif et de isRoleReady au chargement
  React.useEffect(() => {
    const storedRole = localStorage.getItem("activeRole");
    const storedIsRoleReady = localStorage.getItem("isRoleReady");
    if (storedRole) setActiveRole(JSON.parse(storedRole));
    if (storedIsRoleReady === "true") setIsRoleReady(true);
  }, []);

  // 2. Sauvegarde du rôle actif et de isRoleReady à chaque changement
  React.useEffect(() => {
    if (activeRole) {
      localStorage.setItem("activeRole", JSON.stringify(activeRole));
      localStorage.setItem("isRoleReady", "true");
    } else {
      localStorage.removeItem("activeRole");
      localStorage.setItem("isRoleReady", "false");
    }
  }, [activeRole, isRoleReady]);

  // Fonction pour réinitialiser le contexte (à la déconnexion)
  const clearRoleContext = () => {
    setActiveRole(null);
    setUserRoles([]);
    setIsRoleReady(false);
    localStorage.removeItem("activeRole");
    localStorage.removeItem("isRoleReady");
  };

  React.useEffect(() => {
    console.log("[RoleContext] Nouvelle valeur de activeRole :", activeRole);
    console.log("[RoleContext] isRoleReady:", isRoleReady);
  }, [activeRole, isRoleReady]);

  // Valeur du contexte
  const value = {
    activeRole,
    actifProfil: activeRole, // Alias pour accéder facilement au rôle actif
    setActiveRole,
    userRoles,
    setUserRoles,
    clearRoleContext,
    isRoleReady,
    setIsRoleReady,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};