import Dashboard from '../components/Dashboard';
import PageTransition from '../components/PageTransition';

export default function PlatformPage() {
  return (
    <PageTransition className="pt-24 pb-12 min-h-screen flex flex-col justify-center">
      <Dashboard />
    </PageTransition>
  );
}
