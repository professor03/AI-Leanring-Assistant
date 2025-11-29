import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { generateQuiz } from '../lib/ai';
import NotesDetail from '../components/notes/NotesDetail';
import NotesSummary from '../components/notes/NotesSummary';
import TerminologyList from '../components/notes/TerminologyList';
import Button from '../components/ui/Button';
import { api } from '../lib/api';
import type { LectureNotes } from '../types';

const Notes = () => {
  const { id = 'notes-1' } = useParams();
  const navigate = useNavigate();
  const { notes: storedNotes, addQuiz } = useAppStore();
  const [notes, setNotes] = useState<LectureNotes | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizConfig, setQuizConfig] = useState({
    count: 3,
    type: 'mixed',
    allowExternal: false,
  });

  useEffect(() => {
    const found = storedNotes.find((n) => n.id === id);
    if (found) {
      setNotes(found);
    } else {
      api.getLectureNotes(id).then(setNotes).catch(() => setNotes(null));
    }
  }, [id, storedNotes]);

  const handleGenerateQuiz = async () => {
    if (!notes) return;
    try {
      setIsGeneratingQuiz(true);
      // Combine summary and sections for context
      const context = `${notes.summary}\n\n${notes.sections.map(s => s.content).join('\n')}`;
      const questions = await generateQuiz(context, quizConfig);
      addQuiz(notes.id, questions);
      navigate(`/quiz/${notes.id}`);
    } catch (error) {
      console.error(error);
      alert('生成題目失敗');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  if (!notes) {
    return <p className="text-gray-500">讀取講義筆記中...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-2">
        <Button variant="ghost" onClick={() => navigate('/')}>
          ← 返回
        </Button>
        <Button variant="ghost" onClick={() => navigate(1)}>
          前進 →
        </Button>
      </div>
      <NotesSummary summary={notes.summary} />
      <NotesDetail sections={notes.sections} />
      <TerminologyList terms={notes.terms} />
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-sm space-y-4">
        <h3 className="font-semibold text-lg">生成測驗設定</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">題目數量</label>
            <select
              className="w-full rounded-xl border-gray-300 bg-white/80"
              value={quizConfig.count}
              onChange={(e) => setQuizConfig({ ...quizConfig, count: Number(e.target.value) })}
            >
              <option value={3}>3 題</option>
              <option value={5}>5 題</option>
              <option value={10}>10 題</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">題型</label>
            <select
              className="w-full rounded-xl border-gray-300 bg-white/80"
              value={quizConfig.type}
              onChange={(e) => setQuizConfig({ ...quizConfig, type: e.target.value })}
            >
              <option value="mixed">混合題型</option>
              <option value="multiple-choice">選擇題</option>
              <option value="true-false">是非題</option>
              <option value="short-answer">簡答題</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">出題範圍</label>
            <select
              className="w-full rounded-xl border-gray-300 bg-white/80"
              value={quizConfig.allowExternal ? 'true' : 'false'}
              onChange={(e) => setQuizConfig({ ...quizConfig, allowExternal: e.target.value === 'true' })}
            >
              <option value="false">僅限講義內容</option>
              <option value="true">允許聯網補充 (AI 知識庫)</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            onClick={handleGenerateQuiz}
            disabled={isGeneratingQuiz}
            className="w-full md:w-auto"
          >
            {isGeneratingQuiz ? 'AI 出題中...' : '開始生成題目'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Notes;
