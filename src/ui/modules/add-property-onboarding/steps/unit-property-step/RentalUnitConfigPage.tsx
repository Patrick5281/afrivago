import { useRouter } from 'next/router';
import RentalUnitMiniOnboardingContainer from './RentalUnitMiniOnboardingContainer';
import { usePropertyOnboardingStore } from '../../context/propertyOnboarding.store';
import { useEffect, useState, useRef } from 'react';
import { Typography } from '@/ui/design-system/typography/typography';
import { Button } from '@/ui/design-system/button/button';
import { OnboardingFooter } from '../../components/footer/onboarding-footer';

export default function $RentalUnitConfigPage({ next, prev, isFirstStep, isFinalStep, stepsList, getCurrentStep, isLoading }: any) {
  const router = useRouter();
  const { propertyId: queryPropertyId, unitId } = router.query;
  const store = usePropertyOnboardingStore();
  const propertyId = (typeof queryPropertyId === 'string' && queryPropertyId !== 'undefined') ? queryPropertyId : store.propertyId;

  const [showMiniOnboarding, setShowMiniOnboarding] = useState(false);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Gestion fermeture menu au clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  // Synchronisation du store avec l'URL si besoin
  useEffect(() => {
    if (propertyId && propertyId !== store.propertyId) {
      store.setPropertyId(propertyId);
    }
  }, [propertyId, store]);

  // Redirection si propertyId absent
  useEffect(() => {
    if (!propertyId) {
      const timeout = setTimeout(() => {
        router.push('/onboarding');
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [propertyId, router]);

  // Charger les unités existantes
  const fetchUnits = async () => {
    if (!propertyId) return;
    setLoading(true);
    const res = await fetch(`/api/property/rental-units?propertyId=${propertyId}`);
    const data = await res.json();
    setUnits(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!showMiniOnboarding) fetchUnits();
  }, [propertyId, showMiniOnboarding]);

  // Handler pour terminer le mini-onboarding
  const handleMiniOnboardingFinish = () => {
    setShowMiniOnboarding(false);
    fetchUnits();
  };

  // Handler pour supprimer une unité
  const handleDeleteUnit = async (unitId: string) => {
    setLoading(true);
    await fetch('/api/property/rental-units', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unitId })
    });
    fetchUnits();
    setOpenMenuId(null);
  };

  // Handler pour dupliquer une unité (à implémenter)
  const handleDuplicateUnit = (unit: any) => {
    // TODO: à implémenter selon la logique métier
    setOpenMenuId(null);
  };

  // Handler pour éditer une unité (à implémenter)
  const handleEditUnit = (unit: any) => {
    // TODO: à implémenter selon la logique métier
    setOpenMenuId(null);
  };

  const handleNextClick = async () => {
    if (!propertyId) {
      // Gérer le cas où l'ID de la propriété n'est pas disponible
      console.error("L'ID de la propriété est manquant. Impossible de continuer.");
      // Afficher une notification à l'utilisateur si nécessaire
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/property/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rental_type: 'unit' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Une erreur est survenue lors de la mise à jour du type de location.");
      }

      // Si la mise à jour réussit, passez à l'étape suivante
      if (next) {
        next();
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du type de location:", error);
      // Gérer l'erreur, par exemple en affichant un message à l'utilisateur
    } finally {
      setIsUpdating(false);
    }
  };

  if (!propertyId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="text-red-600 font-bold text-lg mb-2">Impossible de poursuivre l'ajout d'une unité</div>
        <div className="mb-4">L'identifiant du bien est manquant ou perdu.<br/>Vous allez être redirigé vers la page d'accueil de l'onboarding.</div>
        <button
          className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
          onClick={() => router.push('/onboarding')}
        >
          Retour à l'accueil de l'onboarding
        </button>
      </div>
    );
  }

  if (showMiniOnboarding) {
    return (
      <RentalUnitMiniOnboardingContainer
        propertyId={propertyId as string}
        unitId={undefined}
        onFinish={handleMiniOnboardingFinish}
      />
    );
  }

  return (
    <div className=" relative mx-auto py-10 px-4 pb-32">
      <Typography variant="h3" className="mb-4">Gestion des unités locatives</Typography>
      <Typography variant="body-base" className="mb-6">
        Ajoutez, éditez ou supprimez les unités locatives associées à ce bien. Vous pouvez ajouter plusieurs unités (ex: chambres, appartements séparés, etc).
      </Typography>
      <Button action={() => setShowMiniOnboarding(true)} className="mb-6">
        Ajouter une unité
      </Button>
      <div className="space-y-4">
        {loading && <div>Chargement...</div>}
        {!loading && units.length === 0 && <div className="text-gray-500">Aucune unité enregistrée pour ce bien.</div>}
        {!loading && units.length > 0 && (
          <div className="space-y-2">
            {units.map(unit => (
              <div key={unit.id} className="border rounded p-3 flex justify-between items-center">
                <div>
                  <div className="font-medium">{unit.name}</div>
                  <div className="text-sm text-gray-500">{unit.description}</div>
                </div>
                <div className="flex gap-2 items-center relative">
                  {/* Menu d'actions */}
                  <button
                    onClick={() => setOpenMenuId(openMenuId === unit.id ? null : unit.id)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <circle cx="10" cy="4" r="2" />
                      <circle cx="10" cy="10" r="2" />
                      <circle cx="10" cy="16" r="2" />
                    </svg>
                  </button>
                  {openMenuId === unit.id && (
                    <div ref={menuRef} className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 animate-fade-in">
                      <div className="py-1">
                        <button
                          onClick={() => handleEditUnit(unit)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Éditer
                        </button>
                        <button
                          onClick={() => handleDuplicateUnit(unit)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Dupliquer
                        </button>
                        <button
                          onClick={() => handleDeleteUnit(unit.id)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Supprimer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Footer de navigation de l'onboarding global */}
      <OnboardingFooter
        next={handleNextClick}
        prev={prev}
        isFirstStep={isFirstStep}
        isFinalStep={isFinalStep}
        isLoading={isLoading || loading || isUpdating}
      />
    </div>
  );
}