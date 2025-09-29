// photo-step.tsx - Version nettoyée sans Supabase
import { BaseComponentProps } from "@/types/onboarding-steps-List";
import { Container } from "@/ui/components/container/container";
import { OnboardingTabs } from "../../components/tabs/onboarding-tabs"; 
import { Typography } from "@/ui/design-system/typography/typography";
import { OnboardingFooter } from "../../components/footer/onboarding-footer"; 
import { useToggle } from "@/hooks/use-toggle";
import { UploadImages } from "./uploaad-image";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { usePropertyOnboardingStore } from "../../context/propertyOnboarding.store";
import Image from "next/image";
import { FaTrashAlt } from "react-icons/fa";
import { Button } from "@/ui/design-system/button/button";
import { RiCamera2Fill } from "react-icons/ri";

interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  created_at: string;
}

export const PhotoStep = ({
  prev,
  next,
  isFirstStep,
  isFinalStep,
  stepsList,
  getCurrentStep,
}: BaseComponentProps) => {
  const { propertyId } = usePropertyOnboardingStore();
  const setPropertyId = usePropertyOnboardingStore((state) => state.setPropertyId);
  const { value: isLoading, setvalue: toggle } = useToggle({});
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [propertyImages, setPropertyImages] = useState<PropertyImage[]>([]);
  const [imagesPreview, setImagesPreview] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showAllImages, setShowAllImages] = useState<boolean>(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  const MAX_IMAGES = 10;
  const MIN_IMAGES = 4;

  // Récupération du propertyId depuis le localStorage si nécessaire
  useEffect(() => {
    if (!propertyId) {
      const storedId = localStorage.getItem("onboarding_property_id");
      if (storedId) {
        setPropertyId(storedId);
      }
    }
  }, [propertyId, setPropertyId]);

  // Chargement des images existantes
  useEffect(() => {
    const loadImages = async () => {
      if (!propertyId) return;
      
      console.log('[DEBUG] Tentative de chargement des images pour propertyId:', propertyId);
      try {
        const response = await fetch(`/api/property/images?propertyId=${propertyId}`);
        console.log('[DEBUG] Réponse fetch images:', response);
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des images');
        }
        const images = await response.json();
        console.log('[DEBUG] Images chargées:', images);
      setPropertyImages(images || []);
      } catch (error) {
        console.error('[DEBUG] Erreur lors du chargement des images:', error);
        toast.error("Erreur lors du chargement des images");
      }
    };
    
    loadImages();
  }, [propertyId]);

  // Gestion de la sélection d'images
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log('[DEBUG] handleImageSelect - fichiers sélectionnés:', files);
    if (!files) return;

    const totalImages = propertyImages.length + selectedFiles.length;
    const newFilesArray = Array.from(files);
    const availableSlots = MAX_IMAGES - totalImages;
    console.log('[DEBUG] totalImages:', totalImages, 'availableSlots:', availableSlots);

    if (availableSlots <= 0) {
      toast.error(`Vous avez déjà atteint la limite de ${MAX_IMAGES} images`);
      return;
    }

    const filesToAdd = newFilesArray.slice(0, availableSlots);
    if (filesToAdd.length < newFilesArray.length) {
      toast.warning(`Seulement ${filesToAdd.length} image(s) ajoutée(s). Limite de ${MAX_IMAGES} images atteinte.`);
    }

    // Validation des fichiers
    const validFiles = filesToAdd.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max
      console.log('[DEBUG] Validation fichier:', file.name, 'isValidType:', isValidType, 'isValidSize:', isValidSize);
      if (!isValidType) {
        toast.error(`${file.name} n'est pas un fichier image valide`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name} est trop volumineux (max 10MB)`);
        return false;
      }
      return true;
    });

    // Génération des previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagesPreview((prev) => [...prev, e.target!.result as string]);
          console.log('[DEBUG] Preview générée pour:', file.name);
        }
      };
      reader.readAsDataURL(file);
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    console.log('[DEBUG] Fichiers valides ajoutés à selectedFiles:', validFiles);
  };

  // Suppression d'une image en preview
  const handleRemoveImage = (index: number) => {
    console.log('[DEBUG] Suppression image preview à l\'index:', index);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagesPreview((prev) => prev.filter((_, i) => i !== index));
  };

  // Suppression d'une image déjà uploadée
  const handleDeleteUploadedImage = async (imageId: string) => {
    setDeletingImageId(imageId);
    console.log('[DEBUG] Suppression image uploadée, imageId:', imageId);
    try {
      const response = await fetch('/api/property/images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId })
      });
      console.log('[DEBUG] Réponse suppression image:', response);
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }
      setPropertyImages(prev => prev.filter(img => img.id !== imageId));
      toast.success("Image supprimée avec succès");
    } catch (error) {
      console.error('[DEBUG] Erreur lors de la suppression:', error);
      toast.error("Erreur lors de la suppression de l'image");
    } finally {
      setDeletingImageId(null);
    }
  };

  // Upload des images
  const handleImageUpload = async () => {
    const totalImages = propertyImages.length + selectedFiles.length;
    console.log('[DEBUG] handleImageUpload - totalImages:', totalImages, 'selectedFiles:', selectedFiles, 'propertyImages:', propertyImages);
    if (totalImages < MIN_IMAGES) {
      toast.error(`Vous devez télécharger au moins ${MIN_IMAGES} images`);
      return;
    }

    if (selectedFiles.length === 0 && propertyImages.length >= MIN_IMAGES) {
      next();
      return;
    }

    if (!propertyId) {
      toast.error("ID de propriété manquant");
      return;
    }

    toggle(true);
    setUploadProgress(0);

    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        const formData = new FormData();
        formData.append('propertyId', propertyId);
        formData.append('file', file, file.name);

        console.log('[DEBUG] FormData pour upload:', {
          propertyId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        });

        const response = await fetch('/api/property/images', {
          method: 'POST',
          body: formData,
        });
        console.log('[DEBUG] Réponse upload:', response);
        if (!response.ok) {
          let errorData = {};
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = { error: 'Réponse non JSON', details: await response.text() };
          }
          console.error('[DEBUG] Erreur upload:', errorData);
          throw new Error(errorData.error || `Erreur upload ${file.name}`);
        }

        const result = await response.json();
        console.log('[DEBUG] Résultat upload:', result);
        // Mise à jour de la progression
        setUploadProgress((prev) => {
          const newProgress = prev + (100 / selectedFiles.length);
          return Math.min(newProgress, 100);
        });

        return result;
      });

      const results = await Promise.all(uploadPromises);
      console.log('[DEBUG] Tous les uploads terminés, résultats:', results);
      // Actualiser la liste des images
      setPropertyImages(prev => [...results, ...prev]);
      toast.success(`${results.length} photo${results.length > 1 ? 's' : ''} ajoutée${results.length > 1 ? 's' : ''} avec succès`);
      // Nettoyer et passer à l'étape suivante
      setSelectedFiles([]);
      setImagesPreview([]);
      setTimeout(() => {
        next();
      }, 1000);
    } catch (error) {
      console.error('[DEBUG] Erreur lors de l\'upload:', error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'upload des photos");
    } finally {
      toggle(false);
      setUploadProgress(0);
    }
  };

  const toggleShowAllImages = () => {
    setShowAllImages(!showAllImages);
  };

  const canAddMoreImages = () => {
    return (propertyImages.length + selectedFiles.length) < MAX_IMAGES;
  };

  return (
    <div className="relative h-screen pb-[91px]">
      <div className="h-full overflow-auto">
        <Container>
          <div className="min-h-full flex items-center justify-center py-10">
            <div className="w-full max-w-4xl mx-auto space-y-8">
              
              {/* En-tête centré */}
              <div className="text-center space-y-4">
                <Typography variant="h1" className="text-2xl md:text-3xl font-bold text-gray-900">
                  Télécharger des images de votre propriété locative
                </Typography>
                <Typography variant="body-base" className="text-primary text-sm md:text-base max-w-2xl mx-auto">
                  Faites glisser et déposer vos images ici ou cliquez pour télécharger. Vous pouvez télécharger un maximum de {MAX_IMAGES} images.
              </Typography>
          </div>

              {/* Zone de téléchargement principale */}
              {(showAllImages || propertyImages.length === 0) && (
                <div className="space-y-6">
                  <UploadImages
                handleImageSelect={handleImageSelect}
                    handleRemoveImage={handleRemoveImage}
                    imagesPreview={imagesPreview}
                uploadProgress={uploadProgress}
                    isLoading={isLoading}
                    min={MIN_IMAGES}
                    max={MAX_IMAGES}
                    currentImageCount={propertyImages.length}
                  />
                </div>
              )}

              {/* Images téléchargées - Vue complète ou résumé */}
              {propertyImages.length > 0 && (
                <div className="pt-8 border-t border-gray-200">
                  <div className="text-center mb-6">
                    <Typography variant="body-base" className="text-primary text-sm">
                      <button
                        onClick={toggleShowAllImages}
                        className="hover:underline cursor-pointer text-primary hover:text-primary/80 transition-colors"
                      >
                        {propertyImages.length} sur {MAX_IMAGES} images téléchargées
                      </button>
                    </Typography>
                  </div>

                  {showAllImages ? (
                    // Vue complète avec gestion
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {propertyImages.map((image) => (
                          <div
                            key={image.id}
                            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm group"
                          >
                            <Image
                              src={image.url}
                              alt="Property"
                              fill
                              style={{ objectFit: 'cover' }}
                              className="transition-transform duration-200 group-hover:scale-105"
                            />
                            
                            {/* Overlay sombre au hover */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                            
                            {/* Bouton de suppression */}
                            <div className="absolute top-2 right-2 z-10">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteUploadedImage(image.id);
                                }}
                                disabled={deletingImageId === image.id || isLoading}
                                className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                title="Supprimer cette image"
                              >
                                {deletingImageId === image.id ? (
                                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <FaTrashAlt size={12} />
                                )}
                              </button>
                            </div>

                            {/* Loading overlay pour toute l'image */}
                            {deletingImageId === image.id && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {canAddMoreImages() && (
                        <div className="flex justify-center">
                          <Button
                            action={() => setShowAllImages(false)}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            <RiCamera2Fill className="w-4 h-4" />
                            Ajouter plus d'images
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Vue résumé
                    <div className="flex justify-center">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-2xl">
                        {propertyImages.slice(0, 4).map((image) => (
                          <div key={image.id} className="relative aspect-square w-24 md:w-32">
                            <Image
                              src={image.url}
                              alt="Property"
                              fill
                              style={{ objectFit: 'cover' }}
                              className="rounded-lg shadow-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!showAllImages && propertyImages.length > 4 && (
                    <div className="text-center mt-4">
                      <Typography variant="body-sm" theme="gray">
                        +{propertyImages.length - 4} autres images
                      </Typography>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="pt-8">
                <OnboardingFooter
                  prev={prev}
                  next={handleImageUpload}
                  isFirstStep={isFirstStep}
                  isFinalStep={isFinalStep}
                isLoading={isLoading}
              />
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};