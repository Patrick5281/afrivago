import dynamic from 'next/dynamic';

// Import dynamique pour éviter les problèmes SSR si besoin
const DetailsPropertyContainer = dynamic(
  () => import('@/ui/modules/detailsproperty/detailsproperty.container').then(mod => mod.DetailsPropertyContainer),
  { ssr: false }
);

export default function PropertyDetailsPage() {
  return <DetailsPropertyContainer />;
}