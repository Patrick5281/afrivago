import { useRouter } from 'next/router';
import { UnitDetails } from '@/ui/modules/detailsproperty/components/unit-details';
import { Layout } from '@/ui/components/layout/layout';
import { Seo } from '@/ui/components/seo/seo';
import { REGISTERED } from '@/lib/session-status';

const UnitPage = () => {
  const router = useRouter();
  const { id } = router.query;

  console.log(' rendu de UnitPage:', { isReady: router.isReady, id: id });

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
        <div className="text-center p-8">L'identifiant de l'unité est invalide.</div>
      </Layout>
    );
  }

  // 3. L'ID est disponible et valide, on affiche le composant.
  return (
    <>
      <Seo title={`Détails de l'unité ${id}`} description="Page de détails pour une unité locative" />
      <Layout sessionStatus={REGISTERED}>
        <div className="container mx-auto py-8">
          <UnitDetails id={id} />
        </div>
      </Layout>
    </>
  );
};

export default UnitPage;