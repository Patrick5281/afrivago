import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePropertyOnboardingStore } from '../../context/propertyOnboarding.store';
import { OnboardingFooter } from '../../components/footer/onboarding-footer';
import { Container } from '@/ui/components/container/container';
import { Typography } from '@/ui/design-system/typography/typography';
import { Textarea } from '@/ui/design-system/forms/textarea';
import { toast } from 'react-toastify';

const descriptionSchema = z.object({
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères')
    .max(2000, 'La description ne peut pas dépasser 2000 caractères'),
});

type DescriptionFormData = z.infer<typeof descriptionSchema>;

export const PropertyDescriptionStep = ({
  prev, next, isFirstStep, isFinalStep, stepsList, getCurrentStep, handleStepSubmit, isLoading
}: any) => {
  const { propertyId, updateDraftData } = usePropertyOnboardingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDescription, setIsLoadingDescription] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DescriptionFormData>({
    resolver: zodResolver(descriptionSchema),
  });

  // Charger la description existante
  useEffect(() => {
    const loadDescription = async () => {
      if (!propertyId) {
        setIsLoadingDescription(false);
        return;
      }

      try {
        console.log('[DEBUG] Chargement de la description pour propertyId:', propertyId);
          const res = await fetch(`/api/property/description?propertyId=${propertyId}`);
        
        if (!res.ok) {
          throw new Error(`Erreur HTTP: ${res.status}`);
        }

          const data = await res.json();
        console.log('[DEBUG] Description reçue:', data);

          if (data?.description) {
            setValue('description', data.description);
          }
        } catch (error) {
        console.error('[ERROR] Erreur lors du chargement de la description:', error);
        toast.error('Erreur lors du chargement de la description');
      } finally {
        setIsLoadingDescription(false);
      }
    };

    loadDescription();
  }, [propertyId, setValue]);

  // Fonction de soumission
  const onSubmit = async (data: DescriptionFormData) => {
    if (!propertyId) {
      toast.error('Erreur: ID de propriété manquant');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('[DEBUG] Envoi de la description:', data);
      const response = await fetch('/api/property/description', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, description: data.description })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      updateDraftData({ description: data.description });
      toast.success('Description enregistrée avec succès');
      
      if (typeof next === 'function') {
        next();
      }
    } catch (error) {
      console.error('[ERROR] Erreur lors de la sauvegarde de la description:', error);
      toast.error('Erreur lors de la sauvegarde de la description');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative h-screen pb-[91px]">
      <div className="h-full overflow-auto">
        <Container className="h-full flex flex-col items-center justify-center">
          <Typography variant="h1" className="text-center mb-8">
            Description du Logement
          </Typography>

          <form className="w-full max-w-2xl" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6">
              <Textarea
                label="Description courte"
                register={register}
                errors={errors}
                errorMsg="Vous devez renseigner une description"
                placeholder="Description de la pièce (max 200 caractères)"
                rows={8}
                isLoading={isLoading || isSubmitting || isLoadingDescription}
                required
                id="description"
              />
              <Typography variant="caption4" className="text-gray-500 mt-2">
                Décrivez les points forts de votre logement, son ambiance, ses caractéristiques uniques...
              </Typography>
            </div>
          </form>
        </Container>
      </div>

      <OnboardingFooter
        prev={prev}
        next={handleSubmit(onSubmit)}
        isFirstStep={isFirstStep}
        isFinalStep={isFinalStep}
        isLoading={isLoading || isSubmitting || isLoadingDescription}
      />
    </div>
  );
};