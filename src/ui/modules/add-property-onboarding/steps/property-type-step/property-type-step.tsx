import { useEffect, useState } from 'react';
import { usePropertyOnboardingStore } from '../../context/propertyOnboarding.store';
import { Container } from '@/ui/components/container/container';
import { Typography } from '@/ui/design-system/typography/typography';
import { OnboardingFooter } from '../../components/footer/onboarding-footer';
import { toast } from 'react-toastify';
import { BedIcon, Building2, HomeIcon } from 'lucide-react';

const iconMap: Record<string, JSX.Element> = {
  studio: <BedIcon size={32} className="text-primary" />,
  apartment: <Building2 size={32} className="text-primary" />,
  house: <HomeIcon size={32} className="text-primary" />
};

export const PropertyTypeStep = ({
  prev,
  next,
  isFirstStep,
  isFinalStep,
  stepsList,
  getCurrentStep,
  handleStepSubmit,
  isLoading
}: any) => {
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const setPropertyType = usePropertyOnboardingStore(state => state.setPropertyType);
  const propertyId = usePropertyOnboardingStore(state => state.propertyId);
  const currentType = usePropertyOnboardingStore(state => state.propertyType);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await fetch('/api/property/types');
        if (!res.ok) throw new Error('Erreur lors de la récupération des types');
        const types = await res.json();
        setPropertyTypes(types);
      } catch (e) {
        toast.error('Erreur lors du chargement des types de bien');
      }
    };
    fetchTypes();
  }, []);

  // Pré-remplissage du type sélectionné si déjà existant
  useEffect(() => {
    if (currentType && propertyTypes.length > 0) {
      const found = propertyTypes.find(t => {
        const name = t.name?.toLowerCase();
        if (currentType === 'studio') return name === 'studio';
        if (currentType === 'apartment') return name?.includes('appart');
        if (currentType === 'house') return name?.includes('maison') || name?.includes('house');
        return false;
      });
      if (found) setSelectedType(found.id);
    }
  }, [currentType, propertyTypes]);

  const handleSelect = (type: any) => {
    setSelectedType(type.id);
  };

 const handleContinue = async () => {
  if (!selectedType) {
    toast.error('Veuillez sélectionner un type de bien');
    return;
  }

  if (!propertyId) {
    toast.error('ID de propriété manquant');
    return;
  }

  try {
    // Mapping logique métier pour le store
    const typeObj = propertyTypes.find(t => t.id === selectedType);
    let mappedType: 'studio' | 'apartment' | 'house' | null = null;
      
    if (typeObj) {
      const name = typeObj.name?.toLowerCase();
      if (name === 'studio') mappedType = 'studio';
      else if (name.includes('appart')) mappedType = 'apartment';
      else if (name.includes('maison') || name.includes('house')) mappedType = 'house';
    }

    console.log('[DEBUG] Envoi de la requête:', { propertyId, selectedType });

    // Sauvegarder l'ID du type en base de données via l'API corrigée
    const res = await fetch('/api/property/types', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        propertyId: propertyId,
        propertyTypeId: selectedType
      }),
    });

    console.log('[DEBUG] Réponse reçue:', res.status, res.statusText);

    if (!res.ok) {
      const errorData = await res.json();
      console.error('[ERROR] Erreur API:', errorData);
      
      // Afficher un message d'erreur plus précis
      const errorMessage = errorData.details || errorData.error || 'Erreur lors de la sauvegarde du type';
      throw new Error(errorMessage);
    }

    const responseData = await res.json();
    console.log('[DEBUG] Sauvegarde réussie:', responseData);

    // Sauvegarder le type mappé dans le store (pour la logique de navigation)
    setPropertyType(mappedType);

    // Continuer vers l'étape suivante
    next();
  } catch (error) {
    console.error('[ERROR] Erreur lors de la sauvegarde du type:', error);
    
    // Afficher l'erreur précise à l'utilisateur
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors de la sauvegarde';
    toast.error(errorMessage);
  }
};

  return (
    <div className="relative min-h-screen">
      <div className="w-full overflow-auto">
        <Container className="h-full flex flex-col items-center justify-center text-center px-4">
          <Typography variant="h3" className="mb-12">
            Sélectionnez votre type
          </Typography>
          
          {/* Container pour centrer les cartes */}
          <div className="flex justify-center w-full mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl">
              {propertyTypes.map(type => {
                const key = type.name?.toLowerCase().includes('studio')
                  ? 'studio'
                  : type.name?.toLowerCase().includes('appart')
                  ? 'apartment'
                  : 'house';
                return (
                  <div
                    key={type.id}
                    className={`cursor-pointer rounded-xl border p-6 flex flex-col justify-center items-center text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg w-72 h-48
                      ${selectedType === type.id
                        ? 'border-primary bg-primary/10 shadow-lg ring-2 ring-primary/20'
                        : 'border-gray-300 bg-white hover:border-primary/50 hover:shadow-md'}
                    `}
                    onClick={() => handleSelect(type)}
                  >
                    <div className="mb-4 flex-shrink-0">{iconMap[key]}</div>
                    <Typography variant="h5" className="mb-2 font-semibold">
                      {type.name}
                    </Typography>
                    <Typography variant="body-sm" className="text-gray-600 line-clamp-2">
                      {type.description || ''}
                    </Typography>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </div>
      <OnboardingFooter
        prev={prev}
        next={handleContinue}
        isFirstStep={isFirstStep}
        isFinalStep={isFinalStep}
        isLoading={isLoading}
      />
    </div>
  );
};