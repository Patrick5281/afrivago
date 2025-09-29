import React, { useEffect, useState } from 'react';
import { LoyersCautionView } from './loyers-caution.view';
import { Typography } from '@/ui/design-system/typography/typography';

export const LoyersCautionContainer = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLoyers = () => {
    setLoading(true);
    setError(null);
    fetch('/api/dashboard/loyers-caution')
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors du chargement des loyers & cautions');
        return res.json();
      })
      .then(json => {
        console.log('DATA loyers-caution:', json);
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLoyers();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-400">Chargement des loyers & cautions...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  // Suppression du return anticipé sur data.logements vide

  return <LoyersCautionView logements={data?.logements || []} refetchLoyers={fetchLoyers} />;
};
