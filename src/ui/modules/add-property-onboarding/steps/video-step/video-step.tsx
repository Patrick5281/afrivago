// video-step.tsx - Version améliorée pour base de données locale
import { BaseComponentProps } from "@/types/onboarding-steps-List";
import { Container } from "@/ui/components/container/container";
import { Typography } from "@/ui/design-system/typography/typography";
import { OnboardingFooter } from "../../components/footer/onboarding-footer"; 
import { useToggle } from "@/hooks/use-toggle";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { usePropertyOnboardingStore } from "../../context/propertyOnboarding.store";
import { FaTrashAlt, FaPlay, FaPause } from "react-icons/fa";
import { RiVideoUploadLine, RiVideoLine } from "react-icons/ri";
import { Button } from "@/ui/design-system/button/button";
import clsx from "clsx";

interface PropertyVideo {
  id: string;
  property_id: string;
  url: string;
  created_at: string;
}

interface VideoUploadError {
  error: string;
  details?: string;
}

export const VideoStep = ({
  prev,
  next,
  isFirstStep,
  isFinalStep,
  stepsList,
  getCurrentStep,
}: BaseComponentProps) => {
  const { propertyId } = usePropertyOnboardingStore();
  const setPropertyId = usePropertyOnboardingStore((state) => state.setPropertyId);
  const { value: isLoading, setvalue: setIsLoading } = useToggle();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [propertyVideo, setPropertyVideo] = useState<PropertyVideo | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [deletingVideo, setDeletingVideo] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [loadingVideo, setLoadingVideo] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];

  // Initialisation du propertyId depuis le localStorage si nécessaire
  useEffect(() => {
    if (!propertyId) {
      const storedId = localStorage.getItem("onboarding_property_id");
      if (storedId) {
        setPropertyId(storedId);
      }
    }
  }, [propertyId, setPropertyId]);

  // Chargement de la vidéo existante
  useEffect(() => {
    const loadVideo = async () => {
      if (!propertyId) return;
      
      setLoadingVideo(true);
      try {
        const response = await fetch(`/api/property/video?propertyId=${propertyId}`);
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement de la vidéo');
        }
        
        const data = await response.json();
        setPropertyVideo(data || null);
      } catch (error) {
        console.error('Erreur lors du chargement de la vidéo:', error);
        toast.error('Erreur lors du chargement de la vidéo existante');
      } finally {
        setLoadingVideo(false);
      }
    };

    loadVideo();
  }, [propertyId]);

  // Gestion du drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading && !propertyVideo && !selectedFile) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (isLoading || propertyVideo || selectedFile) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleVideoSelect(files[0]);
    }
  };

  // Validation et sélection de la vidéo
  const handleVideoSelect = (file: File) => {
    // Validation du type de fichier
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      toast.error("Format de fichier non supporté. Utilisez MP4, MOV, AVI ou WebM");
      return;
    }

    // Validation de la taille
    if (file.size > MAX_FILE_SIZE) {
      toast.error("La vidéo ne doit pas dépasser 50MB");
      return;
    }

    // Nettoyage de l'ancien aperçu
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }

    // Création du nouvel aperçu
    const videoUrl = URL.createObjectURL(file);
    setVideoPreview(videoUrl);
    setSelectedFile(file);
    setIsPlaying(false);

    toast.success("Vidéo sélectionnée avec succès");
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleVideoSelect(file);
    }
  };

  // Suppression de la vidéo sélectionnée (non uploadée)
  const handleRemoveVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
    setSelectedFile(null);
    setIsPlaying(false);
    
    // Reset du input file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Suppression de la vidéo uploadée
  const handleDeleteUploadedVideo = async () => {
    if (!propertyVideo) return;
    
    setDeletingVideo(true);
    try {
      const response = await fetch('/api/property/video', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: propertyVideo.id })
      });

      if (!response.ok) {
        const errorData: VideoUploadError = await response.json();
        throw new Error(errorData.error || "Erreur lors de la suppression de la vidéo");
      }

      setPropertyVideo(null);
      toast.success("Vidéo supprimée avec succès");
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression de la vidéo");
    } finally {
      setDeletingVideo(false);
    }
  };

  // Upload de la vidéo
  const handleVideoUpload = async () => {
    // Si une vidéo existe déjà et qu'aucune nouvelle n'est sélectionnée, passer à l'étape suivante
    if (propertyVideo && !selectedFile) {
      next();
      return;
    }

    // Validation des prérequis
    if (!selectedFile) {
      toast.error("Veuillez sélectionner une vidéo de présentation");
      return;
    }

    if (!propertyId) {
      toast.error("ID de propriété manquant");
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('propertyId', propertyId);
      formData.append('file', selectedFile);

      // Simulation du progrès d'upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/property/video', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData: VideoUploadError = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'upload de la vidéo");
      }

      const uploadedVideo = await response.json();
      setPropertyVideo(uploadedVideo);
      toast.success("Vidéo de présentation ajoutée avec succès");
      
      // Nettoyage
      handleRemoveVideo();
      
      // Transition vers l'étape suivante
      setTimeout(() => {
        next();
      }, 1000);
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'upload de la vidéo");
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  // Contrôles vidéo
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoClick = () => {
    if (!isLoading && !propertyVideo && !selectedFile) {
      fileInputRef.current?.click();
      }
    };

  // Nettoyage des URLs d'objet lors du démontage
  useEffect(() => {
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [videoPreview]);
    
    return (
    <div className="relative h-screen pb-[91px]">
        <div className="h-full overflow-auto">
        <Container>
          <div className="min-h-full flex items-center justify-center py-10">
            <div className="w-full max-w-4xl mx-auto space-y-8">
              
              {/* En-tête */}
              <div className="text-center space-y-4">
                <Typography variant="h1" className="text-2xl md:text-3xl font-bold text-gray-900">
                  Ajouter une vidéo de présentation
                </Typography>
                <Typography variant="body-base" className="text-primary text-sm md:text-base max-w-2xl mx-auto">
                  Téléchargez une vidéo pour présenter votre propriété locative. 
                  Une vidéo attrayante peut augmenter l'intérêt des locataires potentiels.
                </Typography>
              </div>

              {/* Barre de progression */}
              {uploadProgress > 0 && (
                <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden max-w-md mx-auto">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-600 transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {uploadProgress}%
                    </span>
                  </div>
                </div>
              )}

              {/* Zone principale */}
              <div className="flex justify-center">
                {loadingVideo ? (
                  /* Chargement initial */
                  <div className="max-w-2xl w-full">
                    <div className="aspect-video rounded-xl bg-gray-100 flex items-center justify-center">
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                        <Typography variant="body-base" className="text-gray-600">
                          Chargement de la vidéo...
                        </Typography>
                      </div>
                    </div>
                  </div>
                ) : !propertyVideo && !selectedFile ? (
                  /* Zone de téléchargement */
                  <div
                    className={clsx(
                      "relative border-2 border-dashed rounded-xl p-16 text-center transition-all duration-300 cursor-pointer group max-w-2xl w-full",
                      isDragOver && !isLoading
                        ? "border-primary bg-primary/5 scale-105 shadow-lg" 
                        : isLoading
                        ? "border-gray-200 bg-gray-50/50 cursor-not-allowed"
                        : "border-gray-300 hover:border-primary/50 hover:bg-gray-50/50 hover:scale-[1.02] hover:shadow-md"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleVideoClick}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/mp4,video/mov,video/avi,video/webm"
                      className="hidden"
                      onChange={handleFileInputChange}
                      disabled={isLoading}
                    />
                    
                    <div className="space-y-6">
                      <div className={clsx(
                        "mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                        isLoading 
                          ? "bg-gray-100" 
                          : "bg-primary/10 group-hover:bg-primary/20"
                      )}>
                        <RiVideoUploadLine 
                          className={clsx(
                            "w-10 h-10 transition-colors duration-300",
                            isLoading 
                              ? "text-gray-400" 
                              : "text-primary group-hover:text-primary/80"
                          )} 
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Typography 
                          className={clsx(
                            "text-xl font-semibold transition-colors duration-300",
                            isLoading 
                              ? "text-gray-400" 
                              : "text-gray-900 group-hover:text-primary"
                          )}
                        >
                          Glissez-déposez votre vidéo
                        </Typography>
                        <Typography 
                          className={clsx(
                            "text-base transition-colors duration-300",
                            isLoading 
                              ? "text-gray-400" 
                              : "text-primary group-hover:text-primary/80"
                          )}
                        >
                          ou cliquez pour parcourir vos fichiers
                        </Typography>
                        <Typography variant="body-sm" className="text-gray-500">
                          MP4, MOV, AVI, WebM • Maximum 50MB
                        </Typography>
                      </div>
                    </div>

                    {isDragOver && !isLoading && (
                      <div className="absolute inset-0 bg-primary/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <div className="text-center space-y-2">
                          <RiVideoLine className="w-12 h-12 text-primary mx-auto animate-bounce" />
                          <p className="text-primary font-semibold text-lg">Déposez votre vidéo ici</p>
                        </div>
                      </div>
                    )}
            </div>
                ) : (
                  /* Prévisualisation de la vidéo */
                  <div className="max-w-2xl w-full">
                    <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl bg-black group">
                      <video
                        ref={videoRef}
                        src={propertyVideo?.url || videoPreview || undefined}
                        className="w-full h-full object-cover"
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                        controls={false}
                        preload="metadata"
                      />
                      
                      {/* Overlay de contrôle */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button
                          onClick={togglePlayPause}
                          className="bg-white/90 hover:bg-white text-gray-800 rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/20"
                        >
                          {isPlaying ? (
                            <FaPause className="w-6 h-6" />
                          ) : (
                            <FaPlay className="w-6 h-6 ml-1" />
                          )}
                        </button>
                      </div>

                      {/* Bouton de suppression */}
                      <div className="absolute top-4 right-4 z-10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (propertyVideo) {
                              handleDeleteUploadedVideo();
                            } else {
                              handleRemoveVideo();
                            }
                          }}
                          disabled={deletingVideo || isLoading}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 hover:scale-110 disabled:hover:scale-100"
                          title="Supprimer cette vidéo"
                        >
                          {deletingVideo ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FaTrashAlt size={16} />
                          )}
                        </button>
                      </div>

                      {/* Badge du statut */}
                      <div className="absolute top-4 left-4 z-10">
                        <span className={clsx(
                          "px-3 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm",
                          propertyVideo 
                            ? "bg-green-500/90 text-white" 
                            : "bg-blue-500/90 text-white"
                        )}>
                          {propertyVideo ? "✓ Enregistrée" : "En attente"}
                        </span>
                      </div>

                      {/* Loading overlay pour suppression */}
                      {deletingVideo && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                          <div className="text-center space-y-3">
                            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-white font-medium">Suppression en cours...</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Informations sur la vidéo */}
                    <div className="mt-6 text-center space-y-2">
                      <Typography variant="body-base" className="text-gray-700 font-medium">
                        {propertyVideo ? "Vidéo de présentation" : "Vidéo sélectionnée"}
                      </Typography>
                      {selectedFile && (
                        <Typography variant="body-sm" className="text-gray-500">
                          {selectedFile.name} • {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                        </Typography>
                      )}
                    </div>
              </div>
                )}
              </div>

              {/* Actions secondaires */}
              {(propertyVideo || selectedFile) && (
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="text-primary hover:text-primary-600"
                  >
                    Choisir une autre vidéo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/mov,video/avi,video/webm"
                    className="hidden"
                    onChange={handleFileInputChange}
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>
          </div>
        </Container>
              </div>

              {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <Container>
          <OnboardingFooter
            prev={prev}
                  next={handleVideoUpload}
                  isFirstStep={isFirstStep}
            isFinalStep={isFinalStep}
            isLoading={isLoading}
          />
        </Container>
      </div>
        </div>
    );
};