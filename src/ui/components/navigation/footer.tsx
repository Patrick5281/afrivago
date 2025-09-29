import { Typography } from "@/ui/design-system/typography/typography";
import { Container } from "../container/container";
import Image from "next/image";
import { footerLinks } from "./app-link"; // Importez footerApplicationLinks
import { v4 as uuidv4 } from "uuid";
import { ActiveLink } from "./active-link";
import { FooterLinks } from "@/types/app-links";
import { LinkTypes } from "@/lib/link-type";
import { SocialNetworksButtons } from "./social-networks-buttons";
import { Logo } from "@/ui/design-system/logo/logo";
import { Mail, MapPin, Phone } from "lucide-react";
import { Input } from "@/ui/design-system/forms/input";


export const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerNavigationList = footerLinks.map((colonnLinks) => (

        <FooterLink key={uuidv4()} data={colonnLinks}/>

    ));

    return (
        <div className="py-6 bg-black">
            <Container className="pt-9 pb-9 space-y-11">
                <div className="flex items-center justify-between">
                       <Logo fill="black" />
                        <div className="">
                        <SocialNetworksButtons theme="gray"/>
                        </div>
                </div>
                <hr className="text-gray-800" />
            </Container>
            <Container className="flex items-center justify-center pt-4">
            <div className="flex gap-7 pb-16">
                <div className="space-y-4">
                        <div>
                        <Typography className="text-sm text-gray-300 mb-4">
                            Simplifiez votre recherche de logement grâce à notre plateforme intelligente.
                        </Typography>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                        <MapPin size={18} className="text-white" />
                        <Typography variant="body-sm" className=" text-white">101 E 123th St, East Chicago, IN 46</Typography>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                        <Phone size={18} className="text-gray-300" />
                        <Typography variant="body-sm" className=" text-white">+230 01 50 90 41 09</Typography>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                        <Mail size={18} className="text-gray-300" />
                        <Typography variant="body-sm" className=" text-white">stephanioeuscarter@gmail.com</Typography>
                        </div>
                </div>
                {footerNavigationList}
                

            <div>
            <h3 className="font-semibold text-white mb-4">Nous Contacter</h3>
            <Typography variant="body-sm" className="text-white mb-4">
              Veuillez nous écrire pour votre séjour. Laissez-nous un mail.
            </Typography>
            <div className="flex items-center space-x-2">
              <Mail size={18} className="text-white" />
              <Typography className="text-sm text-white">Email</Typography>
              
          </div>
          <div className="py-2">
                <Input
                className="bg-black text-white py-3"
                type="text"
                placeholder="nicolesmith@gmail.com"
                />
            </div>
        
          </div>
         



            </div>
            </Container>
            <Container className="pt-9 pb-9 space-y-11">
                <hr className="text-gray-800" />
                <div className="flex items-center justify-center whitespace-nowrap overflow-x-auto w-full">
                    <Typography variant="caption4" theme="gray" className="flex items-center">
                        {`copywrite @ ${currentYear} | Propulsed by `}
                        <a href="" target="_blank" className="underline mx-1">
                            <Logo size="medium" fill="black" />
                        </a>
                        {" - Tout droit réservé"}
                    </Typography>
                </div>
            </Container>
        </div>
    );
};

interface footerLinkProps {
  data: FooterLinks;
}


export const FooterLink = ({data}: footerLinkProps) => {
    const LinksList = data.links.map((link) => (
        <div key={uuidv4()} className="footer-link">
            {link.type === LinkTypes.INTERNAL && (
                <ActiveLink href={link.baseUrl}>
                   {link.label}
                </ActiveLink>
            )}
            {link.type === LinkTypes.EXTERNAL && (
                <a
                    href={link.baseUrl}
                    target="_blank"
                >
                    {link.label}
                </a>
            )}
        </div>
    ));

    return (
        <div className="min-w-[190px]">
            <Typography theme="white" variant="caption2" weight="medium" className="pb-5">
                {data.label}
            </Typography>

            <Typography theme="gray" variant="caption3" className="space-y-5">
                {LinksList}
            </Typography>
        </div>
    );
};
