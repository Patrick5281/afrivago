import { HeaderAccueil } from "@/ui/modules/accueil/components/HeaderAccueil";
import { ProchainLoyer } from "@/ui/modules/accueil/components/ProchainLoyer";
import { LogementsReserves } from "@/ui/modules/accueil/components/LogementsReserves";
import { LoyersRecents } from "@/ui/modules/accueil/components/LoyersRecents";
import { useAuth } from "@/Context/AuthUserContext";
import { ProfileContainer } from "../user-profile/profile/profile.container";

interface AccueilViewProps {
  logements: any[];
  prochainsLoyers: any[];
  loyersRecents?: any[];
}

export const AccueilView = ({ logements, prochainsLoyers, loyersRecents }: AccueilViewProps) => {
  const { authUser } = useAuth();
  const userDocument = authUser?.userDocument;

  console.log('[AccueilView] Rendu avec les props:');
  console.log('- logements:', logements);
  console.log('- prochainsLoyers:', prochainsLoyers);
  console.log('- loyersRecents:', loyersRecents);

  // Transformer les données pour correspondre aux interfaces attendues
  const logementsReserves = logements?.map(logement => ({
    id: logement.logementId,
    photo: logement.photo || 'https://via.placeholder.com/400x300?text=Photo',
    titre: logement.titre,
    adresse: logement.adresse,
    proprietaire: 'Propriétaire', // À récupérer depuis l'API
    statutBail: 'actif',
    type: logement.type,
    prix: logement.loyers?.[0]?.montant,
    ville: logement.adresse?.split(',')[0] || '',
    description: `Logement de ${logement.periodeDebut} à ${logement.periodeFin}`
  })) || [];

  const loyersRecentsFormatted = logements?.flatMap(logement => 
    logement.loyers?.filter((loyer: any) => loyer.statut === 'payé')
      .map((loyer: any) => ({
        mois: `Mois ${loyer.index}`,
        montant: loyer.montant,
        datePaiement: loyer.datePayee || 'N/A',
        statut: loyer.statut,
        pdfUrl: loyer.facturePdfUrl || '#'
      }))
  ) || [];

  console.log('[AccueilView] Données transformées:');
  console.log('- logementsReserves:', logementsReserves);
  console.log('- loyersRecentsFormatted:', loyersRecentsFormatted);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="">
        <ProfileContainer />
      </div>
      {/* Grille principale */}
      <div className="gap-8">
        {/* Bloc Prochain Loyer + Logements réservés */}
            <LogementsReserves logements={logementsReserves} />
      </div>
  </div>
); 
}; 