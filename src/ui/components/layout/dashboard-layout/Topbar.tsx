import React, { useEffect, useState } from "react";
import { Bell, UserCircle2, Search, SlidersHorizontal } from "lucide-react";
import { AccountAvatarNavigationLink } from "@/ui/components/navigation/account-avatar-link";
import { Input } from "@/ui/design-system/forms/input";
import { useCurrencyStore } from '@/store/currencyStore';
import { useNotificationsSocket } from '@/hooks/useNotificationsSocket';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

interface CurrencyType {
  code: string;
  name: string;
}

interface TopbarProps {
  activeRole: string;
  currency?: string;
  onSectionChange?: (key: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ activeRole, currency = "XOF", onSectionChange }) => {
  const { currency: selectedCurrency, setCurrency } = useCurrencyStore();
  const [currencies, setCurrencies] = useState<CurrencyType[]>([{ code: selectedCurrency, name: selectedCurrency }]);
  const [notifCount, setNotifCount] = useState(0);
  const [notifModal, setNotifModal] = useState<{title: string, message: string} | null>(null);
  const router = useRouter();

  // Remplace par la vraie récupération de l'id utilisateur connecté
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  useNotificationsSocket(userId || '', (notif) => {
    setNotifCount((prev) => prev + 1);
    setNotifModal({ title: notif.title, message: notif.message });
  });

  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const res = await fetch('/api/property/pricing?type=currencies');
        const data = await res.json();
        if (Array.isArray(data) && data.length && typeof data[0] === 'object') {
          setCurrencies(data);
        }
      } catch (e) {
        setCurrencies([{ code: selectedCurrency, name: selectedCurrency }]);
      }
    };
    loadCurrencies();
    // Chargement initial du nombre de notifications non lues
    async function fetchUnread() {
      try {
        const res = await fetch('/api/notifications?is_read=false');
        if (res.ok) {
          const data = await res.json();
          setNotifCount(data.length);
        }
      } catch (e) {
        // ignore
      }
    }
    fetchUnread();
    // Écoute de l'event pour reset le badge
    const resetBadge = () => setNotifCount(0);
    window.addEventListener('notificationsRead', resetBadge);
    return () => window.removeEventListener('notificationsRead', resetBadge);
  }, [selectedCurrency]);

  return (
    <header className="h-20 bg-white flex items-center justify-between px-8 shadow-sm sticky top-0 z-30">
      {/* Rôle actif stylisé */}
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-2 px-2 py-2 rounded-lg bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100 rounded">
          <UserCircle2 className="text-primary-700" size={6} />
          <span className="capitalize">{activeRole || "Utilisateur"}</span>
        </span>
      </div>
      {/* Barre de recherche stylisée */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl mx-8">
        <div className="flex items-center bg-white rounded-xl shadow-sm px-3 py-0.5 w-full max-w-xl">
          <Search className="text-gray-600 mr-2" size={20} />
          <Input
            type="text"
            placeholder="Rechercher"
          />
          <button className="ml-2 p-2 rounded-lg bg-violet-100 hover:bg-violet-200 transition">
            <SlidersHorizontal className="text-violet-500" size={18} />
          </button>
        </div>
      </div>
      {/* Actions à droite */}
      <div className="flex items-center gap-6">
        {/* Sélecteur de devise (dropdown) */}
        <select
          value={selectedCurrency}
          onChange={e => setCurrency(e.target.value)}
          className="flex items-center gap-1 text-gray-700 hover:text-primary px-3 py-2 rounded border border-gray-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {currencies.map((cur) => (
            <option key={cur.code} value={cur.code}>{cur.code} - {cur.name}</option>
          ))}
        </select>
        {/* Barre verticale de séparation */}
        <div className="h-8 w-px bg-gray mx-2" />
        {/* Notifications */}
        <button
          className="relative text-gray-700 hover:text-primary"
          onClick={() => {
            if (onSectionChange) {
              onSectionChange('notifications');
            } else {
              router.push('/notifications');
            }
          }}
        >
          <Bell className="text-2xl" strokeWidth={2.2} />
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">{notifCount}</span>
          )}
        </button>
        {/* Avatar utilisateur */}
        <AccountAvatarNavigationLink />
      </div>
      {notifModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <div className="font-bold text-lg mb-2">{notifModal.title}</div>
            <div className="mb-4">{notifModal.message}</div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => {
                setNotifModal(null);
                router.push('/notifications');
              }}
            >Voir mes notifications</button>
            <button
              className="ml-2 text-gray-500 hover:text-gray-700 text-sm"
              onClick={() => setNotifModal(null)}
            >Fermer</button>
          </div>
        </div>
      )}
    </header>
  );
}; 