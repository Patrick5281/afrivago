import { SubmitHandler, useForm } from "react-hook-form";
import { ResetPasswordView } from "./reset-password.view";
import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

interface ResetPasswordFormFieldsType {
    password: string;
    confirmPassword: string;
}

export const ResetPasswordContainner = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const {
        handleSubmit,
        register,
        reset,
        formState,
    } = useForm<ResetPasswordFormFieldsType>({
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const { errors } = formState;

    const onSubmit: SubmitHandler<ResetPasswordFormFieldsType> = async ({ password }) => {
        try {
            setIsLoading(true);
            if (password.length <= 5) {
                toast.error("Le mot de passe doit comporter au minimum 6 caractères");
                setIsLoading(false);
                return;
            }
            // Récupérer le token de l'URL (query string ?token=...)
            const token = router.query.token as string;
            if (!token) {
                toast.error("Token de réinitialisation manquant");
                setIsLoading(false);
                return;
            }
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Erreur inconnue');
            }
            toast.success("Votre mot de passe a été réinitialisé avec succès");
            reset();
            router.push("/connexion");
        } catch (error: any) {
            toast.error("Une erreur est survenue lors de la réinitialisation du mot de passe");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ResetPasswordView
            form={{
                errors,
                register,
                handleSubmit,
                onSubmit,
                isLoading,
            }}
        />
    );
}; 