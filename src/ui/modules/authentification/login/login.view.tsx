import { Box } from "@/ui/design-system/box/box";
import { Typography } from "@/ui/design-system/typography/typography";
import Link from "next/link";
import { Registerform } from "../register/register.form";
import Image from "next/image";
import { Container } from "@/ui/components/container/container";
import { Loginform } from "./login.form";
import { FormsType } from "@/types/forms";
import LottieLoginAnimation from "public/assets/animation/LottieLoginAnimation";


interface Props {
    form: FormsType;
}

export const LoginView = ({form}: Props) => {
    return (
    
        <Container className="grid grid-cols-2 gap-2 mb-24">
        <div>
            <div className="relative w-full h-[460px]">
             <LottieLoginAnimation />
            </div>

        </div>

        <div className="flex items-center">
            <Box padding_y = "py-5">
                <div className="flex items-center justify-between">
                    <Typography variant="h5" component="h1">
                        Connexion
                    </Typography>

                    <div className="flex items-center gap-2">
                    <Typography variant="caption4" component="span" theme="gray">
                        N'avez-vous pas de compte ?
                    </Typography>
                    <Typography variant="caption4" component="span" theme="primary">
                        <Link href="/connexion/inscription">S'inscrire</Link>
                    </Typography>
                </div>

                </div>

              <Loginform form={form} /> 
            <Typography variant="caption4" theme="primary">
                <Link
                    href="/connexion/mots-de-passe"
                    className="flex justify-center"
                >
                    Mot de passe perdu ?
                </Link>
            </Typography>

            </Box>
        </div>
    </Container>

    )
};