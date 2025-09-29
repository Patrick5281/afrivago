import React, { useEffect, useState } from 'react';
import { DashboardView } from "./Dashboard.view";

export const DashboardContainer = () => {
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [granularity, setGranularity] = useState<'monthly' | 'yearly'>('monthly');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [years, setYears] = useState<number[]>([new Date().getFullYear()]);

  const fetchKpis = async (granularity: 'monthly' | 'yearly', year: number) => {
    setLoading(true);
    let url = `/api/dashboard/owner-kpis?granularity=${granularity}`;
    if (granularity === 'monthly') url += `&year=${year}`;
    const res = await fetch(url);
    const data = await res.json();
    setKpis(data);
    setLoading(false);
    // Met à jour la liste des années disponibles à partir des données annuelles
    if (granularity === 'yearly' && Array.isArray(data.revenus_evolution)) {
      setYears(data.revenus_evolution.map((d: any) => Number(d.periode)));
    }
    // Si on repasse en mensuel, garder la dernière liste connue
  };

  useEffect(() => {
    fetchKpis(granularity, year);
    // eslint-disable-next-line
  }, [granularity, year]);

  // Pour le select année, on extrait les années des données annuelles si dispo, sinon on propose l'année courante
  useEffect(() => {
    if (granularity === 'yearly' && kpis?.revenus_evolution) {
      setYears(kpis.revenus_evolution.map((d: any) => Number(d.periode)));
    } else if (granularity === 'monthly') {
      // On propose les 3 dernières années par défaut
      const now = new Date().getFullYear();
      setYears([now, now - 1, now - 2]);
    }
  }, [granularity, kpis]);

  return <DashboardView 
    kpis={kpis} 
    loading={loading} 
    granularity={granularity}
    year={year}
    years={years}
    setGranularity={setGranularity}
    setYear={setYear}
  />;
}; 