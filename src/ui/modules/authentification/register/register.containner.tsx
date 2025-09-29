import { SubmitHandler, useForm } from "react-hook-form";
import { RegisterView } from "./register.view";
import { RegisterFormFielsType } from "@/types/forms";
import { toast } from "react-toastify";
import { useToggle } from "@/hooks/use-toggle";
import { Button } from "@/ui/design-system/button/button";
import { useEffect, useState } from "react";
import { Role } from "@/types/roles";

export const RegisterContainer = () => {
    const { value: isLoading, setvalue: setIsLoading, toggle } = useToggle({ initial: true });
    const [roles, setRoles] = useState<Role[]>([]);
    
    const {
        handleSubmit,
        formState: { errors },
        register,
        setError,
        reset,
    } = useForm<RegisterFormFielsType>();

    useEffect(() => {
        const fetchRoles = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/auth/roles');
                const result = await response.json();
                if (response.ok) {
                    setRoles(result.roles || []);
                } else {
                    setRoles([]);
                    toast.error(result.error || "Erreur lors de la récupération des rôles");
                }
            } catch (err) {
                setRoles([]);
                toast.error("Erreur lors de la récupération des rôles");
            } finally {
                setIsLoading(false);
            }
        };
        fetchRoles();
    }, [setIsLoading]);

    const handleCreateUserAuthentication = async ({
        email,
        password,
        roleId,
    }: RegisterFormFielsType) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, roleId }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Erreur inconnue');
            }
            toast.success("Inscription réussie !");
            reset();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit: SubmitHandler<RegisterFormFielsType> = async (formData) => {
        setIsLoading(true);
        const { password, roleId } = formData;
        if (password.length <= 5) {
          setError("password", {
            type: "manual",
            message: "Ton mot de passe doit comporter au minimum 6 caractères",
          });
          toast.error("Ton mot de passe doit comporter au minimum 6 caractères");
          setIsLoading(false);
          return;
        }
        if (!roleId) {
          setError("roleId", {
            type: "manual",
            message: "Tu dois sélectionner un rôle",
          });
          toast.error("Tu dois sélectionner un rôle");
          setIsLoading(false);
          return;
        }
        await handleCreateUserAuthentication(formData);
    };

    return (
        <>
          <RegisterView
            form={{
                errors,
                register,
                handleSubmit,
                onSubmit,
                isLoading,
            }}
            roles={roles}
          />
        </>
    );
};