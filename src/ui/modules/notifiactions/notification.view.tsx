import { Typography } from '@/ui/design-system/typography/typography';
import React from 'react';
import Lottie from "lottie-react";
import searchImmAnimation from "public/assets/animation/search imm.json";

interface NotificationViewProps {
  notifications: any[];
  loading: boolean;
  error: string | null;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export const NotificationView: React.FC<NotificationViewProps> = ({ notifications, loading, error, onMarkAsRead, onDelete, onRefresh }) => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Mes notifications</h1>
      <button onClick={onRefresh} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded">Rafraîchir</button>
      {loading && <div className="text-gray-400">Chargement...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="flex justify-center mb-4">
            <Lottie
              animationData={searchImmAnimation}
              loop
              style={{ width: 220, height: 220 }}
            />
          </div>
          <Typography variant='lead'>Aucune notification.</Typography>
        </div>
      )}
      {notifications.length > 0 && (
        <ul className="space-y-3">
          {notifications.map((notif) => (
            <li key={notif.id} className={`p-4 rounded shadow flex items-center justify-between ${notif.is_read ? 'bg-gray-100' : 'bg-yellow-50 border-l-4 border-yellow-400'}`}>
              <div>
                <div className="font-semibold text-lg flex items-center gap-2">
                  {notif.title}
                  {!notif.is_read && <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full" title="Non lue"></span>}
                </div>
                <div className="text-gray-700 text-sm">{notif.message}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString()}</div>
              </div>
              <div className="flex flex-col gap-2 items-end ml-4">
                {!notif.is_read && (
                  <button onClick={() => onMarkAsRead(notif.id)} className="text-xs px-2 py-1 bg-green-600 text-white rounded">Marquer comme lue</button>
                )}
                <button onClick={() => onDelete(notif.id)} className="text-xs px-2 py-1 bg-red-500 text-white rounded">Supprimer</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
