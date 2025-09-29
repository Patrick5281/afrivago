// COMPONENTS
import { Container } from "@/ui/components/container/container"
import { Layout } from "@/ui/components/layout/layout"
import { Navigation } from "@/ui/components/navigation/Navigation"
import { Seo } from "@/ui/components/seo/seo"
// DESIGN SYSTEM
import { Avatar } from "@/ui/design-system/avatar/avatar"
import { Button } from "@/ui/design-system/button/button"
import { Logo } from "@/ui/design-system/logo/logo"
import { Spinner } from "@/ui/design-system/spinner/spinner"
import { Typography } from "@/ui/design-system/typography/typography"
// ICO
import { RiUser6Fill } from "react-icons/ri"

export default function DesignSystem() {

    return (
        <> 
        <Seo title="ProjetX" description="Description...." />
        <Layout>
        <Container className="py-18 space-y-18">
            <div className="flex place-items-center gap-4 p-10">
                <Spinner size="medium" variant="primary" />
                <Spinner size="large" variant="primary" />
                <Button size="medium" variant="secondary" icon={{ icon: RiUser6Fill }}> Help?</Button>
                <Button isLoading size="small"> Help?</Button>
                <Button isLoading size="small" variant="secondary">Secondary</Button>
                <Button isLoading size="small" variant="outLine">Accent</Button>
                <Button isLoading size="small" variant="disabled">Disabled</Button>
                <Button size="small" variant="ico" icon={{ icon: RiUser6Fill }} />
            </div>

            <div className="flex place-items-center gap-4 p-10">
                <Spinner size="medium" variant="primary" />
                <Spinner size="large" variant="primary" />
                <Button size="medium" variant="secondary" icon={{ icon: RiUser6Fill }}> Help?</Button>
                <Button size="small" icon={{ icon: RiUser6Fill }} iconPosition="left"> ZARA</Button>
                                <Button size="small" variant="warning">Yellow</Button>
                                 <Button size="small" variant="danger">red</Button>
                <Button size="small" variant="secondary">Secondary</Button>
                <Button size="small" variant="outLine">Accent</Button>
                <Button size="small" variant="disabled">Disabled</Button>
                <Button size="small" variant="ico" icon={{ icon: RiUser6Fill }} />
            </div>

            <div className="flex place-items-center gap-4 p-10">
                <Logo size="very-small" />
                <Logo size="small" />
                <Logo size="medium" />
                <Logo size="large" />
            </div>

            <div className="flex place-items-center gap-4 p-10">
                <Avatar size="small" src="/assets/images/austin.jpg" alt="Image de ezertyui" />
                <Avatar size="medium" src="/assets/images/austin.jpg" alt="Image de ezertyui" />
                <Avatar size="large" src="/assets/images/austin.jpg" alt="Image de ezertyui" />
            </div>

            <div className="flex place-items-center gap-4 p-10">
                <Button>Accent</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outLine">Outline</Button>
                <Button variant="disabled">Disabled</Button>
                <Button variant="ico" icon={{ icon: RiUser6Fill }} />
            </div>

            <div className="flex place-items-center gap-4 p-10">
                <Button size="large">Accent</Button>
                <Button size="large" variant="secondary">Secondary</Button>
                <Button size="large" variant="secondary">Secondary</Button>
                <Button size="large" variant="outLine">Outline</Button>
                <Button size="large" variant="disabled">Disabled</Button>
                <Button size="large" variant="ico" iconTheme="secondary" icon={{ icon: RiUser6Fill }} />
                <Button size="large" variant="ico" iconTheme="gray" icon={{ icon: RiUser6Fill }} />
                <Button size="large" variant="ico" icon={{ icon: RiUser6Fill }} />
            </div>

            <div className="space-y-5">
                <Typography theme="primary" variant="display">ProjetX</Typography>
                <Typography theme="secondary" variant="h1">ProjetX</Typography>
                <Typography variant="lead">ProjetX</Typography>
                <Typography variant="body-sm">ProjetX</Typography>
                <Typography variant="caption4">ProjetX</Typography>
                <Typography variant="caption4" weight="medium">ProjetX</Typography>
            </div>
        </Container>
        </Layout>
        </>
    );

}