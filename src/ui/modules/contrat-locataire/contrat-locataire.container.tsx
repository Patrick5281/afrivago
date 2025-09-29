import { useEffect, useState } from "react";
import { ContratLocatifView } from "./contrat-locataire.view";
import { useAuth } from "@/Context/AuthUserContext";
 
export const ContratLocatifContainer = () => {
  const { authUser, authUserIsLoading } = useAuth();
  const [contrats, setContrats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authUser || authUserIsLoading) return;
    const fetchContrats = async () => {
      if (!authUser) return;
      setLoading(true);
      const res = await fetch("/api/contrat/locatifs/me", {
        headers: {
          "user-id": authUser.id,
        },
      });
      const data = await res.json();
      setContrats(data.contrats || []);
      setLoading(false);
    };
    fetchContrats();
  }, [authUser, authUserIsLoading]);

  const handleGeneratePdf = async (contratId: string) => {
    if (!authUser) return;
    setLoading(true);
    await fetch(`/api/contrat/generate/${contratId}`, { method: "POST" });
    // Rafraîchir la liste pour récupérer le pdf_url
    const res = await fetch("/api/contrat/locatifs/me", {
      headers: {
        "user-id": authUser.id,
      },
    });
    const data = await res.json();
    setContrats(data.contrats || []);
    setLoading(false);
  };

  return (
    <ContratLocatifView
      contrats={contrats}
      loading={loading}
      onGeneratePdf={handleGeneratePdf}
    />
  );
}; 