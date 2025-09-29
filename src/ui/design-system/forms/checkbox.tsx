import React from 'react';
import { FieldErrors, UseFormRegister } from "react-hook-form";

interface Props {
  id: string;
  label: string;
  checked?: boolean;
  value?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  register?: UseFormRegister<any>;
  errors?: FieldErrors;
}

export const Checkbox: React.FC<Props> = ({
  id,
  label,
  checked,
  value,
  onChange,
  register,
  errors,
}) => {
  const hasError = errors && errors[id];

  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center">
        <input
          type="checkbox"
          id={id}
          className={`w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 ${
            hasError ? 'border-red-500 ring-red-500' : ''
          }`}
          {...(typeof checked !== 'undefined' ? { checked, onChange } : {})}
          {...(typeof value !== 'undefined' && typeof checked === 'undefined' ? { checked: value, onChange } : {})}
          {...(register && typeof checked === 'undefined' && typeof value === 'undefined' ? register(id) : {})}
        />
        <label htmlFor={id} className="ml-2 block text-sm text-gray-900">
          {label}
        </label>
      </div>
      {hasError && (
        <p className="text-sm text-red-500">
          {(errors as any)[id]?.message || 'Ce champ est requis'}
        </p>
      )}
    </div>
  );
};
