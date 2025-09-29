import { FormsType } from "@/types/forms";
import { Typography } from "@/ui/design-system/typography/typography";
import { ProfileForm } from "./profile.form";
import { useRoleContext } from "@/Context/RoleContext";

interface Props {
  imagePreview: string | ArrayBuffer | null ;
  uploadProgress: number; 
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void ;
  form: FormsType;
  preferences: any;
  preferencesLoading: boolean;
}

export const ProfileView = ({ form, imagePreview, uploadProgress, handleImageSelect }: Props) => {
  const { activeRole } = useRoleContext();
  const isLocataire = activeRole?.nom?.toLowerCase() === "locataire";
  return (
    <div className="space-y-5 p-4">
      <Typography variant="h3" component="h1">
        Mon compte
      </Typography>
      <ProfileForm 
      imagePreview={imagePreview}
      uploadProgress={uploadProgress}
      handleImageSelect={handleImageSelect}
      form={form}
        isLocataire={isLocataire}
      />
    </div>
  );
};
