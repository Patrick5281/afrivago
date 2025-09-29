import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const cities = [
  {
    name: 'Parakou',
    image: '/assets/images/Parakou.jpg',
    description: 'Logements à Parakou...'
  },
  {
    name: 'Cotonou',
    image: '/assets/images/Cotonou.webp',
    description: 'Logements à Cotonou...'
  },
  {
    name: 'Porto-Novo',
    image: '/assets/images/Porto-Novo.jpg',
    description: 'Logements à Porto-Novo...'
  },
  {
    name: 'Abomey',
    image: '/assets/images/Abomey.jpg',
    description: 'Logements à Abomey...'
  },
  {
    name: 'Natitingou',
    image: '/assets/images/natitingou.png',
    description: 'Logements à Natitingou...'
  },
   {
    name: 'Lokossa',
    image: '/assets/images/Lokossa.jpg',
    description: 'Logements à Lokossa...'
  }
];

export const CityList = () => {
  return (
    <section className="w-full py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-center text-2xl md:text-3xl font-bold mb-1 font-sriracha">Trouvez une ville <span role="img" aria-label="ville">🏙️</span></h2>
        <h3 className="text-center text-xl md:text-2xl font-semibold mb-8 font-sriracha">Pour <span className="font-bold italic">Votre Logement !</span></h3>
        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={32}
          slidesPerView={3}
          navigation
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          loop
          className="city-swiper"
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 1 },
            900: { slidesPerView: 2 },
            1200: { slidesPerView: 3 },
          }}
        >
          {cities.map((city, idx) => (
            <SwiperSlide key={city.name + idx}>
              <div className="relative w-full h-[580px] rounded-[48px] overflow-hidden shadow-lg bg-gray-200">
                <Image
                  src={city.image}
                  alt={city.name}
                  fill
                  className="object-cover object-center rounded-3xl"
                  sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"
                  quality={95}
                  priority={idx < 3}
                />
                {/* Overlay noir plus léger */}
                <div className="absolute inset-0 bg-black/40 rounded-3xl" />
                {/* Nom de la ville centré */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white text-3xl md:text-4xl font-extrabold drop-shadow-2xl tracking-wide uppercase">
                    {city.name}
                  </span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};