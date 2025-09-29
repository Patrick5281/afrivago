import React from "react";

interface HeaderAccueilProps {
  user?: { prenom?: string; avatar?: string; surname?: string };
  notificationsCount: number;
}

export const HeaderAccueil: React.FC<HeaderAccueilProps> = ({ user, notificationsCount }) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
    <div className="flex items-center gap-3">
      {user?.avatar && (
        <img src={user.avatar} alt={user?.surname || user?.prenom || ""} className="w-10 h-10 rounded-full object-cover border" />
      )}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Tableau de Bord</h1>
        <p className="text-gray-500 text-sm mt-1">
          Bonjour&nbsp;<span className="font-semibold text-indigo-600">{user?.surname || user?.prenom || ""}</span>
        </p>
      </div>
    </div>
    {/* Affichage du nombre de notifications si besoin */}
    {/* <div className="flex items-center gap-2">
      <span className="bg-indigo-600 text-white text-xs font-bold rounded-full px-2 py-1">{notificationsCount}</span>
    </div> */}
  </div>
); 