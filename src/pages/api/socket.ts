import { Server } from "socket.io";

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*", // à restreindre en prod
      },
    });

    // Stockage des sockets par userId
    const userSockets = new Map();

    io.on("connection", (socket) => {
      // Identification de l'utilisateur
      socket.on("auth", (userId) => {
        socket.join(`user:${userId}`);
        userSockets.set(socket.id, userId);
      });

      // Déconnexion
      socket.on("disconnect", () => {
        userSockets.delete(socket.id);
      });
    });

    // Pour pouvoir y accéder ailleurs (ex: dans une route API)
    res.socket.server.io = io;
  }
  res.end();
} 