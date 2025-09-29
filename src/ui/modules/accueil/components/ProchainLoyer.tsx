import React from "react";

interface ProchainLoyerItem {
  contratId: string;
  logement: { titre: string; adresse: string };
  prochainLoyer: {
    montant: number;
    dateLimite: string;
    statut: string;
    paiementId?: string;
  };
}

interface ProchainLoyerProps {
  loyers: ProchainLoyerItem[];
}

const statutMap = {
  "payé": { label: "Payé", color: "bg-green-100 text-green-700" },
  "en_attente": { label: "En attente", color: "bg-orange-100 text-orange-700" },
  "en_retard": { label: "En retard", color: "bg-red-100 text-red-700" },
};

export const ProchainLoyer: React.FC<ProchainLoyerProps> = ({ loyers }) => {
  console.log('[ProchainLoyer] loyers reçus:', loyers);
  if (!loyers || loyers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6 flex items-center justify-center min-h-[100px] text-gray">
        Aucun loyer à afficher pour le moment.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {loyers.map((item) => {
        const statut = statutMap[item.prochainLoyer.statut] || statutMap["en_attente"];
        return (
          <div key={item.contratId} className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-gray-500 text-xs mb-1">Prochain loyer dû</div>
              <div className="text-2xl font-bold text-gray-800">{item.prochainLoyer.montant.toLocaleString()} FCFA</div>
              <div className="text-gray-400 text-sm mb-1">avant le <span className="font-semibold text-gray-700">{item.prochainLoyer.dateLimite}</span></div>
              <div className="mt-2 text-xs text-gray-500">
                <div><span className="font-semibold text-gray-700">{item.logement.titre}</span></div>
                <div>{item.logement.adresse}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statut.color}`}>{statut.label}</span>
              {item.prochainLoyer.statut !== "payé" && (
                <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow ml-2">Payer maintenant</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}; 