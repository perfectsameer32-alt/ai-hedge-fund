import About from '../components/About';
import HowItWorks from '../components/HowItWorks';
import PageTransition from '../components/PageTransition';

export default function AboutPage() {
  return (
    <PageTransition className="pt-24 pb-12">
      <About />
      <HowItWorks />
    </PageTransition>
  );
}
