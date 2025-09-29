import React, { useRef } from 'react';

interface UploadProps {
  label?: string;
  accept?: string[]; // ex: ['image/jpeg', 'image/png']
  maxSizeMo?: number; // taille max par fichier en Mo
  minFiles?: number;
  maxFiles?: number;
  value: File[];
  onChange: (files: File[]) => void;
}

export const Upload: React.FC<UploadProps> = ({
  label = 'Ajouter des fichiers',
  accept = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  maxSizeMo = 3,
  minFiles = 2,
  maxFiles = 4,
  value,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState(false);

  const acceptString = accept.join(',');

  const handleFiles = (files: FileList | File[]) => {
    let fileArr = Array.from(files);
    // Validation nombre
    if (fileArr.length + value.length > maxFiles) {
      setError(`Vous ne pouvez pas ajouter plus de ${maxFiles} fichiers.`);
      return;
    }
    // Validation extensions et taille
    for (let file of fileArr) {
      if (!accept.includes(file.type)) {
        setError(`Extension non autorisée : ${file.name}`);
        return;
      }
      if (file.size > maxSizeMo * 1024 * 1024) {
        setError(`Le fichier ${file.name} dépasse ${maxSizeMo} Mo.`);
        return;
      }
    }
    setError(null);
    onChange([...value, ...fileArr]);
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

  const handleRemove = (idx: number) => {
    const newArr = value.filter((_, i) => i !== idx);
    onChange(newArr);
  };

  return (
    <div className="w-full">
      {label && <label className="block font-medium mb-2">{label}</label>}
      <div
        className={`border-2 border-dashed rounded p-4 flex flex-col items-center justify-center cursor-pointer transition ${dragActive ? 'border-primary bg-primary/10' : 'border-gray-300 bg-gray-50'}`}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptString}
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
        <span className="text-gray-600 text-sm mb-2">Glissez-déposez vos images ici ou cliquez pour sélectionner</span>
        <span className="text-xs text-gray-500 mb-2">{`Extensions autorisées : ${accept.map(a => a.split('/')[1].toUpperCase()).join(', ')} | Taille max : ${maxSizeMo} Mo | Min : ${minFiles} - Max : ${maxFiles}`}</span>
        {error && <span className="text-red-500 text-xs mt-2">{error}</span>}
      </div>
      {/* Preview */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-4">
          {value.map((file, idx) => (
            <div key={idx} className="relative w-24 h-24 group">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="object-cover w-full h-full rounded shadow"
              />
              <button
                type="button"
                className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-red-500 hover:text-red-700"
                onClick={e => {
                  e.stopPropagation();
                  handleRemove(idx);
                }}
                title="Retirer cette image"
              >
                &#10005;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 