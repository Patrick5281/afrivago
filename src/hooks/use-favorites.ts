import { useState, useEffect, useCallback } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les favoris au montage
  useEffect(() => {
    fetch('/api/favorites')
      .then(async res => {
        const text = await res.text();
        console.log('Réponse brute /api/favorites:', text);
        try {
          const data = JSON.parse(text);
          setFavorites(data.map((p: any) => p.id));
        } catch (e) {
          console.error('Erreur de parsing JSON:', e, text);
        }
        setLoading(false);
      });
  }, []);

  // Ajouter un favori
  const addFavorite = useCallback(async (propertyId: string) => {
    await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId }),
    });
    setFavorites(favs => [...favs, propertyId]);
  }, []);

  // Retirer un favori
  const removeFavorite = useCallback(async (propertyId: string) => {
    await fetch(`/api/favorites/${propertyId}`, { method: 'DELETE' });
    setFavorites(favs => favs.filter(id => id !== propertyId));
  }, []);

  // Vérifier si un bien est en favoris
  const isFavorite = useCallback((propertyId: string) => favorites.includes(propertyId), [favorites]);

  return { favorites, loading, addFavorite, removeFavorite, isFavorite };
} 