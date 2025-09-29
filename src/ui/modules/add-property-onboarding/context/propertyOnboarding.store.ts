import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PropertyType = 'studio' | 'apartment' | 'house' | null;
export type RentalType = 'entire' | 'unit' | null;

export interface Step {
  id: number;
  label: string;
  component: {
    step: React.ComponentType<any>;
  };
  condition?: (ctx: any) => boolean;
}

interface PropertyOnboardingState {
  // État de la propriété
  propertyId: string | null;
  propertyType: PropertyType;
  rentalType: RentalType;
  statut?: string | null;
  
  // Gestion des étapes
  currentStep: number;
  steps: Step[];
  draftData: Record<string, any>;
  
  // État d'hydratation
  _hasHydrated: boolean;
  
  // Actions
  setPropertyId: (id: string | null) => void;
  setPropertyType: (type: PropertyType) => void;
  setRentalType: (type: RentalType) => void;
  setStatut?: (statut: string) => void;
  setCurrentStep: (step: number) => void;
  setSteps: (steps: Step[]) => void;
  updateDraftData: (data: any) => void;
  next: () => void;
  prev: () => void;
  resetOnboarding: () => void;
  getVisibleSteps: () => Step[];
  setHasHydrated: (state: boolean) => void;
  isHydrated: () => boolean;
}

export const usePropertyOnboardingStore = create<PropertyOnboardingState>()(
  persist(
    (set, get) => ({
      // État initial
      propertyId: null,
      propertyType: null,
      rentalType: null,
      statut: null,
      currentStep: 1,
      steps: [],
      draftData: {},
      _hasHydrated: false,

      // Actions
      setPropertyId: (id) => {
        console.log('[Store] setPropertyId appelé avec:', id);
        set({ propertyId: id });
      },
      setPropertyType: (type) => set({ propertyType: type }),
      setRentalType: (type) => set({ rentalType: type }),
      setStatut: (statut) => set({ statut }),
      setCurrentStep: (step) => {
        console.log('[Store] setCurrentStep appelé avec:', step);
        set({ currentStep: step });
      },
      setSteps: (steps) => set({ steps }),
      updateDraftData: (data) => 
        set((state) => ({ 
          draftData: { ...state.draftData, ...data } 
        })),
      
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      isHydrated: () => get()._hasHydrated,
      
      getVisibleSteps: () => {
        const { steps, propertyType, rentalType } = get();
        return steps.filter(step => !step.condition || step.condition({ propertyType, rentalType }));
      },

      next: () => {
        const { currentStep, steps, propertyType, rentalType } = get();
        console.log('[Store] next() - currentStep:', currentStep);
        
        const visibleSteps = steps.filter(step => !step.condition || step.condition({ propertyType, rentalType }));
        const currentIndex = visibleSteps.findIndex(s => s.id === currentStep);
        
        if (currentIndex < visibleSteps.length - 1) {
          const nextStep = visibleSteps[currentIndex + 1];
          console.log('[Store] next() - navigation vers:', nextStep.id);
          set({ currentStep: nextStep.id });
        }
      },

      prev: () => {
        const { currentStep, steps, propertyType, rentalType } = get();
        console.log('[Store] prev() - currentStep:', currentStep);
        
        const visibleSteps = steps.filter(step => !step.condition || step.condition({ propertyType, rentalType }));
        const currentIndex = visibleSteps.findIndex(s => s.id === currentStep);
        
        if (currentIndex > 0) {
          const prevStep = visibleSteps[currentIndex - 1];
          console.log('[Store] prev() - navigation vers:', prevStep.id);
          set({ currentStep: prevStep.id });
        }
      },

      resetOnboarding: async () => {
        console.log('[Store] resetOnboarding appelé');
        // Nettoyer le localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('propertyDraft');
          localStorage.removeItem('property-onboarding-storage');
        }
        
        // Supprimer le draft en base si encore présent via API
        const { propertyId } = get();
        if (propertyId) {
          try {
            const response = await fetch(`/api/properties/${propertyId}/delete-draft`, { method: 'DELETE' });
            if (!response.ok) {
              const result = await response.json();
              console.warn('[Store] Erreur suppression draft en base:', result.error);
            }
          } catch (e) {
            console.warn('[Store] Erreur suppression draft en base:', e);
          }
        }

        // Réinitialiser tout l'état
        set({
          propertyId: null,
          propertyType: null,
          rentalType: null,
          statut: null,
          currentStep: 1,
          steps: [],
          draftData: {},
          _hasHydrated: true,
        });
      },
    }),
    {
      name: 'property-onboarding-storage',
      onRehydrateStorage: () => (state) => {
        console.log('[Store] Hydratation terminée, state:', state);
        state?.setHasHydrated(true);
      },
    }
  )
);