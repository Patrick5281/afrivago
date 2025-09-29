import { BaseComponentProps, QuestionnaireFormFields } from "@/types/onboarding-steps-List";
import { OnboardingTabs } from "../../components/tabs/onboarding-tabs";
import { OnboardingFooter } from "../../components/footer/onboarding-footer";
import { Container } from "@/ui/components/container/container";
import { Typography } from "@/ui/design-system/typography/typography";
import { SubmitHandler, useForm } from "react-hook-form";
import { useToggle } from "@/hooks/use-toggle";
import { useAuth } from "@/Context/AuthUserContext";
import { toast } from "react-toastify";
import { supabase } from "@/config/supabase-config";
import { useState, useEffect } from "react";
import { QuestionnaireStepForm } from "./questionnaire-step-form";
import { DatabaseUserPreferences } from "@/types/database";

export const QuestionnaireStep = ({
  prev,
  next,
  isFirstStep,
  isFinalStep,
  stepsList,
  getCurrentStep,
}: BaseComponentProps) => {
  const { authUser } = useAuth();
  const { value: isLoading, toggle } = useToggle();
  const [housingTypes] = useState<string[]>(["Villa", "Appartement", "Maison", "Studio"]);
  const [cities] = useState<string[]>([
    "Cotonou", "Porto-Novo", "Parakou", "Abomey", 
    "Bohicon", "Ouidah", "Natitingou", "Djougou", "Lokossa", "Comé"
  ]);
  const [budgetRanges] = useState<string[]>([
    "5000", "5000-20000", "20000-100000", 
    "100000-500000", "500000-1000000", "+1000000"
  ]);
  
  const {
    handleSubmit,
    register,
    formState: { errors, isDirty },
    reset,
    setValue,
    control
  } = useForm<QuestionnaireFormFields>({
    defaultValues: {
      fullName: "",
      destination: "Cotonou",
      budget: "5000",
      housingType: "Villa",
      amenities: {
        internet: false,
        airConditioning: false,
        pool: false,
        kitchen: false,
        office: false,
        fan: false,
        mixer: false,
        receptionRoom: false
      }
    }
  });

  // Charger les préférences existantes au montage du composant
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!authUser?.uid) return;

      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", authUser.uid)
        .single();

      if (error) {
        console.error("Erreur lors du chargement des préférences:", error);
        return;
      }

      if (data) {
        setValue("fullName", data.full_name || "");
        setValue("destination", data.destination || "Cotonou");
        setValue("budget", data.budget || "5000");
        setValue("housingType", data.housing_type || "Villa");
        setValue("amenities.internet", data.amenities?.internet || false);
        setValue("amenities.airConditioning", data.amenities?.air_conditioning || false);
        setValue("amenities.pool", data.amenities?.pool || false);
        setValue("amenities.kitchen", data.amenities?.kitchen || false);
        setValue("amenities.office", data.amenities?.office || false);
        setValue("amenities.fan", data.amenities?.fan || false);
        setValue("amenities.mixer", data.amenities?.mixer || false);
        setValue("amenities.receptionRoom", data.amenities?.reception_room || false);
      }
    };

    loadUserPreferences();
  }, [authUser?.uid, setValue]);

  const onSubmit: SubmitHandler<QuestionnaireFormFields> = async (formData) => {
    if (!isDirty) {
      next();
      return;
    }

    if (!authUser?.uid) {
      toast.error("Utilisateur non authentifié");
      return;
    }

    toggle();
    try {
      const payload = {
        user_id: authUser.uid,
        full_name: formData.fullName,
        destination: formData.destination,
        budget: formData.budget,
        housing_type: formData.housingType,
        amenities: {
          internet: formData.amenities.internet,
          air_conditioning: formData.amenities.airConditioning,
          pool: formData.amenities.pool,
          kitchen: formData.amenities.kitchen,
          office: formData.amenities.office,
          fan: formData.amenities.fan,
          mixer: formData.amenities.mixer,
          reception_room: formData.amenities.receptionRoom
        }
      };

      const { error } = await supabase
        .from("user_preferences")
        .upsert(payload, {
          onConflict: 'user_id'
        });

      if (error) throw error;

        reset(formData);
      next();
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      toggle();
    }
  };

  return (
    <div className="relative h-screen pb-[91px]">
      <div className="h-full overflow-auto">
        <Container className="grid h-full grid-cols-12">
          <div className="relative z-10 flex items-center h-full col-span-12 py-6">
            <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
              
              <QuestionnaireStepForm 
                form={{ register, errors, isLoading, control, onSubmit, handleSubmit }}
                cities={cities}
                housingTypes={housingTypes}
                budgetRanges={budgetRanges}
                        />
            </div>
          </div>
        </Container>
      </div>
      <OnboardingFooter
        prev={prev}
        next={handleSubmit(onSubmit)}
        isFirstStep={isFirstStep}
        isFinalStep={isFinalStep}
        isLoading={isLoading}
      />
    </div>
  );
};