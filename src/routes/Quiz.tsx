import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useMemoryStore } from '../store/useMemoryStore';
import { QuizGenerator, type QuizQuestion as GeneratedQuestion } from '../services/QuizGenerator';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';

import type { QuizQuestion as StoredQuestion } from '../types';

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isMemoryQuiz = location.pathname === '/quiz/memory';

  const { quizzes, gainXP } = useAppStore();
  const { atoms, addQuizResult } = useMemoryStore();

  const [questions, setQuestions] = useState<(GeneratedQuestion | StoredQuestion)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (isMemoryQuiz) {
      try {
        if (atoms.length < 4) {
          // Not enough atoms, questions will remain empty
          console.log('Not enough atoms for quiz generation');
          return;
        }
        const generator = new QuizGenerator(atoms);
        setQuestions(generator.generateQuiz(5));
      } catch (e) {
        console.error('Quiz generation error:', e);
        setQuestions([]); // Ensure empty state on error
      }
    } else if (id && quizzes[id]) {
      // Load existing quiz from store
      setQuestions(quizzes[id]);
    }
  }, [isMemoryQuiz, id, atoms, quizzes]);

  // Refactored finish logic
  const submitQuiz = (finalAnswers: Record<string, string>) => {
    let correct = 0;
    const wrongs: { atomId: string; userAnswer: string; correctAnswer: string }[] = [];

    questions.forEach(q => {
      const userAns = finalAnswers[q.id];
      // Handle different field names for correct answer
      const correctAns = 'correctAnswer' in q ? q.correctAnswer : (q as any).answer;

      if (userAns === correctAns) {
        correct++;
      } else {
        wrongs.push({
          atomId: 'atomId' in q ? q.atomId : 'external',
          userAnswer: userAns || '',
          correctAnswer: correctAns || ''
        });
      }
    });

    const finalScore = Math.round((correct / questions.length) * 100);
    setScore(finalScore);
    setIsFinished(true);

    // Save Result
    addQuizResult({
      id: crypto.randomUUID(),
      date: Date.now(),
      score: finalScore,
      totalQuestions: questions.length,
      correctCount: correct,
      wrongAnswers: wrongs,
      type: isMemoryQuiz ? 'review' : 'quiz'
    });

    // Award XP
    const xp = finalScore >= 80 ? 50 : 20;
    gainXP(xp);
  };

  const onOptionClick = (option: string) => {
    const newAnswers = { ...answers, [questions[currentIndex].id]: option };
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    } else {
      submitQuiz(newAnswers);
    }
  };

  if (questions.length === 0) {
    return (
      <Card className="text-center p-8">
        <div className="text-4xl mb-4">🤔</div>
        <h2 className="text-xl font-bold mb-2">無法產生測驗</h2>
        <p className="text-gray-500 mb-4">您的 Memory Bank 中知識點不足（至少需要 4 個）。</p>
        <Button onClick={() => navigate('/notes')}>去閱讀筆記</Button>
      </Card>
    );
  }

  if (isFinished) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="text-center p-8">
          <div className="text-6xl mb-4">{score >= 80 ? '🏆' : '📚'}</div>
          <h2 className="text-2xl font-bold mb-2">測驗完成！</h2>
          <div className="text-4xl font-black text-primary-600 mb-6">{score}分</div>

          <div className="space-y-4 mb-8 text-left">
            {questions.map((q, idx) => {
              const isCorrect = answers[q.id] === q.correctAnswer;
              return (
                <div key={q.id} className={`p-3 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                      {isCorrect ? '✓' : '✗'}
                    </span>
                    <span className="font-medium text-sm text-gray-700">Question {idx + 1}</span>
                  </div>
                  <p className="text-sm text-gray-600">{q.question}</p>
                  {!isCorrect && (
                    <div className="mt-2 text-xs text-red-500">
                      Correct: {q.correctAnswer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Button className="w-full" onClick={() => navigate('/')}>返回首頁</Button>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>✕ 退出</Button>
        <div className="text-sm font-medium text-gray-500">
          Question {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Progress */}
      <div className="h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
        <motion.div
          className="h-full bg-primary-500"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <Card className="p-6 mb-6 min-h-[200px] flex flex-col justify-center items-center text-center">
        <h3 className="text-xl font-bold text-gray-800 leading-relaxed">
          {currentQ.question}
        </h3>
      </Card>

      {/* Options */}
      <div className="grid gap-3">
        {currentQ.options?.map((option, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOptionClick(option)}
            className="w-full p-4 text-left bg-white border-2 border-gray-100 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-colors font-medium text-gray-700"
          >
            {option}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
