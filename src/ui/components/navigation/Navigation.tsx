import { Logo } from "@/ui/design-system/logo/logo"
import { Typography } from "@/ui/design-system/typography/typography"
import { Container } from "../container/container"
import { Button } from "@/ui/design-system/button/button"
import Link from "next/link"
import { ActiveLink } from "./active-link"

import { useAuth } from "@/Context/AuthUserContext"
import { AccountAvatarNavigationLink } from "./account-avatar-link"


interface Props {
 
}

export const Navigation = ({

}: Props) => {
    const {authUser} = useAuth();
    console.log("authUser", authUser);

    const authentificationSystem = (
        <div className="flex items-center gap-2">
                <Button baseUrl="/connexion" size="small">Connexion</Button>
                <Button baseUrl="/connexion/inscription" size="small" variant="secondary">Rejoindre</Button>

            </div>
    );
    
    return (

        <div className="border-b-2 border-gray-400">
    <Container className="flex items-center justify-between py-1.5 gap-7">
    <Link href="/">
        <div className="flex items-center gap-2.5 ml-10">
            <Logo />
        </div>
    </Link>
        
        <div className="flex items-center gap-7">
            <Typography variant="caption3" component="div"  className="flex items-center gap-7">
                  <ActiveLink href="/design-system">Devenir Proprietaire</ActiveLink> 
                  <Link href="/projets">Explorer</Link> 
                  <Link href="/contact">Contact</Link> 
            </Typography>
            
            {!authUser ? authentificationSystem : <AccountAvatarNavigationLink /> }

        </div>
     </Container>
        
        </div>
  

    )

        

        
    
}