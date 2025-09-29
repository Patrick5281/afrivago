import { Container } from "@/ui/components/container/container";
import { Box } from "@/ui/design-system/box/box";
import { Typography } from "@/ui/design-system/typography/typography";
import Image from "next/image";
import Link from "next/link";
import { Registerform } from "./register.form";
import { FormsType } from "@/types/forms";
import { Role } from "@/types/roles";
import LottieRegisterAnimation from "public/assets/animation/LottieRegisterAnimation";
interface Props {
    form: FormsType;
    roles: Role[];
}

export const RegisterView = ({ form, roles }: Props) => {
    return (
        <Container className="grid grid-cols-2 gap-2 mb-24">
            <div>
               
           <div className="relative w-full h-[531px]">
    <LottieRegisterAnimation />
</div>
            </div>

            <div className="flex items-center">
                <Box padding_y = "py-5">
                    <div className="flex items-center justify-between">
                        <Typography variant="h5" component="h1">
                            Inscription
                        </Typography>

                        <div className="flex items-center gap-2">
                        <Typography variant="caption4" component="span" theme="gray">
                            Avez-vous déjà un compte ?
                        </Typography>
                        <Typography variant="caption4" component="span" theme="primary">
                            <Link href="/connexion">Connexion</Link>
                        </Typography>
                    </div>

                    </div>

                  <Registerform form={form} roles={roles}/> 
                <Typography
                    variant="caption4"
                    theme="gray"
                    className="max-w-md mx-auto space-y-1 text-center"
                    >
                    <div>En vous inscrivant, vous acceptez les</div>
                    <div>
                        <Link href="/" className="text-gray">
                        Conditions d'utilisation
                        </Link>{" "}
                        et nos {" "}
                        <Link href="/" className="text-gray">
                        Politiques de confidentialités
                        </Link>
                    </div>
                </Typography>

                </Box>
            </div>
        </Container>
    );
};