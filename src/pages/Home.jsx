import Hero from '../components/Hero';
import PageTransition from '../components/PageTransition';

export default function Home() {
  return (
    <PageTransition>
      <Hero />
    </PageTransition>
  );
}
