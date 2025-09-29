import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { WaitingPageView } from "./Waiting_page.view";
import { useAuth } from "@/Context/AuthUserContext";

interface DemandeOwner {
  id: string;
  nom_complet: string;
  telephone: string;
  adresse: string;
  message?: string;
  created_at: string;
  statut: string;
  motif_refus?: string;
  updated_at: string;
}

export const WaitingPageContainer: React.FC = () => {
  const router = useRouter();
  const { authUser } = useAuth();
  const [demande, setDemande] = useState<DemandeOwner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fonction pour charger le statut
  const fetchDemande = async () => {
    if (!authUser?.id) {
      router.push("/connexion");
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetch(`/api/owner/status?user_id=${authUser.id}`);
      if (!response.ok) throw new Error('Aucune demande trouvée');
      const data = await response.json();
      console.log('[WaitingPage] Statut reçu:', data.statut, 'Données complètes:', data);
      setDemande(data);
    } catch (error) {
      setDemande(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDemande();
    const interval = setInterval(fetchDemande, 5000); // toutes les 5 secondes
    return () => clearInterval(interval);
  }, [authUser?.id]);

  return <WaitingPageView demande={demande} isLoading={isLoading} />;
};
