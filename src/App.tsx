
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './routes/Dashboard';
import MemoryDashboard from './routes/MemoryBank';
import Notes from './routes/Notes';
import Quiz from './routes/Quiz';
import SpacedReview from './routes/SpacedReview';
import Upload from './routes/Upload';
import StudyPlan from './routes/StudyPlan';
import Research from './routes/Research';
import PresentationStudio from './routes/PresentationStudio';
import Vault from './routes/Vault';
import KnowledgeGalaxy from './components/dashboard/KnowledgeGalaxy';
import ChatSidebar from './components/chat/ChatSidebar';
import ReviewCardModal from './components/memory/ReviewCardModal';

import { useAppStore } from './store/useAppStore';
import { useMemoryStore } from './store/useMemoryStore';
import { calculateReview } from './lib/srs';
import { calculateDividend } from './lib/stockUtils';

import { usePetSystem } from './hooks/usePetSystem';
import { useStudyTimer } from './hooks/useStudyTimer';
import { useGlobalTimer } from './hooks/useGlobalTimer';

// Page Transition Wrapper
const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

function App() {
  usePetSystem();
  useStudyTimer(); // Activate study timer
  useGlobalTimer(); // Activate global pomodoro timer
  const { isChatOpen, setChatOpen, reviewModal, closeReviewModal, rewardPet } = useAppStore();
  const { atoms, updateAtom, recordDividend } = useMemoryStore();
  const location = useLocation();

  const handleReviewComplete = (atomId: string, quality: number) => {
    const atom = atoms.find(a => a.id === atomId);
    if (!atom) return;

    const updates = calculateReview(atom, quality);
    updateAtom(atomId, updates);

    const dividend = calculateDividend(quality);
    if (dividend > 0) {
      recordDividend(atom.sourceId, dividend);
    }

    const xpGain = quality * 5;
    const hungerReduction = 3;
    rewardPet(xpGain, hungerReduction);
  };
  return (
    <>
      <AppLayout>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="/memory" element={<PageTransition><MemoryDashboard /></PageTransition>} />
            <Route path="/notes" element={<PageTransition><Notes /></PageTransition>} />
            <Route path="/notes/:id" element={<PageTransition><Notes /></PageTransition>} />
            <Route path="/quiz" element={<PageTransition><Quiz /></PageTransition>} />
            <Route path="/quiz/:id" element={<PageTransition><Quiz /></PageTransition>} />
            <Route path="/review" element={<PageTransition><SpacedReview /></PageTransition>} />
            <Route path="/galaxy" element={<PageTransition><KnowledgeGalaxy /></PageTransition>} />
            <Route path="/upload" element={<PageTransition><Upload /></PageTransition>} />
            <Route path="/study-plan" element={<PageTransition><StudyPlan /></PageTransition>} />
            <Route path="/vault" element={<PageTransition><Vault /></PageTransition>} />
            <Route path="/research" element={<PageTransition><Research /></PageTransition>} />
            <Route path="/presentation" element={<PageTransition><PresentationStudio /></PageTransition>} />
            <Route path="/presentation/studio" element={<PageTransition><PresentationStudio /></PageTransition>} />
          </Routes >
        </AnimatePresence >
      </AppLayout >
      <ChatSidebar isOpen={isChatOpen} onToggle={() => setChatOpen(!isChatOpen)} />

      {
        reviewModal.isOpen && (
          <ReviewCardModal
            atoms={reviewModal.atoms}
            onReviewComplete={handleReviewComplete}
            onClose={closeReviewModal}
          />
        )
      }
    </>
  );
}

export default App;
