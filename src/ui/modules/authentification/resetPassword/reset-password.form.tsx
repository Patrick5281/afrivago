import { Button } from "@/ui/design-system/button/button";

import { Box } from "@/ui/design-system/box/box";
import { Input } from "@/ui/design-system/forms/input";

interface ResetPasswordFormProps {
    form: {
        errors: any;
        register: any;
        handleSubmit: any;
        onSubmit: any;
        isLoading: boolean;
    };
}

export const ResetPasswordForm = ({ form }: ResetPasswordFormProps) => {
    const { errors, register, handleSubmit, onSubmit, isLoading } = form;

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Box className="mt-8 space-y-6">
                <Box className="space-y-4">
                    <Input
                        type="password"
                        label="Nouveau mot de passe"
                        placeholder="Entrez votre nouveau mot de passe"
                        errors={errors}
                        id="password"
                        register={register}
                        required={true}
                        errorMsg="Le mot de passe doit contenir au moins 6 caractères"
                        {...register("password", {
                            required: "Le mot de passe est requis",
                            minLength: {
                                value: 6,
                                message: "Le mot de passe doit contenir au moins 6 caractères",
                            },
                        })}
                    />

                    <Input
                        type="password"
                        label="Confirmer le mot de passe"
                        placeholder="Confirmez votre nouveau mot de passe"
                        errors={errors}
                        id="confirmPassword"
                        register={register}
                        required={true}
                        errorMsg="Les mots de passe ne correspondent pas"
                        {...register("confirmPassword", {
                            required: "La confirmation du mot de passe est requise",
                            validate: (value: string) => {
                                const password = (document.getElementById("password") as HTMLInputElement)?.value;
                                return value === password || "Les mots de passe ne correspondent pas";
                            },
                        })}
                    />
                </Box>

                <Button
                    type="submit"
                    variant="accent"
                    isLoading={isLoading}
                >
                    Réinitialiser le mot de passe
                </Button>
            </Box>
        </form>
    );
}; 