// RentalChoiceStep.tsx - Version corrigée
import { BaseComponentProps } from "@/types/onboarding-steps-List";
import { Container } from "@/ui/components/container/container";
import { Typography } from "@/ui/design-system/typography/typography";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import Image from "next/image";
import { usePropertyOnboarding } from "@/Context/PropertyOnboardingContext";
import { OnboardingTabs } from "../../components/tabs/onboarding-tabs";
import { OnboardingFooter } from "../../components/footer/onboarding-footer";
import { usePropertyOnboardingStore } from "../../context/propertyOnboarding.store"; 
import { toast } from "react-toastify";
import { useRouter } from 'next/router';
import { Spinner } from "@/ui/design-system/spinner/spinner";
// Types
interface RoomType {
  id: string;
  name: string;
}

interface Equipment {
  id: string;
  name: string;
  equipment_type_id: string;
}

interface RoomData {
  id?: string;
  name: string;
  room_type_id: string;
  surface: number;
  description: string;
  photos: File[];
  equipments: Record<string, number>;
}

interface Property {
  id: string;
  property_type_id?: string;
}

interface RentalChoiceStepProps extends BaseComponentProps {
  property: Property;
}

export const RentalChoiceStep = ({
  prev,
  next,
  isFirstStep,
  isFinalStep,
  stepsList,
  getCurrentStep,
  handleStepSubmit,
  isLoading,
}: BaseComponentProps) => {
  const { propertyId } = usePropertyOnboarding();
  const setRentalType = usePropertyOnboardingStore(state => state.setRentalType);
  const setPropertyId = usePropertyOnboardingStore(state => state.setPropertyId);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [propertyTypeName, setPropertyTypeName] = useState<string | null>(null);
  const [isLoadingPropertyType, setIsLoadingPropertyType] = useState(true);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  
  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    watch
  } = useForm<{ rental_type: string }>();

  const rentalType = watch("rental_type");
  
  // Récupérer le nom du type de propriété via JOIN
  useEffect(() => {
    const fetchPropertyType = async () => {
      if (!propertyId) {
        setIsLoadingPropertyType(false);
        return;
      }
      try {
        const res = await fetch(`/api/property/rental-choice?propertyId=${propertyId}&type=propertyTypeName`);
        const data = await res.json();
        setPropertyTypeName(data.name || null);
      } catch (err) {
        setPropertyTypeName(null);
      } finally {
        setIsLoadingPropertyType(false);
      }
    };
    fetchPropertyType();
  }, [propertyId]);

  // Calcul de isStudio avec debug
  const isStudio = propertyTypeName?.toLowerCase().trim() === "studio";
  
  // Debug pour comprendre ce qui se passe
  useEffect(() => {
    console.log('🔄 State update:', {
      propertyTypeName,
      isStudio,
      isLoadingPropertyType,
      propertyId: propertyId
    });
  }, [propertyTypeName, isStudio, isLoadingPropertyType, propertyId]);


  useEffect(() => {
    if (!rentalType && !isStudio && !isLoadingPropertyType) {
      setValue("rental_type", "entire");
    }
  }, [rentalType, setValue, isStudio, isLoadingPropertyType]);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      const res = await fetch(`/api/property/rental-choice?propertyId=dummy&type=roomTypes`);
      const data = await res.json();
      setRoomTypes(data);
    };
    fetchRoomTypes();
  }, []);

  const handleRoomTypeChange = async (roomTypeId: string, index: number): Promise<void> => {
    setRooms((prevRooms: any[]) => {
      const updated = [...prevRooms];
      if (updated[index]) updated[index].room_type_id = roomTypeId;
      return updated;
    });
  };

  const onSubmit = async (data: { rental_type: string }) => {
    try {
      setRentalType(data.rental_type as any);
      if (propertyId) setPropertyId(propertyId);
      if (propertyId) {
        await fetch('/api/property/rental-choice', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ propertyId, rentalType: data.rental_type })
        });
      }
      if (handleStepSubmit) {
        await handleStepSubmit(data);
      }
      if (propertyId) {
        toast.success('Propriété bien récupérée !');
      }
      next();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du type de location:', error);
      toast.error('Erreur lors de la sauvegarde du type de location');
    }
  };

  const handleSaveRoom = async (roomData: RoomData) => {
    try {
      setRooms(prev => [...prev, roomData]);
      setIsModalOpen(false);
    next();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la pièce:', error);
    }
  };

  const options = [
    {
      label: "Louer l'ensemble du logement",
      value: "entire",
      description: "Un seul locataire ou un groupe réserve tout l'espace. Idéal pour familles ou groupes.",
      icon: "/images/entire-property.svg"
    },
    {
      label: "Louer par unité ou chambre",
      value: "unit",
      description: "Vous pouvez proposer différentes unités à des locataires différents. Flexible et rentable.",
      icon: "/images/unit-property.svg"
    },
  ];

  // Affichage de loading pendant le chargement
  if (isLoadingPropertyType) {
    return (
      <div className="relative h-screen pb-[91px]">
        <div className="h-full overflow-auto pt-0">
          <Container className="grid h-full grid-cols-12">
            <Spinner />
          </Container>
        </div>
      </div>
    );
  }

  // Sinon, on affiche les options de location
  return (
    <div className="relative h-screen pb-[91px]">
      <div className="h-full overflow-auto pt-0">
        <Container className="grid h-full">
          <div className="relative z-10 flex items-center h-full py-10">
            <div className="w-full space-y-5 pb-4.5">

              <Typography variant="h3">
                Choisissez votre mode de location
              </Typography>
              <Typography variant="body-base" component="p">
                Déterminez comment vous souhaitez mettre votre logement à disposition : en entier ou en unités séparées.
              </Typography>

              <div className="mt-8 grid grid-cols-2 gap-6 max-w-xl max-h-xl ">
                {options.map((option) => (
                  <label
                    key={option.value}
                    className={`flex p-6 rounded-xl border transition cursor-pointer hover:shadow-lg aspect-square flex-col justify-center ${
                      rentalType === option.value
                        ? "border-blue-600 ring-2 ring-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <input
                        type="radio"
                        value={option.value}
                        {...register("rental_type", { required: true })}
                        className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <Typography variant="lead" className="font-semibold">
                        {option.label}
                      </Typography>
                      <Typography variant="body-base" className="text-gray-600">
                        {option.description}
                      </Typography>
                    </div>
                  </label>
                ))}
              </div>
              
              {errors.rental_type && (
                <Typography variant="body-sm" theme="danger" className="mt-4">
                  Veuillez sélectionner un mode de location
                </Typography>
              )}
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