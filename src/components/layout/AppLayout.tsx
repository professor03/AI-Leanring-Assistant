import type { ReactNode } from 'react';
import BottomNav from './BottomNav';
import TopNav from './TopNav';
import PetCompanion from '../dashboard/PetCompanion';

interface AppLayoutProps {
  children: ReactNode;
  isChatOpen?: boolean;
}

const AppLayout = ({ children, isChatOpen = false }: AppLayoutProps) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white/40 via-transparent to-white/10 text-text-dark">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-0 h-80 w-80 rounded-full bg-gradient-to-br from-secondary/50 via-white/30 to-transparent blur-3xl animate-float" />
        <div className="absolute bottom-0 left-[-10rem] h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-primary/50 to-white/20 blur-[160px]" />
      </div>

      <div
        className={`relative z-10 flex min-h-screen flex-col transition-all duration-300 ease-in-out ${isChatOpen ? 'md:pr-96' : ''}`}
      >
        <TopNav />
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 pt-36 md:pt-24 subtle-animate">{children}</main>
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
      <PetCompanion />
    </div>
  );
};

export default AppLayout;




