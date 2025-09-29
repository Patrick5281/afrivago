import { useRouter } from "next/router";
import { useRoleContext } from "@/Context/RoleContext";
import { useAuth } from "@/Context/AuthUserContext";
import { supabaseLogOutUser } from "@/api/authentication";
import { toast } from "react-toastify";
import { UserAccountNavigation } from "./user-account-navigation";
import { Role } from "@/types/roles";
import { addUserRole } from "@/services/roleServices";
import { useState } from "react";

interface Props {
  onSectionChange?: (section: string) => void;
}

// Définition simplifiée des liens pour chaque rôle (sans sections)
export const SIDEBAR_LINKS = {
  proprietaire: [
    {
      section: "Navigation",
      links: [
        { key: "dashboard", label: "Dashboard" },
        { key: "mes-biens", label: "Mes Biens" },
        { key: "ajouter-bien", label: "Ajouter un Bien" },
        { key: "mes-locataires", label: "Mes Locataires" },
        { key: "paiements", label: "Paiements" },
        { key: "contrats", label: "Contrats" },
        { key: "profil", label: "Profil" },
        { key: "documents", label: "Documents" },
        { key: "parametres", label: "Paramètres" },
        { key: "support-admin", label: "Support" },
      ],
    },
  ],
  locataire: [
    {
      section: "Navigation",
      links: [
        { key: "dashboard", label: "Dashboard" },
        { key: "recherche", label: "Recherche" },
        { key: "mes-reservations", label: "Mes Réservations" },
        { key: "calendrier", label: "Calendrier" },
        { key: "paiements", label: "Paiements" },
        { key: "favoris", label: "Favoris" },
        { key: "notifications", label: "Notifications" },
        { key: "profil", label: "Profil" },
        { key: "parametres", label: "Paramètres" },
        { key: "aide-faq", label: "Aide" },
      ],
    },
  ],
};

export const UserAccountNavigationContainer = ({ onSectionChange }: Props) => {
  const { activeRole } = useRoleContext();
  const { authUser, logout } = useAuth();

  // Déterminer le rôle sous forme de string
  const roleKey = activeRole?.nom?.toLowerCase().includes("proprietaire")
    ? "proprietaire"
    : activeRole?.nom?.toLowerCase().includes("locataire")
    ? "locataire"
    : null;

  // Utiliser la bonne liste de liens selon le rôle
  const sidebarLinks = roleKey ? SIDEBAR_LINKS[roleKey] : [];

  const handleSwitchRole = async () => {
    // Logique de changement de rôle ici
    toast.info("Changement de rôle en cours...");
  };

  return (
    <UserAccountNavigation
      activeRole={activeRole}
      sidebarLinks={sidebarLinks}
      onLogout={logout}
      onSwitchRole={handleSwitchRole}
      onSectionChange={onSectionChange}
      switchButtonText={authUser?.role === "OWNER" ? "Mode Locataire" : "Mode Propriétaire"}
    />
  );
};