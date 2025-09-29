import { useState, useEffect } from 'react';
import { useSupabase } from './use-supabase';

export default function useSupabaseAuth() {
  const { supabase } = useSupabase();
  const [authUser, setAuthUser] = useState<any>(null);
  const [authUserIsLoading, setAuthUserIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Récupérer les données utilisateur complètes
        supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setAuthUser({
                ...data,
                uid: session.user.id // Garder uid pour la compatibilité
              });
            }
            setAuthUserIsLoading(false);
          });
      } else {
        setAuthUser(null);
        setAuthUserIsLoading(false);
      }
    });

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (data) {
            setAuthUser({
              ...data,
              uid: session.user.id // Garder uid pour la compatibilité
            });
          }
        } else {
          setAuthUser(null);
        }
        setAuthUserIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return {
    authUser,
    authUserIsLoading,
    setAuthUser
  };
} 