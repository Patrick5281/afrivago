import { Seo } from "@/ui/components/seo/seo";
import { useState, useEffect } from "react";
import { useRoleContext } from "@/Context/RoleContext";
import { DashboardLayout } from "@/ui/components/layout/dashboard-layout/DashboardLayout";

// Importation des composants dynamiques (exemple, à adapter selon ton arborescence)
import { ProfileContainer } from "@/ui/modules/user-profile/profile/profile.container";
import { MesPreferencesContainer } from "@/ui/modules/mes-preferences/mes-preferences.container";
import { MesReservationsContainer } from "@/ui/modules/mes-reservations/mes-reservations.container";
import { DashboardContainer } from "@/ui/modules/dashboard/Dashboard.container";
import { AccueilContainer } from "@/ui/modules/accueil/Accueil.container";
import { MesBiensContainer } from "@/ui/modules/mes-biens/MesBiens.container";
import { SupportAdminContainer } from "@/ui/modules/support-admin/SupportAdmin.container";
import { AddPropertyPage } from "@/ui/modules/add-property-onboarding/AddPropertyPage";
import { ContratLocatifContainer } from "@/ui/modules/contrat-locataire/contrat-locataire.container";
import { PaiementContainer } from "@/ui/modules/paiement/paiement.container";
import { MesLocatairesContainer } from "@/ui/modules/mes-locataires/mes-locataires.container";
import { LoyersCautionContainer } from "@/ui/modules/loyers-caution/loyers-caution.container";
import FavorisContainer from "@/ui/modules/favoris/favoris.container";
import AideAssistance from "@/ui/modules/aide.tsx/aide-assistance";
import { NotificationContainer } from "@/ui/modules/notifiactions/notification.container";
import { Session } from "@/ui/components/session/session";
// ... autres imports de composants nécessaires

// Définir le type pour la map des composants dynamiques
const COMPONENTS_MAP: Record<string, () => JSX.Element> = {
  // Propriétaire
  dashboard: () => <DashboardContainer />,
  "mes-biens": () => <MesBiensContainer />,
  reservations: () => <MesReservationsContainer />,
  "support-admin": () => <SupportAdminContainer />,
  "ajouter-bien": () => <AddPropertyPage />,
  paiements: () => <PaiementContainer />,
  "mes-locataires": () => <MesLocatairesContainer />,

  

  parametres: () => <ProfileContainer />,
  "aide": () => <AideAssistance />,
  // Locataire
  accueil: () => <AccueilContainer />,
  "mes-reservations": () => <MesReservationsContainer />,
  "caution-loyers": () => <LoyersCautionContainer />,
  contrats: () => <ContratLocatifContainer />, // ou autre composant
  calendrier: () => <div>Calendrier (à implémenter)</div>,
  notifications: () => <NotificationContainer />,
  favoris: () => <FavorisContainer />,
};

export default function MonEspace() {
  const { activeRole } = useRoleContext();
  const isProprietaire = activeRole?.nom.toLowerCase().includes("proprietaire");
  const isLocataire = activeRole?.nom.toLowerCase().includes("locataire");

  // Déterminer le lien par défaut selon le rôle
  const defaultSection = isProprietaire ? "dashboard" : isLocataire ? "accueil" : "profil";
  const [activeSection, setActiveSection] = useState(defaultSection);

  // Mettre à jour le lien par défaut si le rôle change
  useEffect(() => {
    setActiveSection(defaultSection);
  }, [defaultSection]);

  const renderSection = () => {
    const Component = COMPONENTS_MAP[activeSection];
    return Component ? Component() : <ProfileContainer />;
  };

    return (
      <Session sessionStatus="registered">
        <DashboardLayout
      role={activeRole?.nom || ""}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
            <Seo title="Mon espace" description="description de la page..." />
      {/* Ici tu peux ajouter un composant de navigation latérale custom si besoin, ou passer setActiveSection à la Sidebar */}
        {renderSection()}
    </DashboardLayout>
      </Session>
    
    );
}
