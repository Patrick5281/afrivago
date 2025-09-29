import { Seo } from "@/ui/components/seo/seo";
import { Layout } from "@/ui/components/layout/layout";
import { LandingPageContainer } from "@/ui/modules/landing-page/coponents/landing-page.container";
export default function Home() {
    return (
        <> 
            <Seo title="afrivago" description="Description...." />
            <Layout isDisplayBreadcrumbs={false}>
                <LandingPageContainer />
            </Layout>
        </>
    );
}
