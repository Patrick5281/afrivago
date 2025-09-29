import { useRouter } from 'next/router';
import { RoomDetailsContainer } from '@/ui/modules/detailsproperty/components/room-details-container';
import { Layout } from '@/ui/components/layout/layout';
import { Seo } from '@/ui/components/seo/seo';
import { REGISTERED } from '@/lib/session-status';

const RoomPage = () => {
  const router = useRouter();
  const { id } = router.query;

  console.log(' rendu de RoomPage:', { isReady: router.isReady, id: id });

  // 1. Affiche un état de chargement tant que le routeur n'est pas prêt.
  if (!router.isReady) {
    return (
      <Layout sessionStatus={REGISTERED}>
        <div className="text-center p-8">Chargement de la page...</div>
      </Layout>
    );
  }

  // 2. Si le routeur est prêt mais que l'ID n'est pas bon, on affiche une erreur.
  if (typeof id !== 'string') {
    return (
      <Layout sessionStatus={REGISTERED}>
        <div className="text-center p-8">L'identifiant de la pièce est invalide.</div>
      </Layout>
    );
  }

  // 3. L'ID est disponible et valide, on affiche le composant.
  return (
    <>
      <Seo title={`Détails de la pièce ${id}`} description="Page de détails pour une pièce" />
      <Layout sessionStatus={REGISTERED}>
        <div className="container mx-auto py-8">
          <RoomDetailsContainer id={id} />
        </div>
      </Layout>
    </>
  );
};

export default RoomPage; 