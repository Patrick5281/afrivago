import { Seo } from "@/ui/components/seo/seo";
import { Layout } from "@/ui/components/layout/layout";
import { RegisterContainer } from "@/ui/modules/authentification/register/register.containner";
import { GUEST } from "@/lib/session-status";
export default function Register() {
    return (
        <> 
            <Seo title="Register" description="Page d'inscription" />
            <Layout sessionStatus={GUEST}>
               <RegisterContainer /> 
            </Layout>
        </>
    );
}
