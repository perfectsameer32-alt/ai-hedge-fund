import Founder from '../components/Founder';
import PageTransition from '../components/PageTransition';

export default function FounderPage() {
  return (
    <PageTransition className="pt-24 pb-12 min-h-screen flex flex-col justify-center">
      <Founder />
    </PageTransition>
  );
}
