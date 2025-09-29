import React from 'react';

interface ConfirmModalProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ open, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs">
        <div className="mb-4 text-center">{message}</div>
        <div className="flex justify-center gap-4">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onCancel}>Annuler</button>
          <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={onConfirm}>Confirmer</button>
        </div>
      </div>
    </div>
  );
}; 