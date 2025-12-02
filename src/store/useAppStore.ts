import { create } from 'zustand';
import type { LectureNotes, MaterialType, PetType, QuizQuestion, StudyPlanItem, ResearchResult } from '../types';
import type { KnowledgeAtom } from '../types/memory';

interface AppState {
  uploadType: MaterialType;
  setUploadType: (type: MaterialType) => void;
  studyPlan: StudyPlanItem[];
  setStudyPlan: (plan: StudyPlanItem[]) => void;
  selectedPet: PetType;
  setSelectedPet: (pet: PetType) => void;
  notes: LectureNotes[];
  addNote: (note: LectureNotes) => void;
  quizzes: Record<string, QuizQuestion[]>;
  addQuiz: (noteId: string, questions: QuizQuestion[]) => void;
  researchResults: Record<string, ResearchResult[]>;
  addResearch: (topic: string, results: ResearchResult[]) => void;
  petTrigger: number; // Timestamp to trigger pet wake up
  triggerPet: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  // Chat State
  isChatOpen: boolean;
  setChatOpen: (isOpen: boolean) => void;
  toggleChat: () => void;

  // Pet State
  isPetActive: boolean;
  setPetActive: (active: boolean) => void;
  petMood: 'idle' | 'thinking' | 'happy' | 'confused' | 'listening';
  petMessage: string | null;
  setPetMood: (mood: 'idle' | 'thinking' | 'happy' | 'confused' | 'listening') => void;
  setPetMessage: (message: string | null | undefined) => void;

  // User Mood
  mood: string;
  setMood: (mood: string) => void;

  // Symbiotic Core
  petHealth: number; // 0-100
  petHunger: number; // 0-100
  petXP: number;
  petLevel: number;
  lastFeedTime: number | null; // Timestamp of last feeding
  updatePetStats: (stats: Partial<{ health: number; hunger: number; xp: number; level: number }>) => void;
  rewardPet: (xpAmount: number, hungerReduction: number) => void;
  gainXP: (amount: number) => void;
  feedPet: () => { success: boolean; message: string; cooldownRemaining?: number };
  resetData: () => void;
  // Review Modal State
  reviewModal: {
    isOpen: boolean;
    atoms: KnowledgeAtom[];
  };
  openReviewModal: (atoms: KnowledgeAtom[]) => void;
  closeReviewModal: () => void;
}

// Helper to load from localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Helper to save to localStorage
const saveToStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const useAppStore = create<AppState>((set, get) => ({
  uploadType: 'ppt',
  setUploadType: (type) => set({ uploadType: type }),
  studyPlan: loadFromStorage('ai-student-studyPlan', []),
  setStudyPlan: (plan) => {
    set({ studyPlan: plan });
    saveToStorage('ai-student-studyPlan', plan);
  },
  selectedPet: 'cat',
  setSelectedPet: (pet) => set({ selectedPet: pet }),
  notes: loadFromStorage('ai-student-notes', []),
  addNote: (note) => {
    const newNotes = [...get().notes, note];
    set({ notes: newNotes });
    saveToStorage('ai-student-notes', newNotes);
  },
  quizzes: loadFromStorage('ai-student-quizzes', {}),
  addQuiz: (noteId, questions) => {
    const newQuizzes = { ...get().quizzes, [noteId]: questions };
    set({ quizzes: newQuizzes });
    saveToStorage('ai-student-quizzes', newQuizzes);
  },
  researchResults: loadFromStorage('ai-student-research', {}),
  addResearch: (topic, results) => {
    const newResults = { ...get().researchResults, [topic]: results };
    set({ researchResults: newResults });
    saveToStorage('ai-student-research', newResults);
  },
  petTrigger: 0,
  triggerPet: () => set({ petTrigger: Date.now() }),

  // Sidebar
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  // Chat
  isChatOpen: false,
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  setChatOpen: (isOpen) => set({ isChatOpen: isOpen }),

  // Review Modal
  reviewModal: {
    isOpen: false,
    atoms: [],
  },
  openReviewModal: (atoms) => set({ reviewModal: { isOpen: true, atoms } }),
  closeReviewModal: () => set({ reviewModal: { isOpen: false, atoms: [] } }),

  // Pet
  isPetActive: false,
  setPetActive: (active) => set({ isPetActive: active }),
  petMood: 'idle',
  setPetMood: (mood) => set({ petMood: mood }),
  petMessage: null,
  setPetMessage: (message) => set({ petMessage: message || null }),

  // User Mood
  mood: loadFromStorage('ai-student-mood', '平靜'),
  setMood: (mood) => {
    set({ mood });
    saveToStorage('ai-student-mood', mood);
  },

  // Symbiotic Core
  petHealth: loadFromStorage('ai-student-petHealth', 100),
  petHunger: loadFromStorage('ai-student-petHunger', 0),
  petXP: loadFromStorage('ai-student-petXP', 0),
  petLevel: loadFromStorage('ai-student-petLevel', 1),
  lastFeedTime: loadFromStorage('ai-student-lastFeedTime', null),
  updatePetStats: (stats) => {
    set((state) => {
      const newState = {
        petHealth: stats.health !== undefined ? Math.max(0, Math.min(100, stats.health)) : state.petHealth,
        petHunger: stats.hunger !== undefined ? Math.max(0, Math.min(100, stats.hunger)) : state.petHunger,
        petXP: stats.xp !== undefined ? stats.xp : state.petXP,
        petLevel: stats.level !== undefined ? stats.level : state.petLevel,
      };
      saveToStorage('ai-student-petHealth', newState.petHealth);
      saveToStorage('ai-student-petHunger', newState.petHunger);
      saveToStorage('ai-student-petXP', newState.petXP);
      saveToStorage('ai-student-petLevel', newState.petLevel);
      return newState;
    });
  },
  rewardPet: (xpAmount: number, hungerReduction: number) => {
    set((state) => {
      const newXP = state.petXP + xpAmount;
      const newHunger = Math.max(0, state.petHunger - hungerReduction);
      const nextLevelXP = state.petLevel * 100; // Simple leveling curve

      let newLevel = state.petLevel;
      let finalXP = newXP;
      let petMessage = `+${xpAmount} XP 📚`;

      // Check for level up
      if (newXP >= nextLevelXP) {
        newLevel = state.petLevel + 1;
        finalXP = newXP - nextLevelXP; // Carry over excess XP
        petMessage = `🎉 恭喜！我升級到 Lv.${newLevel} 了！`;
      }

      const newState = {
        petXP: finalXP,
        petLevel: newLevel,
        petHunger: newHunger,
        petMessage: petMessage,
        petMood: 'happy' as const,
      };

      saveToStorage('ai-student-petXP', newState.petXP);
      saveToStorage('ai-student-petLevel', newState.petLevel);
      saveToStorage('ai-student-petHunger', newState.petHunger);
      return newState;
    });
  },
  gainXP: (amount) => {
    set((state) => {
      const newXP = state.petXP + amount;
      const nextLevelXP = state.petLevel * 100; // Simple leveling curve
      if (newXP >= nextLevelXP) {
        const levelUpState = {
          petXP: newXP - nextLevelXP,
          petLevel: state.petLevel + 1,
          petMessage: "升級了！我變得更聰明了！ 🎉"
        };
        saveToStorage('ai-student-petXP', levelUpState.petXP);
        saveToStorage('ai-student-petLevel', levelUpState.petLevel);
        return levelUpState;
      }
      saveToStorage('ai-student-petXP', newXP);
      return { petXP: newXP };
    });
  },
  feedPet: () => {
    const state = get();
    const now = Date.now();
    const cooldownDuration = 30 * 60 * 1000; // 30 minutes

    // Check cooldown
    if (state.lastFeedTime && (now - state.lastFeedTime < cooldownDuration)) {
      const remaining = Math.ceil((cooldownDuration - (now - state.lastFeedTime)) / 1000 / 60);
      return {
        success: false,
        message: `我還不餓！請 ${remaining} 分鐘後再餵我 🙂`,
        cooldownRemaining: remaining
      };
    }

    // Check if hunger is too low (< 30)
    if (state.petHunger < 30) {
      return {
        success: false,
        message: "我現在不餓欸！等我餓了再餵我吧 😊"
      };
    }

    // Feed the pet
    const hungerReduction = 40;
    const healthBonus = 5;
    const xpReward = 5;

    const newPetState = {
      petHunger: Math.max(0, state.petHunger - hungerReduction),
      petHealth: Math.min(100, state.petHealth + healthBonus),
      petXP: state.petXP + xpReward,
      lastFeedTime: now,
      petMessage: "好好吃！謝謝你餵我 ❤️ (+5 XP)",
      petMood: 'happy' as const
    };

    set(newPetState);
    saveToStorage('ai-student-petHunger', newPetState.petHunger);
    saveToStorage('ai-student-petHealth', newPetState.petHealth);
    saveToStorage('ai-student-petXP', newPetState.petXP);
    saveToStorage('ai-student-lastFeedTime', newPetState.lastFeedTime);

    return {
      success: true,
      message: "餵食成功！寵物獲得 5 XP 並恢復 5 點健康度"
    };
  },
  resetData: () => {
    set({
      notes: [],
      quizzes: {},
      researchResults: {},
      studyPlan: [],
      petHealth: 100,
      petHunger: 0,
      petXP: 0,
      petLevel: 1,
      lastFeedTime: null,
      petMood: 'idle',
      petMessage: null
    });

    // Clear localStorage
    localStorage.removeItem('ai-student-notes');
    localStorage.removeItem('ai-student-quizzes');
    localStorage.removeItem('ai-student-research');
    localStorage.removeItem('ai-student-studyPlan');
    localStorage.removeItem('ai-student-petHealth');
    localStorage.removeItem('ai-student-petHunger');
    localStorage.removeItem('ai-student-petXP');
    localStorage.removeItem('ai-student-petLevel');
    localStorage.removeItem('ai-student-lastFeedTime');
  }
}));
