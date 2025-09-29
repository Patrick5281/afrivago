import { BaseComponentProps } from "@/types/onboarding-steps-List";
import { OnboardingFooter } from "../../components/footer/onboarding-footer";
import { Container } from "@/ui/components/container/container";
import { Typography } from "@/ui/design-system/typography/typography";
import { useState, useEffect } from "react";
import { usePropertyOnboardingStore } from "../../context/propertyOnboarding.store";
import { toast } from "react-toastify";

interface PropertyPricing {
  amount: number;
  commission_percentage: number;
  net_price: number;
  currency: string;
}

interface PropertyData {
  terms_accepted: boolean;
  terms_accepted_at: string | null;
}

export const PolicyAndConditionsStep = ({
  prev,
  next,
  isFirstStep,
  isFinalStep,
  stepsList,
  getCurrentStep,
}: BaseComponentProps) => {
  const { propertyId } = usePropertyOnboardingStore();
  const setPropertyId = usePropertyOnboardingStore(state => state.setPropertyId);
  const [loading, setLoading] = useState(false);
  const [savingTerms, setSavingTerms] = useState(false);
  const [pricing, setPricing] = useState<PropertyPricing | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);

  // Charger les données de la propriété (prix, commission et statut des conditions)
  useEffect(() => {
    const loadData = async () => {
      if (!propertyId) return;
      setLoading(true);
      try {
        // Statut d'acceptation
        const resStatus = await fetch(`/api/property/policy?propertyId=${propertyId}&type=status`);
        const propertyInfo = await resStatus.json();
        if (propertyInfo) {
          setPropertyData(propertyInfo);
          setAcceptedTerms(propertyInfo.terms_accepted || false);
        }
        // Prix
        const resPrice = await fetch(`/api/property/policy?propertyId=${propertyId}&type=pricing`);
        const priceData = await resPrice.json();
        const amount = priceData?.amount || 0;
        const currency = priceData?.currency || 'EUR';
        // Commission
        const resCommission = await fetch(`/api/property/policy?propertyId=${propertyId}&type=commission`);
        const commissionData = await resCommission.json();
        const commission = commissionData?.percentage || 0;
        const net = amount - (amount * commission / 100);
        setPricing({ amount, commission_percentage: commission, net_price: net, currency });
      } catch (error) {
        toast.error("Erreur lors du chargement des informations");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [propertyId]);

  useEffect(() => {
    if (!propertyId) {
      const storedId = localStorage.getItem('onboarding_property_id');
      if (storedId) {
        setPropertyId(storedId);
      }
    }
  }, [propertyId, setPropertyId]);

  const getCurrencySymbol = (currencyCode: string) => {
    const symbols: { [key: string]: string } = {
      'EUR': '€',
      'USD': '$',
      'GBP': '£',
      'XOF': 'CFA',
    };
    return symbols[currencyCode] || currencyCode;
  };

  // Fonction pour sauvegarder l'acceptation des conditions
  const handleTermsAcceptance = async (accepted: boolean) => {
    if (!propertyId) {
      toast.error("Aucune propriété sélectionnée");
      return;
    }
    setSavingTerms(true);
    try {
      await fetch('/api/property/policy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, accepted })
      });
      setPropertyData(prev => prev ? { ...prev, terms_accepted: accepted, terms_accepted_at: accepted ? new Date().toISOString() : null } : null);
      setAcceptedTerms(accepted);
      if (accepted) {
        toast.success("Conditions acceptées et sauvegardées");
      } else {
        toast.info("Acceptation des conditions annulée");
      }
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde de l'acceptation des conditions");
      setAcceptedTerms(propertyData?.terms_accepted || false);
    } finally {
      setSavingTerms(false);
    }
  };

  const handleSubmit = async () => {
    if (!propertyId) {
      toast.error("Aucune propriété sélectionnée");
      return;
    }
    if (!acceptedTerms) {
      toast.error("Vous devez accepter les conditions générales pour continuer");
      return;
    }
    setLoading(true);
    try {
      await fetch('/api/property/policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId })
      });
      toast.success("Propriété activée avec succès");
      next();
    } catch (error) {
      toast.error("Erreur lors de l'activation de la propriété");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen bg-gray-50">
      <div className="h-full overflow-auto pb-24">
        <Container className="py-8 space-y-8">
          <Typography variant="h1">
            Conditions Générales d'Utilisation
          </Typography>
          
          {/* Affichage du statut d'acceptation précédent */}
          {propertyData?.terms_accepted_at && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <Typography variant="body-base" className="text-green-800">
                ✅ Conditions acceptées le {new Date(propertyData.terms_accepted_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </div>
          )}

          {/* Conditions simplifiées */}
          <div className="rounded-xl shadow-lg p-6">
            <div className="space-y-4">
              {[
                `Afrivago prélève automatiquement ${pricing?.commission_percentage || 0}% de commission sur chaque loyer mensuel collecté.`,
                "Le propriétaire doit assurer la maintenance et la disponibilité de sa propriété.",
                "Il est strictement interdit de collecter des loyers directement \"main à main\" avec les locataires.",
                "Toute tentative de contournement des paiements sera détectée et sanctionnée.",
                "Les fraudes entraînent une suspension immédiate et des poursuites judiciaires.",
                "Tous les revenus locatifs doivent être déclarés aux autorités fiscales compétentes.",
                "Afrivago protège vos données personnelles conformément au RGPD.",
                "Les paiements sont effectués dans un délai de 5 jours ouvrables après réception du loyer.",
                "La résiliation du compte nécessite un préavis de 30 jours.",
                "Ces conditions sont régies par le droit béninois et la juridiction de Cotonou."
              ].map((condition, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <Typography variant="body-lg">
                    {condition}
                  </Typography>
                </div>
              ))}
            </div>
          </div>

          {/* Acceptation des conditions */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded p-6 border-2 border-primary/20">
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptedTerms}
                onChange={(e) => handleTermsAcceptance(e.target.checked)}
                disabled={savingTerms}
                className="mt-1 w-5 h-5 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary disabled:opacity-50"
              />
              <label htmlFor="acceptTerms" className="flex-1">
                <Typography variant="body-lg" className="text-black">
                  Je certifie avoir lu, compris et accepter l'intégralité des conditions générales d'utilisation d'Afrivago.
                  {savingTerms && <span className="ml-2 text-primary">🔄 Sauvegarde...</span>}
                </Typography>
                <Typography variant="body-base">
                  ⚠️ Toute tentative de fraude sera automatiquement signalée aux autorités compétentes.
                </Typography>
              </label>
            </div>
          </div>

          {/* Note légale finale */}
          <div className="bg-gray-100 rounded p-6 py-[-20] text-center">
            <Typography variant="body-base">
              Ces conditions sont régies par le droit béninois. Tout litige sera soumis à la juridiction compétente de Cotonou.
              <br />
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </Typography>
          </div>
        </Container>
      </div>

      <OnboardingFooter
        prev={prev}
        next={handleSubmit}
        isFirstStep={isFirstStep}
        isFinalStep={isFinalStep}
        isLoading={loading || savingTerms}
        nextText={acceptedTerms ? "Activer ma propriété" : "Accepter les conditions"}
        nextDisabled={!acceptedTerms}
      />
    </div>
  );
};