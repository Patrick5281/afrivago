import { HashRouter, Routes, Route } from 'react-router-dom'; 
import { CallToActionView } from "@/ui/design-system/call-to-action.view/call-to-action.view"; 
import { useEffect, useState } from "react";
import HeroTopView from './hero-top/hero-top.view';
import { CityList } from './CityList/CityList';
import { RoomDetails } from '@/ui/modules/detailsproperty/components/room-details';
import { UnitDetails } from '@/ui/modules/detailsproperty/components/unit-details';
import { DetailsPropertyContainer } from '@/ui/modules/detailsproperty/detailsproperty.container';
import PropertyListContainer from './property-list/property-list.container';


// Page d'accueil qui regroupe tous les composants principaux
const HomePage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    fetch('/api/property/public-properties')
      .then(res => res.json())
      .then(data => setProperties(data))
      .catch(err => {
        console.error("Erreur lors du chargement des propriétés :", err);
        setProperties([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <HeroTopView
        properties={properties}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />
      <PropertyListContainer
        properties={properties}
        searchValue={searchValue}
      />
      <CityList />
    </>
  );
};

export const LandingPageView = () => {
  return (
    // Utiliser HashRouter au lieu de BrowserRouter
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/property/:id" element={<DetailsPropertyContainer />} />
        <Route path="/room/:id" element={<RoomDetails />} />
        <Route path="/unit/:id" element={<UnitDetails />} />
      </Routes>
    </HashRouter>
  );
};