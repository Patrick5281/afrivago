import { useAuth } from "@/Context/AuthUserContext";
import { GUEST, REGISTERED } from "@/lib/session-status";
import { SessionStatusTypes } from "@/types/session-status-types";
import { ScreenSpinner } from "@/ui/design-system/spinner/screen-spinner";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { useRoleContext } from "@/Context/RoleContext";

interface Props {
  children: React.ReactNode;
  sessionStatus?: SessionStatusTypes;
}

export const Session = ({ children, sessionStatus }: Props) => {
  const router = useRouter();
  const { authUserIsLoading, authUser } = useAuth();
  const { activeRole, isRoleReady } = useRoleContext();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const hasRedirected = useRef(false);
  const lastPath = useRef<string | null>(null);
  const perfStart = useRef<number>(Date.now());

  useEffect(() => {
    console.log("État de la session:", {
      authUserIsLoading,
      authUser: !!authUser,
      activeRole,
      isRoleReady,
      pathname: router.pathname,
      isRedirecting,
      isReady
    });
  }, [authUserIsLoading, authUser, activeRole, isRoleReady, router.pathname, isRedirecting, isReady]);

  useEffect(() => {
    if (authUserIsLoading) {
      setIsReady(false);
      return;
    }

    const handleNavigation = async () => {
      try {
        const currentPath = router.asPath;
        
        // Si l'utilisateur n'est pas connecté et que la page nécessite une authentification
        if (!authUser && sessionStatus === REGISTERED) {
          setIsRedirecting(true);
          if (!hasRedirected.current) {
            hasRedirected.current = true;
            await router.replace("/connexion");
          }
          return;
        }

        // Si l'utilisateur est connecté et que la page est pour les invités
        if (authUser && sessionStatus === GUEST && activeRole && isRoleReady) {
          setIsRedirecting(true);
          if (!hasRedirected.current) {
            hasRedirected.current = true;
            await router.replace("/");
          }
          return;
        }
        
        // Gestion de l'onboarding pour les utilisateurs connectés
        if (authUser && activeRole && isRoleReady) {
          const hasCompletedOnboarding = !!authUser.userDocument.onboardingiscompleted;
          const isLocataire = activeRole.nom.toLowerCase().includes("locataire");
          const isProprietaire = activeRole.nom.toLowerCase().includes("proprietaire");
          
          // Gestion de l'onboarding pour les locataires
          if (isLocataire && !hasCompletedOnboarding && currentPath !== "/onboarding") {
            setIsRedirecting(true);
            if (!hasRedirected.current) {
              hasRedirected.current = true;
              await router.replace("/onboarding");
            }
            return;
          }
          
          if (isLocataire && hasCompletedOnboarding && currentPath === "/onboarding") {
            setIsRedirecting(true);
            if (!hasRedirected.current) {
              hasRedirected.current = true;
              await router.replace("/");
            }
            return;
          }
          
          // Gestion de l'onboarding pour les propriétaires
          if (isProprietaire && !hasCompletedOnboarding && currentPath !== "/onboarding-pro") {
            setIsRedirecting(true);
            if (!hasRedirected.current) {
              hasRedirected.current = true;
              await router.replace("/onboarding-pro");
            }
            return;
          }
          
          if (isProprietaire && hasCompletedOnboarding && currentPath === "/onboarding-pro") {
            setIsRedirecting(true);
            if (!hasRedirected.current) {
              hasRedirected.current = true;
              await router.replace("/");
            }
            return;
          }
        }
        
        // À la fin, ne reset hasRedirected.current que si le chemin a changé
        if (lastPath.current !== currentPath) {
          hasRedirected.current = false;
          lastPath.current = currentPath;
        }
        setIsRedirecting(false);
        setIsReady(true);
      } catch (error) {
        console.error("Erreur de navigation:", error);
        setIsRedirecting(false);
        setIsReady(true);
        hasRedirected.current = false;
      }
    };

    handleNavigation();
  }, [authUserIsLoading, authUser, activeRole, isRoleReady, sessionStatus, router.asPath]);

  // Ajout de logs détaillés pour le debug et la perf
  useEffect(() => {
    if (isReady && !isRedirecting && !authUserIsLoading) {
      const elapsed = Date.now() - perfStart.current;
      console.log(`[Session] Temps total avant affichage du contenu : ${elapsed}ms`);
    }
  }, [isReady, isRedirecting, authUserIsLoading]);

  // Ajout de logs détaillés pour le debug
  useEffect(() => {
    console.log("[Session] useEffect - état complet:", {
      authUserIsLoading,
      authUser,
      activeRole,
      isRoleReady,
      isRedirecting,
      isReady,
      pathname: router.pathname,
      asPath: router.asPath,
      showSpinner: authUserIsLoading || isRedirecting || !isReady,
    });
  }, [authUserIsLoading, authUser, activeRole, isRoleReady, router.pathname, isRedirecting, isReady, router.asPath]);

  console.log("[Session] Render - état:", {
    authUserIsLoading,
    authUser,
    activeRole,
    isRoleReady,
    isRedirecting,
    isReady,
    pathname: router.pathname,
    asPath: router.asPath,
    showSpinner: authUserIsLoading || isRedirecting || !isReady,
  });

  // Afficher le spinner pendant le chargement
  if (authUserIsLoading || isRedirecting || !isReady) {
    console.log("[Session] Affichage du spinner:", { authUserIsLoading, isRedirecting, isReady });
    return <ScreenSpinner />;
  }

  return <>{children}</>;
};