import clsx from "clsx";
import Image from "next/image";
import { Spinner } from "../spinner/spinner";
interface Props {
	size?: "small" | "medium" | "large" | "extra-large";
	src: string;
	alt: string;
	isLoading?: boolean;
}

export const Avatar = ({ size = "medium", src, alt, isLoading }: Props) => {
	let sizeStyles: string ;

	switch (size) {
		case "small":
			sizeStyles = "w-16 h-16"; // Petite taille (valide)
			break;
		case "medium":
			sizeStyles = "w-20 h-20"; // Taille moyenne (valide)
			break;
		case "large":
			sizeStyles = "w-20 h-20"; // Grande taille (valide)
			break;
		case "extra-large":
			sizeStyles = "w-130 h-130"; // Tres Grande taille (valide)
			break;
	}


	return (
	<div className={clsx(
			sizeStyles,
			isLoading && "flex items-center justify-center",
			"relative bg-green-300 rounded-full overflow-x-hidden",
	)}>
	<div
  className={clsx(
    isLoading ? "opacity-40" : "opacity-0",
    "absolute z-10 w-full h-full bg-white animate"
  )}
/>

<Image
  fill
  src={src ? src : "/assets/svg/barrel.svg"}
  alt={alt}
  className={clsx(
    isLoading && "blur-[2px]",
    "object-cover object-center rounded-full animate"
  )}
/>

{isLoading && <Spinner className="relative z-20" />}
	</div>
	);
};
