import React, { useState, useEffect } from 'react';
import { useKkiapayPayment } from '../mes-reservations/components/useKkiapayPayment';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dynamic from 'next/dynamic';
import { Typography } from '@/ui/design-system/typography/typography';
import { Button } from '@/ui/design-system/button/button';
import Lottie from "lottie-react";
import noDataAnimation from "public/assets/svg/No Data Animation.json";

const KkiapayWidget = dynamic(() => import('../mes-reservations/components/KkiapayWidget'), { ssr: false });

interface LoyerMensuel {
  id: number;
  index: number;
  periode: { debut: string; fin: string };
  montant: number;
  dateLimite: string;
  datePayee?: string;
  statut: 'payé' | 'en_attente' | 'en_retard';
  facturePdfUrl?: string;
  action: 'payer' | 'voir_recu' | null;
  methodePaiement?: string;
  reference?: string;
  note?: string;
  payment_method_id?: number;
}

interface LogementLoyer {
  logementId: string;
  contratId: string;
  titre: string;
  adresse: string;
  type: string;
  photo: string;
  periodeDebut: string;
  periodeFin: string;
  loyers: LoyerMensuel[];
}

interface LoyersCautionViewProps {
  logements: LogementLoyer[];
  refetchLoyers: () => void;
}

const STATUTS = [
  { key: 'all', label: 'Tous', color: 'bg-gray-200 text-gray-700' },
  { key: 'payé', label: 'Payés', color: 'bg-secondary text-green' },
  { key: 'en_attente', label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  { key: 'en_retard', label: 'En retard', color: 'bg-red-100 text-red-700' },
];

const badgeColor = {
  payé: 'bg-secondary-400 text-gray',
  en_attente: 'bg-yellow-100 text-yellow-700',
  en_retard: 'bg-red-100 text-red-700',
};

export const LoyersCautionView: React.FC<LoyersCautionViewProps> = ({ logements, refetchLoyers }) => {
  // Initialisation depuis le localStorage ou la première valeur
  const getInitialContrat = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedContratId');
      if (saved && logements.find(l => l.contratId === saved)) {
        return saved;
      }
    }
    return logements[0]?.contratId || '';
  };

  const [selectedContrat, setSelectedContrat] = useState(getInitialContrat());

  // Sauvegarde dans le localStorage à chaque changement
  useEffect(() => {
    if (selectedContrat) {
      localStorage.setItem('selectedContratId', selectedContrat);
    }
  }, [selectedContrat]);

  // Si le contrat sélectionné n'existe plus (ex: suppression), on le remet à la première valeur
  useEffect(() => {
    if (logements.length > 0 && !logements.find(l => l.contratId === selectedContrat)) {
      setSelectedContrat(logements[0].contratId);
    }
  }, [logements]);

  const [statutFiltre, setStatutFiltre] = useState('all');
  const [kkiapayModalOpen, setKkiapayModalOpen] = useState(false);
  const [loyerAPayer, setLoyerAPayer] = useState<any>(null);

  // On trouve le contrat sélectionné
  const contrat = logements.find(l => l.contratId === selectedContrat);
  const loyers = contrat ? contrat.loyers : [];
  const loyersFiltres = statutFiltre === 'all' ? loyers : loyers.filter(l => l.statut === statutFiltre);

  // Remplace par la vraie récupération de l'utilisateur connecté
  const userEmail = ""; // à remplacer par l'email du locataire connecté
  const userPhone = ""; // à remplacer si besoin

  // Callback de succès Kkiapay (déplacé avant le hook)
  const handleKkiapaySuccess = async (response: any) => {
    console.log('[LOYERS-FRONT] Paiement réussi, réponse Kkiapay:', response);
    console.log('[LOYERS-FRONT] Loyer à payer:', loyerAPayer);
    const res = await fetch('/api/loyer/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loyerId: loyerAPayer.id,
        contratId: loyerAPayer.contratId,
        transactionId: response.transactionId,
        amount: loyerAPayer.montant,
        payment_method_id: loyerAPayer.payment_method_id || 1
      }),
    });
    if (res.ok) {
      toast.success("Loyer payé avec succès !");
      setKkiapayModalOpen(false);
      setLoyerAPayer(null);
      console.log('[LOYERS-FRONT] Appel refetchLoyers après paiement...');
      refetchLoyers();
    } else {
      const error = await res.json();
      toast.error(error.message || "Erreur lors de l'enregistrement du paiement.");
      console.error('[LOYERS-FRONT] Erreur lors du paiement:', error);
    }
  };

  // Hook Kkiapay (à adapter selon ton projet)
  const { open: openKkiapay } = useKkiapayPayment({
    amount: loyerAPayer?.montant || 0,
    email: userEmail,
    phone: userPhone,
    onSuccess: handleKkiapaySuccess,
    onFailure: () => setKkiapayModalOpen(false),
  });

  // Fonction pour gérer le paiement d'un loyer
  const handlePayLoyer = (contratId: string, loyerIndex: number) => {
    const loyer = loyers.find(l => l.index === loyerIndex);
    setLoyerAPayer({ ...loyer, contratId });
    setKkiapayModalOpen(true);
    // Ici tu peux ouvrir le widget Kkiapay directement si tu n'utilises pas de hook
    // openKkiapayWidget({ amount: loyer.montant, ... })
  };

  const totalLoyers = loyers.length;
  const totalPayes = loyers.filter(l => l.statut === 'payé').length;

  useEffect(() => {
    console.log('[LOYERS-FRONT] Données logements reçues:', logements);
    logements.forEach(logement => {
      console.log(`[LOYERS-FRONT] Logement ${logement.contratId}:`);
      logement.loyers.forEach(l => {
        console.log(`[LOYERS-FRONT] Loyer #${l.index} statut:`, l.statut, l);
      });
    });
  }, [logements]);

  const handleDownloadFacture = async (loyerId: number) => {
    try {
      const res = await fetch(`/api/loyer/facture/${loyerId}`);
      if (!res.ok) {
        toast.error("Erreur lors de la génération de la facture.");
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-loyer-${loyerId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Erreur lors du téléchargement de la facture.");
    }
  };

  // Cas aucun logement/loyer
  if (!logements || logements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="flex justify-center mb-4">
          <Lottie
            animationData={noDataAnimation}
            loop
            style={{ width: 220, height: 220 }}
          />
        </div>
        <Typography variant="lead">
          Aucun loyer ni caution disponible
        </Typography>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <Typography variant='h4'>Mes Loyers</Typography>
        <select
          className="px-4 py-2 rounded bg-gray-300 border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300/10"
          value={selectedContrat}
          onChange={e => setSelectedContrat(e.target.value)}
        >
          {logements.map(l => (
            <option key={l.contratId} value={l.contratId}>
              {l.titre} — {l.periodeDebut} au {l.periodeFin}
            </option>
          ))}
        </select>
      </div>
     <div className="flex justify-between items-center px-4 pb-4">
      {/* Statistiques */}
        <Typography variant='body-base'>
        {totalLoyers} loyers au total — {totalPayes} payés
        <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
          loyers.every(l => l.statut === 'payé') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {loyers.every(l => l.statut === 'payé') ? 'A jour' : 'En retard'}
        </span>
        </Typography>

        {/* Filtres + Export */}
        <div className="flex gap-3 items-center">
          <select
            className="px-4 py-2 rounded bg-gray-100 border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300/10 text-sm"
            value={statutFiltre}
            onChange={e => setStatutFiltre(e.target.value)}
          >
        {STATUTS.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>

          <Button
            variant='outLine'
            size='small'
            action={() => {
              window.print();
            }}
          >
            <div className='flex items-center gap-2'>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 17v4H7v-4"/><path d="M12 12v9"/><path d="M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h4l2-2h2l2 2h4a2 2 0 012 2v12a2 2 0 01-2 2z"/></svg>
              Export
            </div>
          </Button>
        </div>
      </div>


      {/* Tableau */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-400 font-extrabold">
              <th className="px-4 py-3 text-center">
                <Typography variant='body-base' weight='medium' className='font-bold'>
                  Nº
                </Typography>
                
                </th>
              <th 
                className="px-4 py-3 text-center">
                <Typography variant='body-base' weight='medium' className='font-bold'>
                  Période
                </Typography>
              </th>
              
              <th className="px-4 py-3 text-center">
                <Typography variant='body-base' weight='medium' className='font-bold'>
                  Loyer (CFA)
                </Typography>
              </th>
              <th className="px-4 py-3 text-center">
                <Typography variant='body-base' weight='medium' className='font-bold'>
                  Date limite
                </Typography>
                </th>
              <th className="px-4 py-3 text-center">
                <Typography variant='body-base' weight='medium' className='font-bold'>
                  Date payé
                </Typography>
                </th>
              <th className="px-4 py-3 text-center">
                <Typography variant='body-base' weight='medium' className='font-bold'>
                  Statut 
                </Typography>
                </th>
              <th className="px-4 py-3 text-center">
                <Typography variant='body-base' weight='medium' className='font-bold'>
                  Facture
                </Typography>
                </th>
              <th className="px-4 py-3 text-center">
                <Typography variant='body-base' weight='medium' className='font-bold'>
                  Action
                </Typography>
                </th>
              <th className="px-4 py-3 text-center">
                <Typography variant='body-base' weight='medium' className='font-bold'>
                  Méthode
                </Typography>
                </th>
              <th className="px-4 py-3 text-center">
                <Typography variant='body-base' weight='medium' className='font-bold'>
                  Référence
                </Typography>
                </th>
            </tr>
          </thead>
          <tbody>
            {loyersFiltres.map((l, idx) => {
              // Log pour debug action
              console.log(`[LOYERS-FRONT] RENDU: Loyer #${l.index} action:`, l.action, 'statut:', l.statut, l);
              return (
                <tr key={l.index} className=" last:border-0 hover:bg-gray-300 transition">
                  <td className="px-4 py-3 font-semibold">
                    <Typography variant='body-base'>
                          {l.index}
                    </Typography>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Typography variant='body-base'>
                      {l.periode.debut} → {l.periode.fin}
                    </Typography>
                    </td>
                  <td className="px-4 py-3 text-center font-bold">
                    <Typography variant='body-base' weight='medium' className="font-bold">
                      {l.montant.toLocaleString()}
                    </Typography>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Typography variant='body-base' >
                      {l.dateLimite}
                    </Typography>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Typography variant='body-base'>
                      {l.datePayee || '-'}
                    </Typography>
                  </td>
                  <td className="px-4 py-3 rounded text-center">
                    <Typography
                      variant='body-sm'
                      className={`px-2 py-1 rounded whitespace-nowrap ${badgeColor[l.statut]}`}
                    >
                      
                      {l.statut === 'payé' ? '✓ Payé' : l.statut === 'en_attente' ? 'En attente' : 'En retard'}
                    </Typography>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {l.statut === 'payé' ? (
                      <button
                        className="text-blue underline"
                        onClick={() => handleDownloadFacture(l.id)}
                      >
                        Télécharger
                      </button>
                    ) : (
                      <span className="text-gray">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                     
                      size="small"
                      
                      action={() => handlePayLoyer(contrat?.contratId || '', l.index)}
                      variant={l.statut === 'payé' ? 'disabled' : 'secondary'}
                      
                      >
                        Payer
                    </Button>
                    {l.action === 'voir_recu' && l.facturePdfUrl && (
                      <a
                        href={l.facturePdfUrl}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold"
                        download
                      >
                        Voir reçu
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Typography variant='body-base'>
                      {l.methodePaiement || '-'}
                    </Typography>
                    </td>
                  <td className="px-4 py-3 text-center">
                    <Typography variant='body-base'>
                      {l.reference || '-'}
                    </Typography>
                    </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-xs text-gray-500">showing 1 to {loyersFiltres.length} of {loyersFiltres.length} entries</span>
        <div className="flex gap-1">
          <button className="px-2 py-1 rounded bg-gray-200 text-gray-700">&lt;</button>
          <button className="px-2 py-1 rounded bg-primary text-black font-bold">1</button>
          <button className="px-2 py-1 rounded bg-gray-200 text-gray-700">2</button>
          <button className="px-2 py-1 rounded bg-gray-200 text-gray-700">3</button>
          <button className="px-2 py-1 rounded bg-gray-200 text-gray-700">&gt;</button>
        </div>
      </div>
      {/* Modale de paiement */}
      {kkiapayModalOpen && loyerAPayer && (
        <KkiapayWidget
          open={kkiapayModalOpen}
          amount={loyerAPayer.montant}
          email={userEmail}
          phone={userPhone}
          onSuccess={handleKkiapaySuccess}
          onFailure={() => setKkiapayModalOpen(false)}
          onClose={() => { setKkiapayModalOpen(false); setLoyerAPayer(null); }}
        />
      )}
    </div>
  );
};
