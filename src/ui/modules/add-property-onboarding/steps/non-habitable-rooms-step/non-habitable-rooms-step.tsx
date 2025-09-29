// non-habitable-rooms-step.tsx
import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import { OnboardingFooter } from '../../components/footer/onboarding-footer';
import { OnboardingTabs } from '../../components/tabs/onboarding-tabs';
import { Container } from '@/ui/components/container/container';
import { Typography } from '@/ui/design-system/typography/typography';
import { useToggle } from '@/hooks/use-toggle';
import { useAuth } from '@/Context/AuthUserContext';
import { usePropertyOnboardingStore } from '../../context/propertyOnboarding.store';
import { BaseComponentProps } from '@/types/onboarding-steps-List';
import { NonHabitableRoomsForm } from './non-habitable-rooms-step-form';

interface RoomType {
  id: string;
  name: string;
}

interface RoomFormData {
  [roomTypeId: string]: {
    quantity: number;
    surface: number;
  };
}

export const NonHabitableRoomsStep = ({
  prev,
  next,
  isFirstStep,
  isFinalStep,
  stepsList,
  getCurrentStep,
  handleStepSubmit
}: BaseComponentProps) => {
  const { authUser } = useAuth();
  const { value: isLoadingForm, setvalue: setLoadingForm } = useToggle();
  const propertyId = usePropertyOnboardingStore(state => state.propertyId);

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<RoomFormData>({});

  const {
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm();

  // Charger les types de pièces non habitables et les pièces existantes
  useEffect(() => {
    const fetchTypesAndRooms = async () => {
      const res = await fetch(`/api/property/non-habitable-rooms?propertyId=${propertyId}`);
      const data = await res.json();
      setRoomTypes(data.roomTypes || []);
      const formatted: RoomFormData = {};
      (data.propertyRooms || []).forEach((room: any) => {
        formatted[room.room_type_id] = {
          quantity: room.quantity,
          surface: room.surface
        };
      });
      setSelectedRooms(formatted);
    };
    fetchTypesAndRooms();
  }, [propertyId]);

 const onSubmit: SubmitHandler<any> = async () => {
  if (!propertyId) return;
  setLoadingForm(true);

  try {
    const inserts = Object.entries(selectedRooms).map(([roomTypeId, values]) => ({
      property_id: propertyId,
      room_type_id: roomTypeId,
      quantity: Number(values.quantity),
      surface: Number(values.surface),
    }));
    await fetch('/api/property/non-habitable-rooms', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, inserts })
    });
    toast.success("Pièces enregistrées avec succès !");
    if (handleStepSubmit) {
      await handleStepSubmit(selectedRooms);
    }
    next();
  } catch (error) {
    toast.error("Une erreur est survenue");
  } finally {
    setLoadingForm(false);
  }
};


  return (
    <div className="relative h-screen pb-[91px]">
      <div className="h-full overflow-auto">
        <Container className="grid h-full grid-cols-12 items-center">
          <div className="col-span-6 flex flex-col justify-center h-full py-10 space-y-6">
            <Typography variant="h3">Pièces non habitables</Typography>
            <Typography variant="body-sm" theme="gray">
              Ajoutez les pièces comme les cuisines, garages, terrasses, etc. N'oubliez pas de
              préciser la surface et la quantité.
            </Typography>
          </div>
          <div className="col-span-6 flex items-center justify-center h-full">
            <div
              className="rounded border-gray-500 p-4 w-full max-h-[400px] overflow-y-auto bg-white shadow"
              style={{ minHeight: 300 }}
            >
              <NonHabitableRoomsForm
                roomTypes={roomTypes}
                selectedRooms={selectedRooms}
                setSelectedRooms={setSelectedRooms}
                form={{
                  control,
                  register,
                  errors,
                  isLoading: isLoadingForm,
                  onSubmit: () => {},
                  handleSubmit: () => {},
                }}
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
        isLoading={isLoadingForm}
      />
    </div>
  );
};
