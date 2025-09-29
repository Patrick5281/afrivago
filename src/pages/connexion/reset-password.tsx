import { Seo } from "@/ui/components/seo/seo";
import { Layout } from "@/ui/components/layout/layout";
import { ResetPasswordContainner } from "@/ui/modules/authentification/resetPassword/reset-password.containner";
import { GUEST } from "@/lib/session-status";

export default function ResetPassword() {
    return (
        <>
            <Seo title="Reset Password" description="Page de réinitialisation de mot de passe" />
            <Layout sessionStatus={GUEST}>
                <ResetPasswordContainner />
            </Layout>
        </>
    );
} 