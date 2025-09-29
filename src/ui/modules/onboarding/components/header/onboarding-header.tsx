import { Logo } from "@/ui/design-system/logo/logo";
import clsx from "clsx";

interface OnboardingHeaderProps {
  className?: string;
}

export const OnboardingHeader = ({ className }: OnboardingHeaderProps) => {
  return (
    <header className={clsx("py-4 px-6", className)}>
      <div className="container mx-auto">
        <Logo />
      </div>
    </header>
  );
};