import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { useAppStore } from '../store/useAppStore';
import { generateStudyPlan } from '../lib/studyPlan';
import type { StudyPlanItem } from '../types';

const StudyPlan = () => {
  const navigate = useNavigate();
  const { notes } = useAppStore();
  const [examDate, setExamDate] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [mode, setMode] = useState<'exam' | 'review'>('exam');
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<StudyPlanItem[]>([]);

  // Extract unique courses from notes
  const availableSubjects = Array.from(new Set(notes.map(n => {
    // 1. Try to use the explicit courseName field (new notes)
    if (n.courseName) return n.courseName;

    // 2. Try to extract from summary if it starts with "課程：" (legacy notes)
    const firstLine = n.summary.split('\n')[0];
    const match = firstLine.match(/課程：(.+)/);
    if (match) return match[1].trim();

    // 3. Fallback: Truncate summary to avoid breaking UI
    return firstLine.length > 15 ? firstLine.slice(0, 15) + '...' : firstLine;
  }))).filter(Boolean);

  // Auto-select all subjects initially
  useEffect(() => {
    if (availableSubjects.length > 0 && selectedSubjects.length === 0) {
      setSelectedSubjects(availableSubjects);
    }
  }, [notes]);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const handleGenerate = async () => {
    if (!examDate || !selectedSubjects.length) {
      alert('請選擇考試日期，並至少選擇一個科目');
      return;
    }

    setIsGenerating(true);
    try {
      // Filter notes based on selected subjects
      // This is a simplified matching, in a real app we'd match by ID or exact course name
      const relevantNotes = notes.filter(n => selectedSubjects.some(s => n.summary.includes(s)));
      const summary = relevantNotes.map((n) => n.summary).join('\n\n');

      const generatedPlan = await generateStudyPlan(new Date(examDate), summary || 'General Study', selectedSubjects, mode);
      setPlan(generatedPlan);
    } catch (error) {
      console.error(error);
      alert('生成讀書計畫失敗，請稍後再試');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-2">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← 返回
        </Button>
        <Button variant="ghost" onClick={() => navigate(1)}>
          前進 →
        </Button>
      </div>
      <Card>
        <h2 className="text-xl font-semibold mb-4">AI 智能讀書計畫</h2>
        <p className="text-sm text-text-normal mb-4">
          系統會根據您目前擁有的 {notes.length} 份筆記，自動為您安排到考試前的複習進度。
        </p>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Input
                label="考試/目標日期"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-dark">學習模式</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      value="exam"
                      checked={mode === 'exam'}
                      onChange={() => setMode('exam')}
                      className="text-primary focus:ring-primary"
                    />
                    <span>🔥 考試衝刺 (Exam Sprint)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      value="review"
                      checked={mode === 'review'}
                      onChange={() => setMode('review')}
                      className="text-primary focus:ring-primary"
                    />
                    <span>🧠 間隔複習 (Spaced Review)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-dark">選擇科目 ({selectedSubjects.length})</label>
              <div className="bg-white/50 rounded-xl p-3 border border-white/40 max-h-40 overflow-y-auto space-y-2">
                {availableSubjects.length > 0 ? availableSubjects.map(subject => (
                  <label key={subject} className="flex items-center gap-2 cursor-pointer hover:bg-white/50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject)}
                      onChange={() => toggleSubject(subject)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{subject}</span>
                  </label>
                )) : (
                  <p className="text-sm text-gray-500 italic">尚未上傳筆記，請先上傳教材。</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleGenerate} disabled={isGenerating || !examDate || !selectedSubjects.length}>
              {isGenerating ? 'AI 規劃中...' : '✨ 生成讀書計畫'}
            </Button>
          </div>
          {notes.length === 0 && (
            <p className="text-xs text-red-500 mt-2">請先到「上傳教材」新增筆記才能生成計畫。</p>
          )}
        </form>
      </Card>

      {plan.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">您的專屬計畫</h3>
          <div className="grid gap-3">
            {plan.map((item) => (
              <Card key={item.id} variant="accent">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg">{item.topic}</h4>
                    <p className="text-sm text-gray-600">{item.course}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">{item.dueDate}</p>
                    <p className="text-xs text-gray-500">
                      {item.dayOffset === 0 ? '今天' : `${item.dayOffset} 天後`}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlan;


