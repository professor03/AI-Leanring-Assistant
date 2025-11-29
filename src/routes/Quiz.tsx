import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import QuizProgressBar from '../components/quiz/QuizProgressBar';
import QuizQuestion from '../components/quiz/QuizQuestion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { api } from '../lib/api';
import type { QuizQuestion as QuizQuestionType } from '../types';

const Quiz = () => {
  const { id = 'notes-1' } = useParams();
  const navigate = useNavigate();
  const { quizzes, gainXP } = useAppStore();
  const [questions, setQuestions] = useState<QuizQuestionType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
    const storedQuiz = quizzes[id];
    if (storedQuiz) {
      setQuestions(storedQuiz);
    } else {
      api
        .getQuiz(id)
        .then(setQuestions)
        .catch(() => setQuestions([]));
    }
  }, [id, quizzes]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      gainXP(20); // Reward for completing quiz
      alert('恭喜完成今日 Active Recall！(+20 XP)');
    }
  };

  if (!questions.length) {
    return <Card>尚未有題目，請先生成講義筆記。</Card>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-2">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← 返回
        </Button>
        <Button variant="ghost" onClick={() => navigate(1)}>
          前進 →
        </Button>
      </div>
      <QuizProgressBar current={currentIndex + 1} total={questions.length} />
      <QuizQuestion
        question={questions[currentIndex]}
        onNext={handleNext}
        isLast={currentIndex === questions.length - 1}
      />
    </div>
  );
};

export default Quiz;
