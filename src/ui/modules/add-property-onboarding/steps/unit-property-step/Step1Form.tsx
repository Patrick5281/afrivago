import { useState, useEffect } from 'react';
import { Typography } from '@/ui/design-system/typography/typography';
import { toast } from 'react-toastify';
import { OnboardingFooter } from './onboarding-footer';
import { Button } from '@/ui/design-system/button/button';
import { Input } from '@/ui/design-system/forms/input';
import { Textarea } from '@/ui/design-system/forms/textarea';

function isValidUUID(id: string | undefined | null): boolean {
  if (!id || id === 'undefined' || id === 'null') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export default function Step1Form({ 
  propertyId: propPropertyId, 
  setUnitId, 
  goNext, 
  goPrev, 
  currentStep, 
  totalSteps, 
  store 
}: any) {
  const storePropertyId = store.propertyId;
  const propertyId = propPropertyId || storePropertyId;
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [propertyValidated, setPropertyValidated] = useState(false);

  // Pré-remplissage depuis le store
  useEffect(() => {
    setForm({
      name: store.draftData?.unit_step1_name || '',
      description: store.draftData?.unit_step1_description || '',
    });
  }, [store.draftData]);

  // Validation du propertyId au chargement
  useEffect(() => {
    const validateProperty = async () => {
      if (!isValidUUID(propertyId)) {
        console.error('[Step1Form] PropertyId invalide:', propertyId);
        setPropertyValidated(false);
        return;
      }

      try {
        const response = await fetch(`/api/unit/validate-property?propertyId=${propertyId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error);
        }
        
        if (!data.isValid) {
          console.error('[Step1Form] Bien non trouvé');
          setPropertyValidated(false);
          toast.error('Le bien associé n\'existe pas. Retour à l\'onboarding.');
          return;
        }
        
        setPropertyValidated(true);
      } catch (e: any) {
        console.error('[Step1Form] Erreur validation bien:', e);
        setPropertyValidated(false);
        toast.error(e.message);
      }
    };

    validateProperty();
  }, [propertyId]);

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    store.updateDraftData({ [`unit_step1_${field}`]: value });
  };

  const handleNext = async () => {
    if (!propertyValidated) {
      toast.error("Le bien associé n'est pas valide. Impossible de continuer.");
      return;
    }

    if (!form.name.trim()) {
      toast.error("Le nom de l'unité est obligatoire.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/unit/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property_id: propertyId,
          name: form.name.trim(),
          description: form.description.trim(),
          price_per_month: 0,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setUnitId(data.id);
      store.setPropertyId(propertyId); // Réassurer la cohérence du store
      toast.success('Unité créée avec succès');
      goNext();
    } catch (e: any) {
      console.error('[Step1Form] Erreur:', e);
      toast.error(`Erreur lors de la création de l'unité: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Si le bien n'est pas validé, afficher un message d'erreur
  if (!propertyValidated) {
    return (
      <div className="space-y-4">
        <Typography variant="h3">Informations de base</Typography>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 font-medium mb-2">
            Problème de configuration
          </div>
          <div className="text-red-700 text-sm mb-4">
            Le bien associé n'est pas accessible. Veuillez retourner à l'onboarding principal.
          </div>
          <Button
            action={() => {
              // Réinitialiser le store Zustand
              store.resetOnboarding();
              // Rediriger vers l'onboarding principal
              window.location.href = '/';
            }}
          >
            Retour à l'accueil de l'onboarding
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleNext(); }}>
      <Typography variant="h3">Informations de base</Typography>

        <Input 
          label="Nom de l'unité"
          value={form.name} 
          onChange={e => handleChange('name', e.target.value)} 
          placeholder="Ex: Appartement A1, Studio 101..."
        required={true}
        id="unit_name"
        isLoading={loading}
        errorMsg="Le nom de l'unité est obligatoire"
        />
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Description courte
        </label>
        <textarea
          rows={3}
        placeholder="Description de l'unité locative..."
          className="w-full p-4 font-light border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-primary placeholder-gray-600"
          disabled={loading}
          value={form.description}
          onChange={e => handleChange('description', e.target.value)}
        />
      </div>
      
      <OnboardingFooter
        next={handleNext}
        prev={goPrev}
        isFirstStep={() => currentStep === 1}
        isFinalStep={() => currentStep === totalSteps}
        isLoading={loading}
      />
    </form>
  );
}