import React from 'react';
import { PaiementView } from './paiement.view';

// Données statiques mockées
const indicateurs = [
  { label: 'Solde disponible', value: 0, unit: '€', color: 'text-green-600', icon: '€' },
  { label: 'Loyers encaissés ce mois', value: 0, unit: '€', color: 'text-green-600', icon: '€' },
  { label: 'Loyers impayés', value: 0, unit: '€', color: 'text-red-600', icon: '€' },
  { label: 'Locations actives', value: 0, unit: '', color: 'text-blue-600', icon: '🏠' },
];

const paiements = [
  { date: '05/06/2024', bien: 'Studio République', locataire: 'Jean Dupont', montant: 600, statut: 'Payé', recu: true },
  { date: '03/06/2024', bien: 'Appartement Liberté', locataire: 'Fatou Sarr', montant: 800, statut: 'Payé', recu: true },
  { date: '01/06/2024', bien: 'Villa Les Pins', locataire: 'Ali Ben', montant: 1200, statut: 'Payé', recu: true },
];

const virements = [
  { date: '06/06/2024', montant: 1200, statut: 'Traité', iban: 'FR76 3000 6000 0112 3456 7890 189' },
  { date: '01/06/2024', montant: 800, statut: 'En cours', iban: 'FR76 3000 6000 0112 3456 7890 189' },
];

const soldeDisponible = 0;

export const PaiementContainer = () => {
  return (
    <PaiementView
      indicateurs={indicateurs}
      paiements={paiements}
      virements={virements}
      soldeDisponible={soldeDisponible}
    />
  );
};






