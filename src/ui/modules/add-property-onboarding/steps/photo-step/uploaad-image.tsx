// UploadImages.tsx - Version corrigée
import { useState, useRef } from "react";
import clsx from "clsx";
import { RiCamera2Fill, RiUploadCloud2Line } from "react-icons/ri";
import { FaTrashAlt } from "react-icons/fa";
import Image from "next/image";
import { Typography } from "@/ui/design-system/typography/typography";
import { Button } from "@/ui/design-system/button/button";
import { toast } from "react-toastify";

interface Props {
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: (index: number) => void;
  imagesPreview: string[];
  uploadProgress: number;
  isLoading: boolean;
  min?: number;
  max?: number;
  currentImageCount?: number;
}

export const UploadImages = ({
  handleImageSelect,
  handleRemoveImage,
  imagesPreview,
  uploadProgress,
  isLoading,
  min = 4,
  max = 10,
  currentImageCount = 0,
}: Props) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalImages = currentImageCount + imagesPreview.length;
  const remainingSlots = max - currentImageCount;
  const canAddMore = totalImages < max;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canAddMore || isLoading) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!canAddMore || isLoading) {
      toast.error(`Limite de ${max} images atteinte`);
      return;
    }
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Vérifier si on ne dépasse pas la limite
      if (files.length > remainingSlots) {
        toast.warning(`Seulement ${remainingSlots} image(s) peuvent être ajoutées. Limite de ${max} images.`);
      }
      
      // Créer un événement synthétique pour réutiliser la logique existante
      const syntheticEvent = {
        target: { files }
      } as React.ChangeEvent<HTMLInputElement>;
      handleImageSelect(syntheticEvent);
    }
  };

  const handleClick = () => {
    if (!canAddMore || isLoading) {
      toast.error(`Limite de ${max} images atteinte`);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canAddMore) {
      toast.error(`Limite de ${max} images atteinte`);
      return;
    }
    handleImageSelect(e);
  };

  // Fonction de suppression avec logs pour débogage
  const handleRemove = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`🔴 Tentative de suppression de l'image ${index}`);
    console.log(`📊 Images avant suppression: ${imagesPreview.length}`);
    
    try {
      handleRemoveImage(index);
      console.log(`✅ Suppression réussie pour l'index ${index}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression:`, error);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Barre de progression */}
      {uploadProgress > 0 && (
        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-in-out rounded-full"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Zone de drop principale */}
      <div
        className={clsx(
          "relative border-2 border-dashed rounded-xl p-12 text-center transition-colors duration-200",
          isDragOver && canAddMore && !isLoading
            ? "border-primary bg-primary/5" 
            : !canAddMore || isLoading
            ? "border-gray-200 bg-gray-50/50 cursor-not-allowed"
            : "border-gray-300 hover:border-primary/50 hover:bg-gray-50 cursor-pointer"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isLoading || !canAddMore}
        />
        
        <div className="space-y-4">
          <div className={clsx(
            "mx-auto w-16 h-16 rounded-full flex items-center justify-center",
            !canAddMore || isLoading 
              ? "bg-gray-100" 
              : "bg-primary/10"
          )}>
            <RiUploadCloud2Line 
              className={clsx(
                "w-8 h-8",
                !canAddMore || isLoading 
                  ? "text-gray-400" 
                  : "text-primary"
              )} 
            />
          </div>
          
          <div className="space-y-2">
            <Typography 
              className={clsx(
                "text-lg font-medium",
                !canAddMore || isLoading 
                  ? "text-gray-400" 
                  : "text-gray-900"
              )}
            >
              {!canAddMore 
                ? "Limite atteinte" 
                : "Faites glisser et chuter"
              }
            </Typography>
            <Typography 
              className={clsx(
                "text-sm",
                !canAddMore || isLoading 
                  ? "text-gray-400" 
                  : "text-primary"
              )}
            >
              {!canAddMore 
                ? `${max} images maximum` 
                : "ou cliquez pour télécharger"
              }
            </Typography>
          </div>
        </div>

        {isDragOver && canAddMore && !isLoading && (
          <div className="absolute inset-0 bg-primary/10 rounded-xl flex items-center justify-center">
            <p className="text-primary font-medium">Déposez vos images ici</p>
          </div>
        )}
      </div>

      {/* Preview des images sélectionnées - VERSION CORRIGÉE */}
      {imagesPreview.length > 0 && (
        <div className="space-y-4">
          <Typography variant="body-base" className="text-gray-700 font-medium">
            Images sélectionnées ({imagesPreview.length})
          </Typography>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {imagesPreview.map((url, index) => (
              <div
                key={`preview-${index}`}
                className="relative aspect-square rounded-lg overflow-hidden border-2 border-dashed border-primary/30 shadow-sm bg-gray-50"
              >
                <Image
                  src={url}
                  alt={`Image sélectionnée ${index + 1}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-lg"
                />
                
                {/* Badge "Nouveau" */}
                <div className="absolute top-2 left-2 z-30">
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                    Nouveau
                  </span>
                </div>
                
                {/* Bouton de suppression - TOUJOURS VISIBLE ET CLIQUABLE */}
                <button
                  type="button"
                  onClick={(e) => handleRemove(index, e)}
                  disabled={isLoading}
                  className="absolute top-2 right-2 z-30 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-full p-2 shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  title="Supprimer cette image"
                  style={{ 
                    minWidth: '32px', 
                    minHeight: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FaTrashAlt size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Compteur et bouton d'ajout */}
          <div className="flex items-center justify-between">
            <Typography variant="body-sm">
              {totalImages} sur {max} images {imagesPreview.length > 0 ? "sélectionnées" : ""}
              {currentImageCount > 0 && ` (${currentImageCount} déjà téléchargées)`}
            </Typography>
            
            {canAddMore && (
              <Button
                action={handleClick}
                disabled={isLoading || !canAddMore}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isLoading || !canAddMore
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary/90"
                )}
              >
                <RiCamera2Fill className="w-4 h-4 inline-block" />
                <span className="inline-block mx-2">
                  Ajouter {remainingSlots > 1 ? `(${remainingSlots} restantes)` : "(1 restante)"}
                </span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Informations */}
      <div className="text-center space-y-2">
        <Typography variant="lead">
          Minimum {min} photo{min > 1 ? "s" : ""}, maximum {max} photos
        </Typography>
        <Typography variant="lead">
          Formats acceptés: JPG, PNG, GIF (max 10MB par image)
        </Typography>
        {!canAddMore && (
          <Typography variant="lead" className="text-orange-600 font-medium">
            Limite de {max} images atteinte
          </Typography>
        )}
      </div>
    </div>
  );
};