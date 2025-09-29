import { useEffect, useState } from "react";
import { AccueilView } from "./Accueil.view";

export const AccueilContainer = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[AccueilContainer] Début du chargement des données...');
    setLoading(true);
    setError(null);
    
    fetch("/api/dashboard/loyers-caution")
      .then((res) => {
        console.log('[AccueilContainer] Réponse API reçue, status:', res.status);
        if (!res.ok) {
          throw new Error(`Erreur HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        console.log('[AccueilContainer] Données reçues de l\'API:', json);
        console.log('[AccueilContainer] Structure des données:');
        console.log('- logements:', json.logements);
        console.log('- prochainsLoyers:', json.prochainsLoyers);
        console.log('- loyersRecents:', json.loyersRecents);
        
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[AccueilContainer] Erreur lors du chargement:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    console.log('[AccueilContainer] Affichage du loader...');
    return <div className="p-8 text-center text-gray-400">Chargement du tableau de bord...</div>;
  }

  if (error) {
    console.log('[AccueilContainer] Affichage de l\'erreur:', error);
    return <div className="p-8 text-center text-red-400">Erreur: {error}</div>;
  }

  if (!data) {
    console.log('[AccueilContainer] Aucune donnée disponible');
    return <div className="p-8 text-center text-gray-400">Aucune donnée disponible</div>;
  }

  console.log('[AccueilContainer] Rendu de AccueilView avec les données:', data);
  return <AccueilView {...data} />;
}; 