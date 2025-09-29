import React from "react";
import { useRouter } from "next/router";
import { Button } from "@/ui/design-system/button/button";
import { Typography } from "@/ui/design-system/typography/typography";

interface WaitingPageViewProps {
  demande: {
    nom_complet: string;
    telephone: string;
    adresse: string;
    message?: string;
    created_at: string;
    statut: string;
    motif_refus?: string;
    updated_at: string;
  } | null;
  isLoading: boolean;
}

export const WaitingPageView: React.FC<WaitingPageViewProps> = ({ demande, isLoading }) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!demande) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Typography variant="body-base" className="text-2xl font-bold text-gray-800 mb-4">Aucune demande trouvée</Typography>
          <button
            onClick={() => router.push("/owner-page")}
            className="btn btn-primary"
          >
            Faire une demande
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (statut: string) => {
    switch (statut.toLowerCase()) {
      case "en cours":
        return "bg-yellow-100 text-yellow-800";
      case "validé":
        return "bg-green-100 text-green-800";
      case "refusée":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Statut de votre demande</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(demande.statut)}`}>
              {demande.statut}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">Informations personnelles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nom complet</p>
                  <p className="font-medium">{demande.nom_complet}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="font-medium">{demande.telephone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Adresse</p>
                  <p className="font-medium">{demande.adresse}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date de soumission</p>
                  <p className="font-medium">
                    {new Date(demande.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            </div>

            {demande.message && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">Message</h2>
                <p className="text-gray-600">{demande.message}</p>
              </div>
            )}

            {demande.motif_refus && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <h2 className="text-lg font-medium text-red-900 mb-2">Motif du refus</h2>
                <p className="text-red-700">{demande.motif_refus}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-4">
              {demande.statut === "refusée" && (
                <Button
                  action={() => router.push("/owner-page")}
                >
                  Faire une nouvelle demande
                </Button>
              )}
              <button
                onClick={() => router.push("/mon-espace")}
                className="btn btn-secondary"
              >
                Retour à mon espace
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

