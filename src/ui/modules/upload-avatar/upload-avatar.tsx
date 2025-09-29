import { useAuth } from "@/Context/AuthUserContext";
import { Avatar } from "@/ui/design-system/avatar/avatar";
import clsx from "clsx";
import { RiCamera2Fill } from "react-icons/ri";

interface Props {
    handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    imagePreview: string | ArrayBuffer | null;
    uploadProgress: number;
    isLoading: boolean;
    variant?: "primary" | "outline"

}

export const UploadAvatar = ({ handleImageSelect, imagePreview, uploadProgress, isLoading, variant= "primary",
}: Props) => {
    const { authUser }=useAuth()

const uploadProgressBarStyle = `fixed top-0 left-0 w-full h-1 bg-secondary animate ${uploadProgress > 0 ? "" : "hidden"}`

    return (
        <div className="flex items-center gap-5">
            <div
                className={uploadProgressBarStyle}
                style={{ width: `${uploadProgress}%` }}
            />

            <label 
                className={clsx(
                    isLoading ? "cursor-not-allowed" : "cursor-pointer",
                    variant === "primary" &&
                    "bg-primary hover:bg-primary-400 text-white",
                    variant === "outline" &&
                    "bg-white hover:bg-gray-400/50 border border-gray-500 text-gray-800",
                    "inline-block rounded px-[18px] py-[15px] text-caption2 font-medium animate"
                )}
              >

                <div className="flex items-center gap-2">
                    <RiCamera2Fill />
                    <span>Choisir un fichier</span>
                </div>
                <input 
                    type="file"
                    className="hidden"
                    onChange={handleImageSelect}
                />
            </label>
            <Avatar
                size="large"
                alt="Avatar"
                src={
                    imagePreview
                    ? (typeof imagePreview === "string"
                        ? imagePreview
                        : String(imagePreview))
                        : authUser?.userDocument.photourl?
                          authUser.userDocument.photourl
                    : "assets/svg/Camera.svg"
                }
            />
        </div>
    );
};
