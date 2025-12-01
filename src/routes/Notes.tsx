import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { generateQuiz } from '../lib/ai';
import NotesDetail from '../components/notes/NotesDetail';
import NotesSummary from '../components/notes/NotesSummary';
import TerminologyList from '../components/notes/TerminologyList';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { api } from '../lib/api';
import type { LectureNotes } from '../types';
import { motion } from 'framer-motion';

const Notes = () => {
  const { id } = useParams();
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
    if (!id) return;

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

  // Library View (No ID selected)
  if (!id) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📚 筆記圖書館</h1>
            <p className="text-gray-500 mt-2">選擇一份筆記開始學習，或上傳新的教材。</p>
          </div>
          <Button onClick={() => navigate('/upload')}>
            + 上傳新教材
          </Button>
        </div>

        {storedNotes.length === 0 ? (
          <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-300">
            <p className="text-xl text-gray-500 mb-4">目前還沒有筆記</p>
            <Button onClick={() => navigate('/upload')}>
              開始上傳第一份教材
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storedNotes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col hover:shadow-xl transition-shadow cursor-pointer group" onClick={() => navigate(`/notes/${note.id}`)}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors">
                      📝
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                      {note.sections.length} 章節
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                    {note.courseName || '未命名課程'}
                  </h3>

                  <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-grow">
                    {note.summary}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      {note.terms?.length || 0} 個知識點
                    </span>
                    <span className="text-sm font-medium text-blue-600 group-hover:translate-x-1 transition-transform">
                      開始閱讀 →
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Detail View
  if (!notes) {
    return <p className="text-gray-500">讀取講義筆記中...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-2">
        <Button variant="ghost" onClick={() => navigate('/notes')}>
          ← 返回圖書館
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
