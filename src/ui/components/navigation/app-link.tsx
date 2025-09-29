import { AppLinks } from "@/types/app-links";
import { RiFacebookBoxFill, RiInstagramFill, RiLinkedinFill, RiSlackFill, RiWhatsappFill, RiYoutubeFill } from "react-icons/ri";

const footerApplicationLinks: AppLinks[] = [
    {
        label: "Accueil",
        baseUrl: "/",
        type:"internal",
    },
    {
        label: "Afrivago Business",
        baseUrl: "/#",
        type:"internal",
    },
    {
        label: "Devenir Proprietaire",
        baseUrl: "/#",
        type:"internal",
    },
    {
        label: "Explorer",
        baseUrl: "/#",
        type:"internal",
    },
];
const footerUsersLinks: AppLinks[] = [
    {
        label: "Mon Espace",
        baseUrl: "/@",
        type:"internal",
    },
    {
        label: "Connexion",
        baseUrl: "/connexion",
        type:"internal",
    },
    {
        label: "Inscription",
        baseUrl: "/connexion/inscription",
        type:"internal",
    },
    {
        label: "Mots de passe oublié",
        baseUrl: "/connexion/mots-de-passe",
        type:"internal",
    },
];
const footerInformationsLinks: AppLinks[] = [
    {
        label: "CGU",
        baseUrl: "/@",
        type:"internal",
    },
    {
        label: "Confidentialité",
        baseUrl: "/@",
        type:"internal",
    },
    {
        label: "A propos",
        baseUrl: "/@",
        type:"internal",
    },
    {
        label: "Contact",
        baseUrl: "/@",
        type:"internal",
    },
];
export const footerSocialNetworksLinks: AppLinks[] = [
    {
        label: "Facebook",
        baseUrl: "/@",
        type:"external",
        icon: RiFacebookBoxFill,
    },
    {
        label: "Instagram",
        baseUrl: "/@",
        type:"external",
        icon: RiInstagramFill,
    },
    {
        label: "WhatsApp",
        baseUrl: "/@",
        type:"external",
        icon: RiWhatsappFill,
    },
   
];

export const footerLinks = [
    {
        label: "App",
        links: footerApplicationLinks,
    },
    {
        label: "Users",
        links: footerUsersLinks,
    },
   
];
