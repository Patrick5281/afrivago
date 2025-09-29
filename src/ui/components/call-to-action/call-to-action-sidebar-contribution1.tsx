import { Button } from "@/ui/design-system/button/button";
import { Typography } from "@/ui/design-system/typography/typography";
import Image from "next/image";

export const CallsToActionSideBarGroup1 = () => {
  return (
    <div className="relative flex flex-col justify-center gap-5 px-8 py-12 overflow-hidden rounded pb-44 bg-secondary">
      <Typography variant="lead" weight="medium" className="text-center">
        Rejoins le groupe
      </Typography>
      <div className="flex justify-center">
        <Button
          variant="sucess"
          baseUrl="https://google.com"
          linkTypes="external"
        >
          Rejoindre
        </Button>
      </div>
      <Image
        width={215}
        height={215}
        src="/assets/svg/slack-ico.svg"
        alt="Serveur Slack"
        className="absolute transform -translate-x-1/2 -bottom-16 left-1/2"
      />
    </div>
  );
};