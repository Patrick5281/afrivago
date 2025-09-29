import { BaseComponentProps } from "@/types/onboarding-steps-List";
import { Container } from "@/ui/components/container/container";
import { OnboardingTabs } from "../../tabs/onboarding-tabs";
import { Typography } from "@/ui/design-system/typography/typography";
import { OnboardingFooter } from "../../footer/onboarding-footer";
import { useAuth } from "@/Context/AuthUserContext";
import { useToggle } from "@/hooks/use-toggle";
import { UploadAvatar } from "@/ui/modules/upload-avatar/upload-avatar";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AvatarStep = ({
  prev,
  next,
  isFinalStep,
  stepsList,
  getCurrentStep,
}: BaseComponentProps) => {
    const {authUser, setAuthUser} = useAuth();
    const {value: isLoading, setvalue: toggle} = useToggle({});
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0)

    useEffect(() => {
        if (authUser?.userDocument?.photourl) {
            setImagePreview(authUser.userDocument.photourl);
        }
    }, [authUser]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          let imgDataUrl: string | ArrayBuffer | null = null;
          if (e.target) {
            imgDataUrl = e.target.result;
          }
          setImagePreview(imgDataUrl);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleImageUpload = async () => {
      if (selectedImage && authUser) {
        toggle(true);
        try {
          const formData = new FormData();
          formData.append('file', selectedImage);
          const response = await fetch(`/api/profile/avatar?userId=${authUser.id}`, {
            method: 'POST',
            body: formData,
          });
          if (!response.ok) {
            toast.error("Erreur lors de l'upload");
            toggle(false);
            return;
          }
          const { photourl } = await response.json();
          // Mets à jour le contexte et le localStorage
          const updatedUser = {
            ...authUser,
            userDocument: {
              ...authUser.userDocument,
              photourl,
            },
          };
          setAuthUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          toast.success('Avatar mis à jour !');
          next();
        } catch (error) {
          toast.error("Erreur lors de l'upload de l'avatar");
        } finally {
          toggle(false);
        }
      } else {
        next();
      }
    };
    
    return (
    <div className="relative h-screen pb-[91px]">
        <div className="h-full overflow-auto">
          <Container className="grid h-full grid-cols-12">
            <div className="relative z-10 flex items-center h-full col-span-6 py-10">
              <div className="w-full space-y-5 pb-4.5">
                  <OnboardingTabs 
                    tabs={stepsList}
                    getCurrentStep={getCurrentStep}
                  />
                <Typography variant="h1" component="h1">
                    Derniere Etape !             
                </Typography>
                <Typography
                  variant="body-base"
                  component="p"
                  theme="gray"
                >
                   Vous avez clairement votre place sur Afrivago !
                  Mais avant de séduire vos futurs locataires,
                  il nous faut une belle photo de profil.
                  Une image professionnelle renforce la confiance
                  et attire davantage de réservations.
                  Alors, mettez-vous en valeur et commencez à rentabiliser vos biens !
                </Typography>
              </div>
            </div>
            <div className="flex items-center h-full col-span-6">
              <div className="flex justify-center w-full">
                 <UploadAvatar 
                 handleImageSelect={handleImageSelect} 
                 imagePreview={imagePreview}
                 uploadProgress={uploadProgress}
                 isLoading={isLoading}
                 />
              </div>
              </div>
            </Container>
          </div>
          <OnboardingFooter
            prev={prev}
            next={handleImageUpload}
            isFinalStep={isFinalStep}
            isLoading={isLoading}
          />
        </div>
    );
};

