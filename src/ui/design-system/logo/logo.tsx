import clsx from "clsx";
type Props = {
    size?: "very-small" | "small" | "medium" | "large" | "very-large";
    fill?: "white" | "black";  // Nouvelle propriété pour la couleur de fond
};

export const Logo = ({ size = "large", fill = "white" }: Props) => {
    const sizeClasses = {
        "very-small": "w-[34px]",
        "small": "w-[61px]",
        "medium": "w-[100px]",
        "large": "w-[240px]",
        "very-large": "w-[440px]"
    };

    return (
        <div className={clsx(sizeClasses[size])}>
            <svg viewBox="0 0 400 130" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="130" fill={fill} />
    <text x="200" y="85" font-family="Arial" font-weight="bold" font-size="48" text-anchor="middle">
        <tspan fill="#007749">afri</tspan><tspan fill="#FDB813">va</tspan><tspan fill="#CE1126">go</tspan>
    </text>
    </svg>
            
        </div>
    );
};
