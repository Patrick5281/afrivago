/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        colors: {
            white: "#ffffff",
            black: "#000000", // Noir pur ajouté
            green: "#1d8200", // Vert pur ajouté
            red: {
                50: "#fef2f2",
                100: "#fee2e2",
                200: "#fecaca",
                300: "#fca5a5",
                400: "#f87171",
                500: "#ef4444",
                600: "#dc2626",
                700: "#b91c1c",
                800: "#991b1b",
                900: "#7f1d1d",
                DEFAULT: "#c21500", // Votre rouge pur
            },
           yellow: {
            50: "#fffdf7",      // jaune très très clair (crème)
            100: "#fef3c7",     // jaune très clair (champagne)
            200: "#fde68a",     // jaune clair (blé)
            300: "#fcd34d",     // jaune moyen-clair
            DEFAULT: "#FFFF00", // Votre jaune pur
            400: "#f59e0b",     // jaune-orange (début or)
            500: "#d97706",     // orange doré
            600: "#b45309",     // or foncé
            700: "#92400e",     // or bronze
            800: "#78350f",     // bronze foncé
            900: "#451a03",     // bronze très foncé
        },
            blue: {
                50: "#eff6ff",
                100: "#dbeafe",
                200: "#bfdbfe",
                300: "#93c5fd",
                400: "#60a5fa",
                500: "#3b82f6",
                600: "#2563eb",
                700: "#1d4ed8",      // Votre bleu existant
                800: "#1e40af",
                900: "#1e3a8a",
                DEFAULT: "#1D4ED8",  // Votre bleu de base
            },
            pink: "#900",
           primary: {
                200: "#80e3ff",     // 00c6ff très clair
                300: "#40d4ff",     // 00c6ff clair
                400: "#00c6ff",     // 00c6ff moyen
                DEFAULT: "#0072ff", // bleu de base (personnalisé)
                600: "#005bcc",     // 00c6ff foncé
                700: "#004499",     // 00c6ff nuit (ultra foncé)
                },
                secondary: {
                200: "#ccff99",     // vert très clair
                300: "#99ff66",     // vert clair
                400: "#80ff33",     // vert moyen
                DEFAULT: "#66ff00", // vert de base
                600: "#52cc00",     // vert foncé
                700: "#399900",     // vert très foncé
                },
            gray: {
                300: "#fafafa",
                400: "#f2f2f2",
                500: "#e5e5e5",
                600: "#b2b2b2",
                700: "#808080",
                800: "#333333",
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
                medium: 'font-weight: 800',     // = medium
                semibold: 'font-semibold',
                bold: '700'
            },
            fontFamily: {
                sriracha: ['Sriracha', 'cursive'],
            },
        },
    },
    plugins: [],
};