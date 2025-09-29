import { RiFacebookBoxFill } from "react-icons/ri";
import { v4 as uuidv4 } from "uuid";
import clsx from "clsx";
import { footerSocialNetworksLinks } from "./app-link";
import { Button } from "@/ui/design-system/button/button";
import { LinkTypes } from "@/lib/link-type";

interface Props {
  theme?: "gray" | "accent" | "secondary";
  className?: string;
}

export const SocialNetworksButtons = ({ className, theme = "accent" }: Props) => {
  const icoList = footerSocialNetworksLinks.map((socialNetwork) => (
    <Button
      key={uuidv4()}
      variant="ico"
      iconTheme={theme}
      icon={{
        icon: socialNetwork.icon || RiFacebookBoxFill,
      }}
      baseUrl={socialNetwork.baseUrl} 
      linkTypes={socialNetwork.type} // Correction ici
    />
  ));

  return <div className={clsx(className, "flex items-center gap-2.5")}>{icoList}</div>;
};
