import React from 'react';
import { Button } from '@/ui/design-system/button/button';
import { TrendingUp, TrendingDown, AlertTriangle, Download, FileText } from 'lucide-react';

interface Indicateur {
  label: string;
  value: number;
  unit?: string;
  color?: string;
  icon?: React.ReactNode;
}
interface Paiement {
  date: string;
  bien: string;
  locataire: string;
  montant: number;
  statut: string;
  recu: boolean;
}
interface Virement {
  date: string;
  montant: number;
  statut: string;
  iban: string;
}

interface PaiementViewProps {
  indicateurs: Indicateur[];
  paiements: Paiement[];
  virements: Virement[];
  soldeDisponible: number;
}

export const PaiementView: React.FC<PaiementViewProps> = ({ indicateurs, paiements, virements, soldeDisponible }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header indicateurs clés */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
            {indicateurs.map((kpi, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6 shadow-sm flex flex-col items-start">
                <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.icon}</div>
                <div className="text-gray-600 text-sm mb-1">{kpi.label}</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">{kpi.value}</span>
                  {kpi.unit && <span className="text-lg text-gray-400">{kpi.unit}</span>}
                </div>
              </div>
            ))}
          </div>
          <Button className="rounded-full px-6 py-3 text-lg flex items-center gap-2 shadow-lg bg-primary text-white whitespace-nowrap mt-4 md:mt-0">Retirer mes fonds</Button>
        </div>

        {/* Graphique de performance (statique) */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-xl font-bold text-gray-900 mb-1">Évolution des revenus locatifs</div>
              <div className="text-gray-500 text-sm">Sur les 12 derniers mois</div>
            </div>
            <div className="flex gap-2">
              <Button size="small" variant="accent">Mois</Button>
              <Button size="small" variant="accent">Année</Button>
              <Button size="small" variant="accent">30 jours</Button>
            </div>
          </div>
          {/* Graphique SVG statique */}
          <div className="relative h-56">
            <svg className="w-full h-full" viewBox="0 0 500 200">
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {[40, 80, 120, 160].map((y) => (
                <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="#E5E7EB" strokeWidth="1"/>
              ))}
              <polyline
                fill="url(#chartGradient)"
                stroke="#10B981"
                strokeWidth="2"
                points="0,160 50,140 100,150 150,120 200,130 250,110 300,100 350,90 400,80 450,70 500,60"
              />
              {[
                [0, 160], [50, 140], [100, 150], [150, 120], [200, 130],
                [250, 110], [300, 100], [350, 90], [400, 80], [450, 70], [500, 60]
              ].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="4" fill="#10B981"/>
              ))}
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 mt-2">
              {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'].map((month) => (
                <span key={month}>{month}</span>
              ))}
            </div>
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 -ml-8">
              <span>2k€</span>
              <span>1k€</span>
              <span>0</span>
            </div>
          </div>
        </div>

        {/* Tableau historique des paiements */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="text-xl font-bold text-gray-900">Historique des paiements</div>
            <div className="flex gap-2">
              <Button size="small" variant="accent"><Download className="w-4 h-4 mr-1" /> Export CSV</Button>
              <Button size="small" variant="accent"><FileText className="w-4 h-4 mr-1" /> Télécharger PDF</Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-semibold text-gray-600">Date</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-600">Bien</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-600">Locataire</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-600">Montant</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-600">Statut</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-600">Reçu</th>
                </tr>
              </thead>
              <tbody>
                {paiements.map((p, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-4 text-sm text-gray-900">{p.date}</td>
                    <td className="py-4 text-sm text-gray-900">{p.bien}</td>
                    <td className="py-4 text-sm text-gray-900">{p.locataire}</td>
                    <td className="py-4 text-sm text-gray-900">{p.montant} €</td>
                    <td className="py-4">
                      {p.statut === 'Payé' ? (
                        <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">Payé</span>
                      ) : (
                        <span className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full">{p.statut}</span>
                      )}
                    </td>
                    <td className="py-4">
                      {p.recu ? (
                        <Button size="small" variant="secondary"><FileText className="w-4 h-4" /></Button>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bloc virements bancaires */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="text-xl font-bold text-gray-900">Virements bancaires</div>
            <div className="text-gray-500 text-sm">IBAN lié : <span className="font-mono text-gray-700">FR76 3000 6000 0112 3456 7890 189</span></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-semibold text-gray-600">Date</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-600">Montant</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-600">Statut</th>
                </tr>
              </thead>
              <tbody>
                {virements.map((v, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-4 text-sm text-gray-900">{v.date}</td>
                    <td className="py-4 text-sm text-gray-900">{v.montant} €</td>
                    <td className="py-4">
                      {v.statut === 'Traité' ? (
                        <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">Traité</span>
                      ) : v.statut === 'En cours' ? (
                        <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">En cours</span>
                      ) : (
                        <span className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full">{v.statut}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications/alertes */}
        <div className="mb-8">
          <div className="flex items-center gap-2 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <span className="text-yellow-800 text-sm">Un paiement est en retard sur le bien "Appartement Liberté". Pensez à relancer le locataire.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
