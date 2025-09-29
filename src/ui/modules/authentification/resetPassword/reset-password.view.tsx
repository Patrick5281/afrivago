
import { Typography } from "@/ui/design-system/typography/typography";
import { ResetPasswordForm } from "./reset-password.form";
import { Box } from "@/ui/design-system/box/box";
import Link from "next/link";
import { Container } from "@/ui/components/container/container";


interface ResetPasswordViewProps {
    form: {
        errors: any;
        register: any;
        handleSubmit: any;
        onSubmit: any;
        isLoading: boolean;
    };
}

export const ResetPasswordView = ({ form }: ResetPasswordViewProps) => {
    return (
        <Container>
            <Box className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
                <Box className="max-w-md w-full space-y-8">
                    <Box className="text-center">
                        <Typography variant="h1" component="h1" className="text-2xl font-bold">
                            Réinitialisation du mot de passe
                        </Typography>
                        <Typography variant="body-base" component="p" className="mt-2 text-gray-600">
                            Veuillez entrer votre nouveau mot de passe
                        </Typography>
                    </Box>

                    <ResetPasswordForm form={form} />

                    <Box className="text-center">
                        <Link href="/connexion" className="text-sm text-gray-600 hover:text-gray-900">
                            Retour à la connexion
                        </Link>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
}; 