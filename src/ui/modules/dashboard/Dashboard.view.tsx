import React from 'react';
import { TrendingUp, TrendingDown, Home, Euro, Users, AlertTriangle, UserPlus } from 'lucide-react';
import { Typography } from '@/ui/design-system/typography/typography';
import { Button } from '@/ui/design-system/button/button';
import { RevenueLineChart } from './components/RevenueLineChart';
import { LoyersDonutChart } from './components/LoyersDonutChart';

interface DashboardViewProps {
  kpis: any;
  loading: boolean;
  granularity: 'monthly' | 'yearly';
  year: number;
  years: number[];
  setGranularity: (g: 'monthly' | 'yearly') => void;
  setYear: (y: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ kpis, loading, granularity, year, years, setGranularity, setYear }) => {
  const kpiCards = [
    {
      label: "Revenus encaissés",
      value: loading ? '--' : (kpis?.revenus_total?.toLocaleString() || 0),
      unit: "FCFA",
      icon: <span className="text-green-600">€</span>,
      trend: '',
      trendColor: "text-green-600",
      iconColor: "text-green-600",
    },
    {
      label: "Revenus ce mois", 
      value: loading ? '' : (kpis?.revenus_mois?.toLocaleString() || 0),
      unit: "FCFA",
      icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
      trend: loading ? '' : (kpis?.evolution !== null && kpis?.evolution !== undefined ? `${kpis.evolution > 0 ? '+' : ''}${kpis.evolution.toFixed(1)}%` : '0'),
      trendColor: kpis?.evolution > 0 ? 'text-green-600' : 'text-red-600',
      iconColor: "text-blue-500",
    },
    {
      label: "Loyers impayé",
      value: loading ? '--' : (kpis?.loyers_impayes?.toLocaleString() || 0),
      unit: "FCFA",
      icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
      trend: loading ? '' : (kpis?.locataires_impayes ? `${kpis.locataires_impayes} locataire(s)` : '0'),
      trendColor: "text-red-600",
      iconColor: "text-red-500",
    },
    {
      label: "Biens occupés",
      value: loading ? '' : `${kpis?.biens_occupes || 0}/${kpis?.total_biens || 0}`,
      unit: kpis?.taux_occupation ? `(${kpis.taux_occupation.toFixed(0)}%)` : '',
      icon: <Home className="w-6 h-6 text-black" />,
      trend: '',
      trendColor: "text-green-600",
      iconColor: "text-black",
    },
    {
      label: "Contrats actifs",
      value: loading ? '--' : (kpis?.contrats_actifs || 0),
      icon: <UserPlus className="w-6 h-6 text-blue-500" />,
      trend: '',
      trendColor: "text-green-600",
      iconColor: "text-blue-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-400 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Typography variant="h4" className="text-3xl font-bold text-gray-900 mb-2">Dashboard </Typography>
            <Typography variant="body-base">Vue d'ensemble de vos locations et revenus</Typography>
          </div>
          <Button variant='accent'>Ajouter un bien</Button>
        </div>

        {/* KPI Cards */}
        <div className="flex flex-wrap gap-6 mb-8">
          {kpiCards.map((kpi, idx) => (
            <div
              key={idx}
              className="bg-white p-6 shadow-sm flex-1 min-w-[180px] max-w-[240px] md:max-w-none"
              style={{ flexBasis: "0", flexGrow: 1 }}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {/*kpi.icon*/}
                    <Typography variant='body-base'>{kpi.label}</Typography>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <Typography className='font-bold' variant='lead' weight='medium'>{kpi.value}</Typography>
                    {kpi.unit && <span className="text-lg text-gray">{kpi.unit}</span>}
                  </div>
                </div>
                {kpi.trend && (
                  <div className={`flex items-center text-sm ${kpi.trendColor}`}>
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>{kpi.trend}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Revenue Chart */}
          <div className="col-span-2">
            <RevenueLineChart
              data={kpis?.revenus_evolution || []}
              years={years}
              year={year}
              granularity={granularity}
              onGranularityChange={setGranularity}
              onYearChange={setYear}
            />
          </div>
          {/* Right Column - Donut Chart */}
          <div>
            <LoyersDonutChart data={kpis?.loyers_par_type || []} />
          </div>
        </div>

        {/* Bottom Section - Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Derniers paiements reçus */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Typography variant="h3" className="text-xl font-bold text-gray-900 mb-6">Derniers paiements reçus</Typography>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm font-semibold text-gray-600">#</th>
                    <th className="text-left py-3 text-sm font-semibold text-gray-600">Locataire</th>
                    <th className="text-left py-3 text-sm font-semibold text-gray-600">Bien</th>
                    <th className="text-left py-3 text-sm font-semibold text-gray-600">Date</th>
                    <th className="text-left py-3 text-sm font-semibold text-gray-600">Montant</th>
                    <th className="text-left py-3 text-sm font-semibold text-gray-600">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {kpis?.derniers_paiements?.length > 0 ? (
                    kpis.derniers_paiements.map((paiement: any, idx: number) => (
                      <tr key={paiement.id} className="border-b border-gray-100">
                        <td className="py-4 text-sm text-gray-900">{idx + 1}</td>
                        <td className="py-4 text-sm text-gray-900">{paiement.locataire}</td>
                        <td className="py-4 text-sm text-gray-900">{paiement.bien}</td>
                        <td className="py-4 text-sm text-gray-600">{new Date(paiement.date).toLocaleDateString()}</td>
                        <td className="py-4 text-sm text-gray-900">{paiement.montant.toLocaleString()} €</td>
                        <td className="py-4"><span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">{paiement.statut === 'completed' ? 'Payé' : paiement.statut}</span></td>
                  </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6} className="py-4 text-center text-gray-400">Aucun paiement trouvé</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Biens à surveiller */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Typography variant="h3" className="text-xl font-bold text-gray-900 mb-6">Biens à surveiller</Typography>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm font-semibold text-gray-600">#</th>
                    <th className="text-left py-3 text-sm font-semibold text-gray-600">Bien</th>
                    <th className="text-left py-3 text-sm font-semibold text-gray-600">Locataire</th>
                    <th className="text-left py-3 text-sm font-semibold text-gray-600">Problème</th>
                    <th className="text-left py-3 text-sm font-semibold text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {kpis?.biens_a_surveiller?.length > 0 ? (
                    kpis.biens_a_surveiller.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-4 text-sm text-gray-900">{idx + 1}</td>
                        <td className="py-4 text-sm text-gray-900">{item.bien}</td>
                        <td className="py-4 text-sm text-gray-900">{item.locataire}</td>
                        <td className={
                          item.probleme === 'Loyer impayé'
                            ? 'py-4 text-sm text-red-600'
                            : item.probleme === 'Bail expire bientôt'
                            ? 'py-4 text-sm text-yellow-600'
                            : 'py-4 text-sm text-gray-900'
                        }>{item.probleme}</td>
                        <td className="py-4">
                          {item.probleme === 'Loyer impayé' ? (
                            <Button size="small" className="bg-red-100 text-red-700 px-3 py-1 rounded-full">Relancer</Button>
                          ) : item.probleme === 'Bail expire bientôt' ? (
                            <Button size="small" className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">Renouveler</Button>
                          ) : null}
                        </td>
                  </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="py-4 text-center text-gray-400">Aucun bien à surveiller</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};