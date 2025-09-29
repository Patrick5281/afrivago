import clsx from "clsx";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import React from "react";

// Définir un type pour les options du select
type SelectOption = string | { value: string; label: string };

interface Props {
  label: string;
  isLoading?: boolean;
  register: UseFormRegister<any>;
  errors: FieldErrors;
  errorMsg?: string;
  id: string;
  required?: boolean;
  options: SelectOption[];
  defaultOption?: string; // Option par défaut optionnelle
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const Select = ({
  label,
  isLoading,
  register,
  errors,
  errorMsg = "Ce champ est obligatoire",
  id,
  required = false,
  options,
  defaultOption,
  onChange,
}: Props) => {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          className={clsx(
            errors[id] ? "placeholder-alert-danger text-alert-danger" : "placeholder-gray-600",
            "w-full p-4 font-light border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-primary"
          )}
          disabled={isLoading}
          {...register(id, { required: required && errorMsg })}
          onChange={onChange}
        >
          {/* Option par défaut si elle est fournie */}
          {defaultOption && (
            <option value="" disabled>
              {defaultOption}
            </option>
          )}
          
          {/* Mapper à travers les options et déterminer leur type */}
          {options.map((option, index) => {
            if (typeof option === 'string') {
              // Si l'option est une chaîne de caractères
              return (
                <option key={`${option}-${index}`} value={option}>
                  {option}
                </option>
              );
            } else {
              // Si l'option est un objet avec value et label
              return (
                <option key={`${option.value}-${index}`} value={option.value}>
                  {option.label}
                </option>
              );
            }
          })}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {errors[id] && (
        <p className="text-red-500 text-sm">
          {errors[id]?.message as string}
        </p>
      )}
    </div>
  );
};