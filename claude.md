/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        colors: {
            white: "#ffffff",
            black: "#000000", // Noir pur ajouté
            green: "#1d8200", // Vert pur ajouté
            red: "#FF0000",   // Rouge pur ajouté
            yellow: "#FFFF00", // Jaune pur ajouté
            blue: "#1D4ED8",
            pink: "#900",
            primary: {
                200: "#b9f2c9",     // vert très clair
                300: "#7ddf99",     // vert clair
                400: "#4fc86e",     // vert moyen
                DEFAULT: "#1d8200", // vert de base (personnalisé)
                600: "#166300",     // vert foncé
                700: "#0f3b1a",     // ✅ vert nuit (ultra foncé)
            },
            secondary: {
                200: "#eaf8f4",
                300: "#bfe9de",
                400: "#56c4a7",
                DEFAULT: "#2AB691",
                600: "#26a482",
            },
            gray: {
                50: "#f9fafb",      // Ajouté - gris très clair
                100: "#f3f4f6",     // Ajouté - gris clair
                200: "#e5e7eb",     // Ajouté - gris clair moyen
                300: "#fafafa",     // Votre gris existant
                400: "#f2f2f2",     // Votre gris existant
                500: "#e5e5e5",     // Votre gris existant
                600: "#b2b2b2",     // Votre gris existant
                700: "#808080",     // Votre gris existant
                800: "#333333",     // Votre gris existant
                900: "#1f2937",     // Ajouté - gris très foncé
                DEFAULT: "#1D1D1D",
            },
            // Ajout des couleurs utilisées dans le dashboard
            orange: {
                50: "#fff7ed",
                100: "#ffedd5",
                200: "#fed7aa",
                300: "#fdba74",
                400: "#fb923c",
                500: "#f97316",
                600: "#ea580c",
                700: "#c2410c",
                800: "#9a3412",
                900: "#7c2d12",
            },
            purple: {
                50: "#faf5ff",
                100: "#f3e8ff",
                200: "#e9d5ff",
                300: "#d8b4fe",
                400: "#c084fc",
                500: "#a855f7",
                600: "#9333ea",
                700: "#7c3aed",
                800: "#6b21a8",
                900: "#581c87",
            },
            indigo: {
                50: "#eef2ff",
                100: "#e0e7ff",
                200: "#c7d2fe",
                300: "#a5b4fc",
                400: "#818cf8",
                500: "#6366f1",
                600: "#4f46e5",
                700: "#4338ca",
                800: "#3730a3",
                900: "#312e81",
            },
            alert: {
                danger: "#FF4E4E",
                success: "#90DA1",
                warning: "#FEB72F",
            },
        },
        fontSize: {
            "8xl": [
                "120px",
                {
                    lineHeight: "120px",
                    letterSpacing: "-6px",
                    fontWeight: "500",
                },
            ],
            "7xl": [
                "72px",
                {
                    lineHeight: "80px",
                    letterSpacing: "-4.5px",
                    fontWeight: "600",
                },
            ],
            "6xl": [
                "55px",
                {
                    lineHeight: "60px",
                    letterSpacing: "-2.5px",
                    fontWeight: "500",
                },
            ],
            "5xl": [
                "48px",
                {
                    lineHeight: "54px",
                    letterSpacing: "-1.600000023841858px",
                    fontWeight: "500",
                },
            ],
            "4xl": [
                "36px",
                {
                    lineHeight: "44px",
                    letterSpacing: "-1.2000000476837158px",
                    fontWeight: "500",
                },
            ],
            "3xl": [
                "28px",
                {
                    lineHeight: "34px",
                    letterSpacing: "-0.800000011920929px",
                    fontWeight: "500",
                },
            ],
            "2xl": [
                "24px",
                {
                    lineHeight: "30px",
                    letterSpacing: "-1px",
                    fontWeight: "400",
                },
            ],
            xl: [
                "24px",
                {
                    lineHeight: "30px",
                    letterSpacing: "-1px",
                    fontWeight: "400",
                },
            ],
            lg: [
                "21px",
                {
                    lineHeight: "30px",
                    letterSpacing: "-0.800000011920929px",
                    fontWeight: "400",
                },
            ],
            base: [
                "17px",
                {
                    lineHeight: "25px",
                    letterSpacing: "-0.699999988079071px",
                    fontWeight: "400",
                },
            ],
            sm: [
                "15px",
                {
                    lineHeight: "23px",
                    letterSpacing: "-0.6000000238418579px",
                    fontWeight: "400",
                },
            ],
            caption1: [
                "20px",
                {
                    lineHeight: "24px",
                    letterSpacing: "-0.6000000238418579px",
                    fontWeight: "400",
                },
            ],
            caption2: [
                "18px",
                {
                    lineHeight: "20px",
                    letterSpacing: "-0.30000001192092896px",
                    fontWeight: "400",
                },
            ],
            caption3: [
                "16px",
                {
                    lineHeight: "18px",
                    letterSpacing: "-0.5px",
                    fontWeight: "400",
                },
            ],
            caption4: [
                "13px",
                {
                    lineHeight: "15px",
                    letterSpacing: "-0.20000000298023224px",
                    fontWeight: "400",
                },
            ],
        },
        borderRadius: {
            DEFAULT: "10px",
            full: "9999px",
        },
       
        extend: {
            fontWeight: {
                normal: '400',     // = regular
                medium: '500',     // = medium
                semibold: '600',
                bold: '700'
            },
            fontFamily: {
                sriracha: ['Sriracha', 'cursive'],
            },
        },
    },
    plugins: [],
};