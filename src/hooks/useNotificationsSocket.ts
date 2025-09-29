import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useNotificationsSocket(userId: string, onNotification: (notif: any) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;
    // Connexion au serveur Socket.io
    const socket = io({
      path: "/api/socket",
      transports: ["websocket"],
    });
    socketRef.current = socket;

    // Authentification (abonnement au canal user)
    socket.emit("auth", userId);

    // Écoute des notifications
    socket.on("notification", (notif) => {
      onNotification(notif);
    });

    // Nettoyage à la déconnexion
    return () => {
      socket.disconnect();
    };
  }, [userId, onNotification]);
} 