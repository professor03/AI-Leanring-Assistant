import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useMemoryStore } from '../store/useMemoryStore';
import { QuizGenerator, type QuizQuestion as GeneratedQuestion } from '../services/QuizGenerator';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

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

  // New state for immediate feedback
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // New state for text input
  const [textAnswer, setTextAnswer] = useState('');

  useEffect(() => {
    if (isMemoryQuiz) {
      try {
        if (atoms.length < 4) {
          return;
        }
        const generator = new QuizGenerator(atoms);
        setQuestions(generator.generateQuiz(5));
      } catch (e) {
        console.error('Quiz generation error:', e);
        setQuestions([]);
      }
    } else if (id && quizzes[id]) {
      setQuestions(quizzes[id]);
    }
  }, [isMemoryQuiz, id, atoms, quizzes]);

  // Reset text answer when question changes
  useEffect(() => {
    setTextAnswer('');
  }, [currentIndex]);

  const handleOptionClick = (option: string) => {
    if (showFeedback) return; // Prevent clicking after answered

    setSelectedOption(option);
    setShowFeedback(true);

    const newAnswers = { ...answers, [questions[currentIndex].id]: option };
    setAnswers(newAnswers);
  };

  const handleTextSubmit = () => {
    if (showFeedback || !textAnswer.trim()) return;

    setSelectedOption(textAnswer); // Store user's text answer as "selectedOption"
    setShowFeedback(true);

    const newAnswers = { ...answers, [questions[currentIndex].id]: textAnswer };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
      setTextAnswer('');
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    let correct = 0;
    const wrongs: { atomId: string; userAnswer: string; correctAnswer: string }[] = [];

    questions.forEach(q => {
      const userAns = answers[q.id];
      const correctAns = 'correctAnswer' in q ? q.correctAnswer : (q as any).answer;

      // Simple case-insensitive comparison for text answers
      const isCorrect = q.type === 'short-answer' || q.type === 'fill-in-the-blank'
        ? userAns?.toLowerCase().trim() === correctAns?.toLowerCase().trim()
        : userAns === correctAns;

      if (isCorrect) {
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

    addQuizResult({
      id: crypto.randomUUID(),
      date: Date.now(),
      score: finalScore,
      totalQuestions: questions.length,
      correctCount: correct,
      wrongAnswers: wrongs,
      type: isMemoryQuiz ? 'review' : 'quiz'
    });

    const xp = finalScore >= 80 ? 50 : 20;
    gainXP(xp);
  };

  // Helper to clean option text (remove "A. ", "B. " etc)
  const cleanOptionText = (text: string) => {
    return text ? text.replace(/^[A-D][\.:]\s*/, '') : '';
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="text-center p-8 max-w-md w-full">
          <div className="text-6xl mb-4">🤔</div>
          <h2 className="text-xl font-bold mb-2">準備中...</h2>
          <p className="text-gray-500 mb-6">正在為您生成測驗題目，請稍候。</p>
          <Button onClick={() => navigate(-1)} variant="ghost">返回</Button>
        </Card>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center mb-6">
            <div className="text-6xl mb-4">{score >= 80 ? '🎉' : '💪'}</div>
            <h2 className="text-3xl font-bold mb-2">測驗完成！</h2>
            <div className="text-5xl font-black text-primary-600 mb-6">{score}分</div>
            <Button className="w-full max-w-xs mx-auto" onClick={() => navigate('/')}>回到首頁</Button>
          </Card>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  // Determine correctness
  const isTextQuestion = currentQ.type === 'short-answer' || currentQ.type === 'fill-in-the-blank';
  const isCorrect = isTextQuestion
    ? selectedOption?.toLowerCase().trim() === currentQ.correctAnswer?.toLowerCase().trim()
    : selectedOption === currentQ.correctAnswer;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>✕</Button>

          {/* Progress Bar */}
          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="text-xs font-medium text-gray-500">
            {currentIndex + 1} / {questions.length}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full p-4 pb-32 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* Question Section - Mobile Optimized Layout */}
            <div className="flex gap-5">
              {/* Question Number Column */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-100 text-primary-600 flex items-center justify-center font-bold text-xl">
                  {currentIndex + 1}
                </div>
              </div>

              {/* Question Text Column */}
              <div className="flex-1 pt-2">
                <h3 className="text-2xl font-bold text-gray-800 leading-relaxed tracking-wide">
                  {currentQ.question}
                </h3>
              </div>
            </div>

            {/* Answer Section */}
            <div className="pl-0 md:pl-16">
              {isTextQuestion ? (
                <div className="space-y-4">
                  <textarea
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    disabled={showFeedback}
                    placeholder="請輸入您的答案..."
                    className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all min-h-[120px] text-lg resize-none disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  {!showFeedback && (
                    <Button
                      onClick={handleTextSubmit}
                      disabled={!textAnswer.trim()}
                      className="w-full py-3 text-lg"
                    >
                      送出答案
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {currentQ.options?.map((option, idx) => {
                    const cleanText = cleanOptionText(option);
                    const originalText = option; // Keep original for comparison if needed
                    const isSelected = selectedOption === originalText;
                    const isThisCorrect = originalText === currentQ.correctAnswer;

                    // Determine state styles
                    let stateStyles = "bg-white border-gray-200 hover:border-primary-300 hover:bg-gray-50 shadow-sm";
                    if (showFeedback) {
                      if (isThisCorrect) {
                        stateStyles = "bg-green-50 border-green-500 ring-1 ring-green-500 shadow-md";
                      } else if (isSelected && !isThisCorrect) {
                        stateStyles = "bg-red-50 border-red-500 ring-1 ring-red-500 shadow-md";
                      } else {
                        stateStyles = "bg-gray-50 border-gray-100 opacity-50";
                      }
                    } else if (isSelected) {
                      stateStyles = "bg-primary-50 border-primary-500 ring-1 ring-primary-500";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(originalText)}
                        disabled={showFeedback}
                        className={`
                          w-full p-5 text-left rounded-2xl border-2 transition-all duration-200
                          flex items-center gap-4 group
                          ${stateStyles}
                        `}
                      >
                        <div className={`
                          flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold
                          ${showFeedback && isThisCorrect ? 'border-green-500 bg-green-500 text-white' :
                            showFeedback && isSelected ? 'border-red-500 bg-red-500 text-white' :
                              'border-gray-300 text-gray-400 group-hover:border-primary-400 group-hover:text-primary-400'}
                        `}>
                          {['A', 'B', 'C', 'D'][idx]}
                        </div>
                        <span className={`text-lg ${showFeedback && isThisCorrect ? 'font-bold text-green-900' : 'text-gray-700'}`}>
                          {cleanText}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Inline Feedback Panel */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="pl-0 md:pl-16 mt-8"
                >
                  <div className={`rounded-2xl p-6 border-l-4 shadow-lg ${isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                        {isCorrect ? '✓' : '✗'}
                      </div>
                      <h4 className={`text-xl font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                        {isCorrect ? '回答正確！' : '回答錯誤'}
                      </h4>
                    </div>

                    <div className="prose prose-sm max-w-none text-gray-700 mb-6 leading-relaxed">
                      <p className="text-base">
                        {currentQ.explanation || (isCorrect ? "您對這個概念掌握得很好！" : `正確答案是：${cleanOptionText(currentQ.correctAnswer || '')}`)}
                      </p>
                    </div>

                    <Button
                      onClick={handleNext}
                      className={`w-full py-3 text-lg shadow-md ${isCorrect ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                      {currentIndex < questions.length - 1 ? '下一題 →' : '查看結果'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

