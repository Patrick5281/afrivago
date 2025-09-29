import clsx from "clsx";
import { Typography } from "../typography/typography";

interface Props {
    isLoading?: boolean; // Rendu optionnel
    placeholder?: string; // Rendu optionnel
    rows?: number;
    register?: any; // Rendu optionnel
    errors?: any; // Rendu optionnel
    errorMsg?: string;
    id?: string; // Rendu optionnel
    required?: boolean;
    isAutocompleted?: boolean;
    label?: string; // Rendu optionnel
}

export const Textarea = ({
    rows = 5,
    placeholder,
    isLoading = false, // Valeur par défaut
    register, // Pas de valeur par défaut
    errors = {}, // Valeur par défaut pour éviter undefined
    errorMsg = "Tu dois renseigner ce champ",
    id = "", // Valeur par défaut
    required = true,
    isAutocompleted = false,
    label,
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
            <textarea
                rows={rows}
                placeholder={placeholder}
                className={clsx(
                    'bg-gray-300',
                    isLoading ? 'cursor-not-allowed bg-white' : '',
                    hasError ? ['placeholder-alert-danger', 'text-alert-danger'] : '',
                    'placeholder-gray-600',
                    'w-full p-4 font-light border rounded focus:outline-none focus:ring-1 focus:ring-primary border-gray-400'
                )}
                disabled={isLoading}
                {...(register && id ? register(id, {
                    required: {
                        value: required,
                        message: errorMsg,
                    }
                }) : {})}
                autoComplete={isAutocompleted ? "on" : "off"}
            />
            {hasError && (
                <Typography variant="caption4" component="div" theme="danger">
                    {errors[id]?.message}
                </Typography>
            )}
        </div>
    );
};