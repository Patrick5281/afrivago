import { Typography } from "@/ui/design-system/typography/typography";
import { Button } from "@/ui/design-system/button/button";
import { HiOutlineDownload } from "react-icons/hi";
import Lottie from "lottie-react";
import noDataAnimation from "public/assets/animation/No-Data.json";

type Contrat = {
  id: string;
  logement_nom: string;
  logement_adresse: string;
  date_arrivee: string;
  pdf_url?: string;
  logement_type?: string;
};

export const ContratLocatifView = ({
  contrats = [],
  loading = false,
  onGeneratePdf,
}: {
  contrats: Contrat[];
  loading: boolean;
  onGeneratePdf: (contratId: string) => void;
}) => {
  return (
    <section className="space-y-6 bg-gray-300">
      <Typography variant="h4">Contrats</Typography>
      
      {loading && <p>Chargement...</p>}

      {contrats.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="flex justify-center mb-4">
            <Lottie
              animationData={noDataAnimation}
              loop
              style={{ width: 220, height: 220 }}
            />
          </div>
          <Typography variant="lead">Aucun contrat trouvé.</Typography>
        </div>
      )}


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 bg-gray-300 px-6 py-6 gap-6">
        {contrats.map((contrat) => (
          <div
            key={contrat.id}
            className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between rounded min-h-[260px]"
          >
            {/* Header : badge + nom + statut (si besoin) */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary text-white font-bold text-lg">
                  {contrat.logement_nom?.[0]?.toUpperCase() || 'C'}
                </div>
                
              </div>
              {/* Statut ou date à droite si besoin */}
              <div className="flex flex-col items-end">
                <Typography variant="body-sm">
                  {contrat.date_arrivee}
                </Typography>
              </div>
            </div>

            {/* Section infos supplémentaires (exemple) */}
            <div className="my-4 border-t border-b border-gray-400 py-2">
               <div>
                  <Typography variant="body-base">
                    {contrat.logement_nom}
                  </Typography>
                  {contrat.logement_adresse && (
                    <Typography variant="body-base">
                      {contrat.logement_adresse}
                    </Typography>
                  )}
                </div>
              <div className="flex justify-between t">
                <Typography variant="body-base">Type :</Typography>
                <Typography variant="body-base">{contrat.logement_type === 'unit' ? 'Unité' : 'Logement'}</Typography>
              </div>
              {/* Ajoute ici d'autres infos si besoin */}
            </div>

            {/* Actions en bas */}
            <div className="flex justify-end">
              {contrat.pdf_url ? (
                <Button
                  variant="warning"
                  size="small"
                  baseUrl={contrat.pdf_url}
                  download={`contrat-${contrat.id}.pdf`}
                  icon={{ icon: HiOutlineDownload }}
                  iconPosition="left"
                  className="flex-1"
                >
                  Télécharger le PDF
                </Button>
              ) : (
                <button
                  onClick={() => onGeneratePdf(contrat.id)}
                  className="flex-1 bg-secondary-400 text-gray py-2 rounded-lg font-semibold hover:bg-secondary-600 transition"
                >
                  Générer le PDF
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}; 