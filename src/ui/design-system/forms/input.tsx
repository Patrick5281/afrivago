import clsx from "clsx";
import { Typography } from "../typography/typography";

interface Props {
    isLoading?: boolean;
    placeholder?: string;
    type?: "text" | "email" | "password" | "int" | "date";
    register?: any; // Rendre register optionnel
    errors?: any;
    errorMsg?: string;
    required?: boolean;
    isAutocompleted?: boolean;
    label?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value?: string | number;
    id?: string;
    className?: string;
    min?: string | number;
    max?: string | number;
}

export const Input = ({
    isLoading,
    placeholder,
    type = "text",
    register, // Pas de valeur par défaut ici
    errors = {}, // Valeur par défaut pour éviter undefined
    errorMsg = "Tu dois renseigner ce champ",
    required,
    isAutocompleted = false,
    label,
    onChange,
    value,
    id,
    className,
    min,
    max,
}: Props) => {
  // Vérification sécurisée de l'erreur
  const hasError = errors && id && errors[id];
  
  return (
    <div className="space-y-2">
      {label && (
        <Typography 
          variant="caption4" 
          component="div" 
          theme={hasError ? "danger" : "gray-600"} 
        >
          {label}
        </Typography>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className={clsx(
          hasError ? "placeholder-alert-danger text-alert-danger" : "placeholder-gray-600",
          "w-full p-4 font-light border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-primary",
          className
        )}
        disabled={isLoading}
        {...(register && id ? register(id, {
          required: {
            value: required,
            message: errorMsg,
          },
        }) : {})}
        onChange={onChange}
        autoComplete={isAutocompleted ? "on" : "off"}
        value={value}
        id={id}
        min={min}
        max={max}
      />
      {hasError && (
        <Typography variant="caption4" component="div" theme="danger">
          {errors[id]?.message}
        </Typography>
      )}
    </div>
  );
};