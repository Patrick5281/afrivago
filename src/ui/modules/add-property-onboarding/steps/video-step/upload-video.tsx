// UploadVideo.tsx
import { useState } from "react";
import clsx from "clsx";
import { RiVideoAddFill } from "react-icons/ri";
import { FaTrashAlt, FaPlay } from "react-icons/fa";

interface Props {
  handleVideoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveVideo: (index: number) => void;
  videosPreview: { file: File; url: string }[];
  uploadProgress: number;
  isLoading: boolean;
  max?: number;
  maxSizeMB?: number;
}

export const UploadVideo = ({
  handleVideoSelect,
  handleRemoveVideo,
  videosPreview,
  uploadProgress,
  isLoading,
  max = 1,
  maxSizeMB = 30,
}: Props) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Barre de progression */}
      {uploadProgress > 0 && (
        <div className="relative w-full h-2 bg-gray-200 rounded overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300 ease-in-out"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {/* Preview des vidéos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {videosPreview.map((video, index) => (
          <div
            key={index}
            className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-300 shadow-sm bg-black"
          >
            <video
              src={video.url}
              className="w-full h-full object-cover"
              controls={false}
              muted
            />
            
            {/* Overlay avec informations */}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="text-center text-white">
                <FaPlay className="mx-auto mb-2" size={24} />
                <p className="text-sm font-medium">{video.file.name}</p>
                <p className="text-xs opacity-80">{formatFileSize(video.file.size)}</p>
              </div>
            </div>

            {/* Bouton de suppression */}
            <button
              type="button"
              onClick={() => handleRemoveVideo(index)}
              className="absolute top-2 right-2 bg-white/80 hover:bg-red-500 hover:text-white text-red-600 rounded-full p-2 shadow"
              disabled={isLoading}
            >
              <FaTrashAlt size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Bouton d'ajout */}
      {videosPreview.length < max && (
        <label
          className={clsx(
            isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            "flex items-center gap-2 px-4 py-2 rounded bg-primary text-white hover:bg-primary-600 w-fit"
          )}
        >
          <RiVideoAddFill className="text-lg" />
          <span>
            Ajouter {videosPreview.length === 0 ? "une vidéo" : "des vidéos"} ({videosPreview.length}/{max})
          </span>
          <input
            type="file"
            multiple={max > 1}
            accept="video/*"
            className="hidden"
            onChange={handleVideoSelect}
            disabled={isLoading || videosPreview.length >= max}
          />
        </label>
      )}

      {/* Infos */}
      <div className="text-sm text-gray-500 space-y-1">
        <p>Maximum {max} vidéo{max > 1 ? "s" : ""}.</p>
        <p>Taille maximale par vidéo : {maxSizeMB} MB</p>
        <p>Formats acceptés : MP4, MOV, AVI, WebM</p>
      </div>
    </div>
  );
};