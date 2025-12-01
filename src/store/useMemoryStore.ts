import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { KnowledgeAtom, MemoryStats, KnowledgeStock } from '../types/memory';

interface MemoryState {
    atoms: KnowledgeAtom[];
    stocks: Record<string, KnowledgeStock>; // Stock ID -> Stock data

    // Actions
    addAtom: (atom: Omit<KnowledgeAtom, 'id' | 'createdAt' | 'mastery' | 'streak' | 'easeFactor' | 'lastReview' | 'nextReview'>) => void;
    updateAtom: (id: string, updates: Partial<KnowledgeAtom>) => void;
    deleteAtom: (id: string) => void;
    getDueAtoms: () => KnowledgeAtom[];
    getStats: () => MemoryStats;

    // Stock actions
    updateStock: (stockId: string, updates: Partial<KnowledgeStock>) => void;
    recordDividend: (stockId: string, dividend: number) => void;
    getStocks: () => KnowledgeStock[];

    // Debug/Dev
    resetMemory: () => void;
}

export const useMemoryStore = create<MemoryState>()(
    persist(
        (set, get) => ({
            atoms: [],
            stocks: {},

            addAtom: (atomData) => {
                const newAtom: KnowledgeAtom = {
                    id: crypto.randomUUID(),
                    ...atomData,
                    mastery: 0,
                    streak: 0,
                    easeFactor: 2.5,
                    lastReview: 0,
                    nextReview: Date.now(), // Due immediately
                    createdAt: Date.now(),
                };

                // Check for duplicates (simple term check)
                const exists = get().atoms.some(a => a.term.toLowerCase() === atomData.term.toLowerCase());
                if (exists) return; // Or handle merge logic later

                set((state) => ({
                    atoms: [...state.atoms, newAtom]
                }));
            },

            updateAtom: (id, updates) => {
                set((state) => ({
                    atoms: state.atoms.map(atom =>
                        atom.id === id ? { ...atom, ...updates } : atom
                    )
                }));
            },

            deleteAtom: (id) => {
                set((state) => ({
                    atoms: state.atoms.filter(atom => atom.id !== id)
                }));
            },

            getDueAtoms: () => {
                const now = Date.now();
                return get().atoms.filter(atom => atom.nextReview <= now);
            },

            getStats: () => {
                const atoms = get().atoms;
                const now = Date.now();
                return {
                    totalAtoms: atoms.length,
                    atomsDue: atoms.filter(a => a.nextReview <= now).length,
                    masteredCount: atoms.filter(a => a.mastery >= 4).length,
                    newCount: atoms.filter(a => a.mastery === 0).length
                };
            },

            updateStock: (stockId, updates) => {
                set((state) => ({
                    stocks: {
                        ...state.stocks,
                        [stockId]: {
                            ...state.stocks[stockId],
                            ...updates
                        }
                    }
                }));
            },

            recordDividend: (stockId, dividend) => {
                const stock = get().stocks[stockId];
                if (!stock) return;

                set((state) => ({
                    stocks: {
                        ...state.stocks,
                        [stockId]: {
                            ...stock,
                            monthlyDividend: stock.monthlyDividend + dividend,
                            totalEarnings: stock.totalEarnings + dividend,
                            lastDividendDate: Date.now()
                        }
                    }
                }));
            },

            getStocks: () => {
                return Object.values(get().stocks);
            },

            resetMemory: () => set({ atoms: [], stocks: {} })
        }),
        {
            name: 'ai-student-memory', // Unique key for localStorage
        }
    )
);
