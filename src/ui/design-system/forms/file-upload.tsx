import React, { useRef, useState } from 'react';
import { Typography } from '../typography/typography';

interface FileUploadProps {
  label: string;
  accept?: string[];
  maxSizeMo?: number;
  value: File[];
  onChange: (files: File[]) => void;
  required?: boolean;
  errors?: any;
  id?: string;
  placeholder?: string;
  isOptional?: boolean;
  existingFile?: string; // URL du fichier existant
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  maxSizeMo = 5,
  value,
  onChange,
  required = false,
  errors = {},
  id,
  placeholder = "Cliquez pour parcourir",
  isOptional = false,
  existingFile,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptString = accept.join(',');

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') {
      return (
        <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  const getFileNameFromUrl = (url: string) => {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1] || 'Fichier existant';
  };

  const handleFiles = (files: FileList) => {
    const fileArr = Array.from(files);
    
    // Validation taille
    for (let file of fileArr) {
      if (file.size > maxSizeMo * 1024 * 1024) {
        setError(`Le fichier ${file.name} dépasse ${maxSizeMo} Mo.`);
        return;
      }
    }
    
    setError(null);
    onChange(fileArr);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  const hasError = errors && id && errors[id];

  // Afficher les fichiers uploadés OU le fichier existant
  const hasUploadedFiles = value.length > 0;
  const hasExistingFile = existingFile && !hasUploadedFiles;

  return (
    <div className="space-y-2">
      <Typography 
        variant="caption4" 
        component="div" 
        theme={hasError ? "danger" : "gray-600"} 
      >
        {label} {required && <span className="text-red-500">*</span>}
        {isOptional && <span className="text-emerald-600 text-sm ml-2">(optionnel)</span>}
      </Typography>
      
      {hasUploadedFiles ? (
        /* Interface avec fichier uploadé */
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
          {value.map((file, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getFileIcon(file.name)}
                <div>
                  <Typography variant="body-base" weight="medium" theme="black">
                    {file.name}
                  </Typography>
                  <Typography variant="body-sm" theme="gray">
                    {formatFileSize(file.size)}
                  </Typography>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
          <div className="mt-3 pt-3 border-t border-emerald-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-emerald-600 font-medium">✓ Fichier uploadé avec succès</span>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Changer le fichier
              </button>
            </div>
          </div>
        </div>
      ) : hasExistingFile ? (
        /* Interface avec fichier existant */
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(getFileNameFromUrl(existingFile))}
              <div>
                <Typography variant="body-base" weight="medium" theme="black">
                  {getFileNameFromUrl(existingFile)}
                </Typography>
                <Typography variant="body-sm" theme="gray">
                  Fichier existant
                </Typography>
              </div>
            </div>
            <a
              href={existingFile}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all duration-200"
              title="Voir le fichier"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </a>
          </div>
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-600 font-medium">✓ Fichier déjà uploadé</span>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Remplacer le fichier
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Interface upload initial */
        <div 
          className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 hover:border-emerald-400 ${
            dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input 
            ref={inputRef}
            type="file" 
            accept={acceptString}
            onChange={handleInputChange} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <Typography variant="body-sm" weight="medium" theme="black">
              {placeholder}
            </Typography>
            <Typography variant="body-sm" theme="gray">
              JPG, PNG, PDF (max {maxSizeMo} Mo)
            </Typography>
          </div>
        </div>
      )}
      
      {error && (
        <Typography variant="caption4" component="div" theme="danger">
          {error}
        </Typography>
      )}
      
      {hasError && (
        <Typography variant="caption4" component="div" theme="danger">
          {errors[id]?.message}
        </Typography>
      )}
    </div>
  );
}; 