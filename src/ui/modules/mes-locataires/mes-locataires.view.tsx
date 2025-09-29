import { Button } from '@/ui/design-system/button/button';
import { Input } from '@/ui/design-system/forms/input';
import { Select } from '@/ui/design-system/forms/select';
import { Typography } from '@/ui/design-system/typography/typography';
import React from 'react';
import { useState } from "react";

export interface Paiement {
  paiement_id: string;
  amount: number;
  currency: string;
  status: string;
  period: string;
  created_at: string;
}

interface Locataire {
  reservation_id: string;
  name: string;
  surname: string;
  photourl: string;
  bien_loue: string;
  start_date: string;
  end_date: string;
  loyer: number;
  currency: string;
  statut_reservation: string;
}

interface MesLocatairesViewProps {
  locataires: Locataire[];
  onShowDetails: (reservationId: string) => void;
  showDetails: boolean;
  paiements: Paiement[];
  onCloseDetails: () => void;
}

export const MesLocatairesView: React.FC<MesLocatairesViewProps> = ({
  locataires,
  onShowDetails,
  showDetails,
  paiements,
  onCloseDetails,
}) => {
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("");
  const [bien, setBien] = useState("");

  return (
    <div className="p-6 bg-gray-400 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <Typography variant='lead'>Mes Locataires</Typography>
          <Typography variant='body-base'>Total actifs : <span className="font-semibold text-indigo-600">2</span></Typography>
        </div>
      </div>

      {/* Barre de recherche & filtres */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <Input
          type="text"
          placeholder="Rechercher par nom ou bien..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
       
       
        <Button variant='outLine'>
          <div className='flex items-center'>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          Filtres
          </div>
        </Button>
        <Button variant='outLine'>
          <div className='flex items-center'>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
          Exporter
          </div>
        </Button>
      </div>

      {/* Tableau des locataires */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-500 font-bold bg-gray-50">
              <th className="px-4 py-3 text-center font-bold">
                <Typography variant='body-base' weight='medium' className='font-bold'>
                  Locataire 
                </Typography>
              </th>
              <th className="px-4 py-3 text-center font-bold">
                <Typography variant='body-base' weight='medium' className='font-bold'>
                  Bien loué 
                </Typography>
              </th>
              <th className="px-4 py-3 text-center font-bold">
                <Typography variant='body-base' weight='medium' className='font-bold'>
                  Début 
                </Typography>
              </th>
              <th className="px-4 py-3 text-center font-bold">
                <Typography variant='body-base' weight='medium' className='font-bold'>
                  Fin 
                </Typography>
              </th>
              <th className="px-4 py-3 text-center font-bold">
                <Typography variant='body-base' weight='medium' className='font-bold'>
                  Loyer 
                </Typography>
              </th>
              <th className="px-4 py-3 text-center font-bold">
                <Typography variant='body-base' weight='medium' className='font-bold'>
                  Statut 
                </Typography>
              </th>
              <th className="px-4 py-3 text-center font-bold">
                <Typography variant='body-base' weight='medium' className='font-bold'>
                  Action 
                </Typography>
              </th>
            </tr>
          </thead>
          <tbody>
            {locataires.map((loc) => (
              <tr key={loc.reservation_id} className="hover:bg-gray-400 transition">
                <td className="px-4 py-3 flex items-center text-center gap-3">
                  <img src={loc.photourl} alt={loc.name} className="w-8 h-8 rounded-full object-cover border" />
                  <Typography variant='body-base'>{loc.name} {loc.surname}</Typography>
                </td>
                <td className="px-4 py-3 text-center">
                  
                  <Typography variant='body-base'>
                      {loc.bien_loue}
                  </Typography>
                  </td>
                <td className="px-4 py-3 text-center">
                  <Typography variant='body-base'>
                    {loc.start_date ? new Date(loc.start_date).toLocaleDateString('fr-FR') : ''}
                  </Typography>
                  </td>
                <td className="px-4 py-3 text-center">
                  <Typography variant='body-base'>
                    {loc.end_date ? new Date(loc.end_date).toLocaleDateString('fr-FR') : ''}
                  </Typography>
                </td>
                <td className="px-4 py-3 text-center">
                  <Typography variant='body-base' weight='medium' className='font-bold'>
                    {loc.loyer?.toLocaleString()} {loc.currency}
                  </Typography>
                </td>
                <td className="px-4 py-3 text-center">
                  {/* Statut à améliorer plus tard */}
                  {loc.statut_reservation === 'validated' && <Typography variant='body-base' className='bg-green rounded text-white'>À jour</Typography>}
                  {/* Ajouter d'autres statuts si besoin */}
                </td>
                <td className="px-4 py-3 text-center">
                  <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => onShowDetails(loc.reservation_id)}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
          <div className="text-xs text-gray-500">Précédent</div>
          <div className="flex gap-1">
            <button className="w-7 h-7 rounded bg-white border text-indigo-600 font-bold">1</button>
            <button className="w-7 h-7 rounded bg-white border text-indigo-600 font-bold">2</button>
            <button className="w-7 h-7 rounded bg-indigo-600 text-white font-bold">3</button>
            <button className="w-7 h-7 rounded bg-white border text-indigo-600 font-bold">4</button>
          </div>
          <div className="text-xs text-gray-500">Suivant</div>
        </div>
      </div>

      {/* Modale ou panneau de détails des paiements mensuels */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
              onClick={onCloseDetails}
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-4">Détails des paiements mensuels</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-center">Mois</th>
                    <th className="py-2 text-center">Montant</th>
                    <th className="py-2 text-center">Statut</th>
                    <th className="py-2 text-center">Date de paiement</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(paiements) && paiements.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-4 text-gray-400">Aucun paiement trouvé</td></tr>
                  ) : Array.isArray(paiements) ? paiements.map((p) => (
                    <tr key={p.paiement_id} className="border-b">
                      <td className="py-2">{p.period ? new Date(p.period).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''}</td>
                      <td className="py-2">{p.amount?.toLocaleString()} {p.currency}</td>
                      <td className="py-2">
                        {p.status === 'completed' && <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">Payé</span>}
                        {p.status === 'pending' && <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold">En attente</span>}
                        {p.status === 'failed' && <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">Échoué</span>}
                      </td>
                      <td className="py-2">{p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '-'}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="text-center py-4 text-red-400">Erreur de chargement des paiements</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 