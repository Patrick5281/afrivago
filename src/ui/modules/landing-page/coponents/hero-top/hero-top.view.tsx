// components/HeroTopView.tsx
import { useState, useMemo, useEffect } from 'react';
import { SearchBar } from './SearchBar';
import { Search, Calendar, User } from "lucide-react";
import { Container } from "@/ui/components/container/container";
import { Typography } from "@/ui/design-system/typography/typography";
import Image from "next/image";
import { Input } from "@/ui/design-system/forms/input";

const IMAGES = [
  "/assets/images/luxury-villa.png",
  "/assets/images/Cotonou.webp",
  "/assets/images/duplex.jpg",
];

export default function HeroTopView({ searchValue = "", onSearchChange, properties = [] }: any) {
  // État pour gérer le slider d'images
  const [current, setCurrent] = useState(0);

  // Changer d'image automatiquement
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % IMAGES.length);
    }, 5000); // Change d'image toutes les 5 secondes

    return () => clearInterval(interval);
  }, []);

  // Suggestions : villes distinctes des propriétés (mock si pas de données)
  const citySuggestions = useMemo(() => {
    if (!properties || properties.length === 0) return [];
    const cities = properties.map((p: any) => p.city).filter(Boolean);
    return Array.from(new Set(cities)).slice(0, 5) as string[];
  }, [properties]);

  return (
    <div className="w-full flex flex-col items-center justify-center py-8 bg-gradient-to-b from-primary-50 to-white relative min-h-screen">
      {/* Slider background */}
      {IMAGES.map((src, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 
            ${idx === current ? "opacity-100" : "opacity-0"} 
            filter brightness-50`}
        >
          <Image
            src={src}
            alt={`Fond ${idx + 1}`}
            layout="fill"
            objectFit="cover"
          />
        </div>
      ))}

      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* Contenu */}
      <Container className="relative z-10 flex flex-col items-center justify-center text-center h-full px-4">
        <Typography
          variant="h1"
          component="h1"
          font="sriracha"
          className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
        >
          TROUVEZ VOTRE LOCATION EN TOUTE SIMPLICITÉ
        </Typography>
        
        <div className="w-full max-w-xl mb-6">
          <SearchBar
          className='bg-gray-800 text-white'
            value={searchValue}
            onChange={onSearchChange}
            suggestions={
              searchValue.length > 0
                ? citySuggestions.filter(city =>
                    city.toLowerCase().includes(searchValue.toLowerCase()) &&
                    city.toLowerCase() !== searchValue.toLowerCase()
                  )
                : []
            }
            onSuggestionClick={onSearchChange}
          />
        </div>
      </Container>
    </div>
  );
}