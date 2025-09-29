import { SubmitHandler, useForm } from "react-hook-form";
import { ForgetPasswordView } from "./forget-password.view";
import { useState } from "react";
import { ForgetPasswordFormFielsType } from "@/types/forms";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

export const ForgetPasswordContainner = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const {
        handleSubmit,
        formState: { errors },
        register,
        reset,
    } = useForm<ForgetPasswordFormFielsType>();

    const handleResetPassword = async ({ email }: ForgetPasswordFormFielsType) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/forget-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Erreur inconnue');
            }
            toast.success(`Un email a été expédié à votre adresse ${email}`);
            reset();
            router.push("/connexion");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit: SubmitHandler<ForgetPasswordFormFielsType> = async (formData) => {
        if (!formData.email) {
            toast.error("Veuillez renseigner votre adresse email.");
            return;
        }
        await handleResetPassword(formData);
    };

    return (
        <ForgetPasswordView
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
