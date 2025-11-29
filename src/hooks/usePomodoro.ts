import { useEffect, useRef, useState } from 'react';
import { toISODate } from '../lib/format';

export type PomodoroSessionType = 'focus' | 'short-break' | 'long-break';

interface PomodoroStorage {
  currentDate: string;
  completedToday: number;
  history: Record<string, number>;
}

export interface PomodoroController {
  sessionType: PomodoroSessionType;
  secondsLeft: number;
  isRunning: boolean;
  completedToday: number;
  currentDate: string;
  history: Record<string, number>;
  start: () => void;
  pause: () => void;
  resetSession: () => void;
  skipBreak: () => void;
}

const STORAGE_KEY = 'ai-learning-pomodoro';

export const SESSION_DURATIONS: Record<PomodoroSessionType, number> = {
  focus: 25 * 60,
  'short-break': 5 * 60,
  'long-break': 15 * 60,
};

const readStorage = (): PomodoroStorage => {
  if (typeof window === 'undefined') {
    return { currentDate: toISODate(new Date()), completedToday: 0, history: {} };
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { currentDate: toISODate(new Date()), completedToday: 0, history: {} };
  }
  try {
    const parsed = JSON.parse(raw) as PomodoroStorage;
    return {
      currentDate: parsed.currentDate ?? toISODate(new Date()),
      completedToday: parsed.completedToday ?? 0,
      history: parsed.history ?? {},
    };
  } catch {
    return { currentDate: toISODate(new Date()), completedToday: 0, history: {} };
  }
};

export const usePomodoro = (): PomodoroController => {
  const [sessionType, setSessionType] = useState<PomodoroSessionType>('focus');
  const [secondsLeft, setSecondsLeft] = useState(SESSION_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [storage, setStorage] = useState<PomodoroStorage>(() => readStorage());

  const intervalRef = useRef<number | null>(null);
  const storageRef = useRef(storage);

  const persist = (data: PomodoroStorage) => {
    storageRef.current = data;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  };

  useEffect(() => {
    persist(storage);
  }, [storage]);

  const resetTimerFor = (type: PomodoroSessionType) => {
    setSessionType(type);
    setSecondsLeft(SESSION_DURATIONS[type]);
  };

  const rolloverIfNeeded = () => {
    const today = toISODate(new Date());
    const latest = storageRef.current;
    if (latest.currentDate === today) return;
    setStorage((prev) => {
      const updatedHistory = { ...prev.history };
      if (prev.completedToday > 0) {
        updatedHistory[prev.currentDate] =
          (updatedHistory[prev.currentDate] ?? 0) + prev.completedToday;
      }
      return {
        currentDate: today,
        completedToday: 0,
        history: updatedHistory,
      };
    });
  };

  useEffect(() => {
    rolloverIfNeeded();
    const checker = window.setInterval(rolloverIfNeeded, 60 * 1000);
    return () => window.clearInterval(checker);
  }, []);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(intervalRef.current!);
          intervalRef.current = null;
          handleSessionCompleted();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, sessionType]);

  const handleSessionCompleted = () => {
    setIsRunning(false);
    if (sessionType === 'focus') {
      const nextCount = storageRef.current.completedToday + 1;
      setStorage((prev) => ({
        ...prev,
        completedToday: nextCount,
      }));
      const needsLongBreak = nextCount % 4 === 0;
      const next = needsLongBreak ? 'long-break' : 'short-break';
      resetTimerFor(next);
      setIsRunning(true);
      // Trigger pet for break
      import('../store/useAppStore').then(({ useAppStore }) => {
        useAppStore.getState().triggerPet();
      });
    } else {
      resetTimerFor('focus');
      setIsRunning(true);
    }
  };

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const resetSession = () => {
    pause();
    resetTimerFor('focus');
  };
  const skipBreak = () => {
    if (sessionType !== 'focus') {
      resetTimerFor('focus');
      setIsRunning(false);
    }
  };

  return {
    sessionType,
    secondsLeft,
    isRunning,
    completedToday: storage.completedToday,
    currentDate: storage.currentDate,
    history: storage.history,
    start,
    pause,
    resetSession,
    skipBreak,
  };
};
