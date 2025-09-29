import clsx from "clsx";
interface Props {
	size?: "small" | "medium" | "large";
	variant?: "primary" | "white";
  className?: string
}

export const Spinner = ({ size = "medium", variant = "primary",className }: Props) => {
	let variantStyles: string, sizeStyles: string;

	switch (size) {
		case "small":
			sizeStyles = "w-5 h-5";
			break;
		case "medium": // Valeur par défaut
			sizeStyles = "w-9 h-9";
			break;
		case "large":
			sizeStyles = "w-12 h-12";
			break;
	}

	switch (variant) {
		case "primary":
			variantStyles = "text-primary";
			break;
		case "white": // Valeur par défaut
			variantStyles = "text-white";
			break;
	}

	return (
        <svg
        role="spinner"
        className={clsx(sizeStyles, variantStyles,"animate-spin", className)}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 50 50"
        fill="none"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          stroke="currentColor"
          strokeWidth="4"
          className="opacity-25"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="4"
          d="M25 5
             A20 20 0 0 1 45 25"
          className="opacity-75"
        />
      </svg>
      
	);
};
