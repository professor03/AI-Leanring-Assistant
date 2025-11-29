import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './routes/Dashboard';
import Notes from './routes/Notes';
import Quiz from './routes/Quiz';
import SpacedReview from './routes/SpacedReview';
import Upload from './routes/Upload';
import StudyPlan from './routes/StudyPlan';
import Research from './routes/Research';
import PresentationStudio from './routes/PresentationStudio';
import ChatSidebar from './components/chat/ChatSidebar';

import { useAppStore } from './store/useAppStore';

import { usePetSystem } from './hooks/usePetSystem';

function App() {
  usePetSystem();
  const { isChatOpen, setChatOpen } = useAppStore();

  return (
    <>
      <AppLayout isChatOpen={isChatOpen}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/notes/:id" element={<Notes />} />
          <Route path="/quiz/:id" element={<Quiz />} />
          <Route path="/review" element={<SpacedReview />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/study-plan" element={<StudyPlan />} />
          <Route path="/research" element={<Research />} />
          <Route path="/presentation/studio" element={<PresentationStudio />} />
        </Routes>
      </AppLayout>
      <ChatSidebar isOpen={isChatOpen} onToggle={() => setChatOpen(!isChatOpen)} />
    </>
  );
}

export default App;

