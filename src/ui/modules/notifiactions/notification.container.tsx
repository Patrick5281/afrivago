import React, { useEffect, useState } from 'react';
import { NotificationView } from './notification.view';

export const NotificationContainer = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Remplace par la vraie récupération de l'id utilisateur connecté
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('Erreur lors du chargement des notifications');
      const data = await res.json();
      setNotifications(data);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Marquer toutes les notifications comme lues à l'ouverture
  useEffect(() => {
    if (notifications.length > 0) {
      const unread = notifications.filter(n => !n.is_read);
      if (unread.length > 0) {
        Promise.all(unread.map(n => fetch(`/api/notifications/${n.id}/read`, { method: 'PATCH' })))
          .then(() => {
            setNotifications((prev) => prev.map(n => ({ ...n, is_read: true })));
            // Déclencher un event pour rafraîchir le badge (window event)
            window.dispatchEvent(new Event('notificationsRead'));
          });
      }
    }
  }, [notifications]);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    setNotifications((prev) => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const deleteNotification = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    setNotifications((prev) => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationView
      notifications={notifications}
      loading={loading}
      error={error}
      onMarkAsRead={markAsRead}
      onDelete={deleteNotification}
      onRefresh={fetchNotifications}
    />
  );
};
