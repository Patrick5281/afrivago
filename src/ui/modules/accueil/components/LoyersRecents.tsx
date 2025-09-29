import React from "react";

interface LoyerRecent {
  mois: string;
  montant: number;
  datePaiement: string;
  statut: string;
  pdfUrl: string;
}

interface LoyersRecentsProps {
  loyers?: LoyerRecent[];
}

const statutMap = {
  "payé": { label: "Payé", color: "bg-green text-green" },
  "en_retard": { label: "En retard", color: "bg-red-100 text-red-700" },
  "annulé": { label: "Annulé", color: "bg-gray-100 text-gray-700" },
};

export const LoyersRecents: React.FC<LoyersRecentsProps> = ({ loyers }) => {
  if (!Array.isArray(loyers) || loyers.length === 0) {
    return (
      <div className="bg-blue rounded-xl shadow p-6 text-gray text-center">
        Aucun paiement récent à afficher.
      </div>
    );
  }
  return (
    <div className="bg-blue rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Mes loyers récents</h2>
      </div>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-gray text-xs uppercase bg-gray-50">
            <th className="px-4 py-3 text-left">Mois</th>
            <th className="px-4 py-3 text-left">Montant</th>
            <th className="px-4 py-3 text-left">Date de paiement</th>
            <th className="px-4 py-3 text-left">Statut</th>
            <th className="px-4 py-3 text-left">Reçu</th>
          </tr>
        </thead>
        <tbody>
          {loyers.map((loyer, idx) => {
            const statut = statutMap[loyer.statut] || statutMap["payé"];
            return (
              <tr key={idx} className="border-b last:border-0 hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray">{loyer.mois}</td>
                <td className="px-4 py-3">{loyer.montant.toLocaleString()} FCFA</td>
                <td className="px-4 py-3">{loyer.datePaiement}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statut.color}`}>{statut.label}</span>
                </td>
                <td className="px-4 py-3">
                  <a href={loyer.pdfUrl} className="text-indigo-600 hover:underline text-xs" target="_blank" rel="noopener noreferrer">Télécharger</a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}; 