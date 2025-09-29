import { Seo } from "@/ui/components/seo/seo";
import { Layout } from "@/ui/components/layout/layout";
import { ForgetPasswordContainner } from "@/ui/modules/authentification/forget-password/forget-password.containner";
import { GUEST } from "@/lib/session-status";
export default function ForgetPassword() {
    return (
        <> 
            <Seo title="ForgetPassword" description="Page de connexion" />
            <Layout sessionStatus={GUEST}>
               <ForgetPasswordContainner /> 
            </Layout>
        </>
    );
}
