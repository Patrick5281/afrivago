import { useEffect, useState } from "react";
import { LoginView } from "./login.view"
import { SubmitHandler, useForm } from "react-hook-form";
import { LoginFormFielsType } from "@/types/forms";
import { useToggle } from "@/hooks/use-toggle";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { getUserRoles, handleRoleSelection } from "@/services/roleServices";
import { useRoleContext } from "@/Context/RoleContext";
import RoleSelectorModal from "@/ui/components/session/role-selector";
import { Role } from "@/types/roles";
import { useAuth as useAuthUserContext } from "@/Context/AuthUserContext";

export const LoginContainer = () => {
    const router = useRouter()
    const {value:isLoading, setvalue:setIsLoading} = useToggle();
    const [showRoleSelector, setShowRoleSelector] = useState(false);
    const { setActiveRole, setIsRoleReady, userRoles } = useRoleContext();
    const [roles, setRoles] = useState<Role[]>([]);
    const { setAuthUser } = useAuthUserContext();
    
    const {
        handleSubmit,
        formState: { errors },
        register,
        setError,
        reset,
    } = useForm<LoginFormFielsType>();

    const checkOwnerRequest = async (userId: string) => {
        try {
            const response = await fetch(`/api/owner/status?user_id=${userId}`);
            const data = await response.json();
            return data.demande;
        } catch (error) {
            return null;
        }
    };
    
    const handleSignInUser = async ({ email, password }: LoginFormFielsType) => {
        console.time('LOGIN_TOTAL');
        setIsLoading(true);
        try {
            console.time('LOGIN_API');
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });
            console.timeEnd('LOGIN_API');
            const result = await response.json();
            if (!response.ok) {
                if (result.code === "auth/invalid-email" || result.code === "auth/invalid-login-credentials") {
                    setError("email", {
                        type: "manual",
                        message: "Email ou mot de passe invalide",
                    });
                    toast.error("Email ou mot de passe invalide");
                } else {
                    toast.error(result.error || "Erreur lors de la connexion");
                }
                setIsLoading(false);
                return;
            }
            toast.success("Bienvenue ! Connexion réussie.");
            reset();
            // Stockage de l'utilisateur enrichi dans le localStorage
            localStorage.setItem('user', JSON.stringify(result.user));
            setAuthUser(result.user);
            const userId = result.user.id;
            console.time('LOGIN_ROLES');
            const userRoles = await getUserRoles(userId);
            console.timeEnd('LOGIN_ROLES');
            setRoles(userRoles);
            // Optimisation : update contexte rôle AVANT redirection
            if (userRoles.length === 1) {
                const role = userRoles[0];
                setActiveRole(role);
                setIsRoleReady(true);
                // SUPPRIMÉ : router.replace('/');
                // On laisse le composant Session router selon l'onboarding
            } else if (userRoles.length > 1) {
                setShowRoleSelector(true);
            } else {
                toast.error("Erreur lors de la récupération des rôles de l'utilisateur");
            }
        } catch (err: any) {
            toast.error("Erreur lors de la connexion");
        } finally {
            setIsLoading(false);
            console.timeEnd('LOGIN_TOTAL');
        }
    };
   
    const onSubmit: SubmitHandler<LoginFormFielsType> = async (formData) => {
        setIsLoading(true)
        const {password} = formData;
        
        if (password.length <= 5) {
            setError("password", {
                type: "manual",
                message: "Votre mot de passe doit comporter au minimum 6 caractères",
            });
            setIsLoading(false);
            return;
        }
        handleSignInUser(formData);
    };
    
    const handleRoleSelect = async (role: Role) => {
        setActiveRole(role);
        setIsRoleReady(true);
        setShowRoleSelector(false);
        toast.success(`Connecté avec le rôle : ${role.nom}`);
        // SUPPRIMÉ : router.replace('/');
        // On laisse le composant Session router selon l'onboarding
    };
    
    return (
        <>
            <LoginView
                form={{
                    errors,
                    register,
                    handleSubmit,
                    onSubmit,
                    isLoading,
                }}
            />
            {showRoleSelector && (
                <RoleSelectorModal
                    roles={roles}
                    onSelect={handleRoleSelect}
                />
            )}
        </>
    );
}