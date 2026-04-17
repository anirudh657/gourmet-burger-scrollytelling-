import BurgerSequence from '@/components/BurgerSequence';

export const metadata = {
  title: 'Culinary Architecture | Gourmet Burger',
  description: 'Experience the ultimate gourmet deconstruction via scrollytelling.',
};

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-black relative">
      <BurgerSequence />
    </main>
  );
}
