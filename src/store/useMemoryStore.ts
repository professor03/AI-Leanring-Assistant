import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { KnowledgeAtom, MemoryStats } from '../types/memory';

interface MemoryState {
    atoms: KnowledgeAtom[];

    // Actions
    addAtom: (atom: Omit<KnowledgeAtom, 'id' | 'createdAt' | 'mastery' | 'streak' | 'easeFactor' | 'lastReview' | 'nextReview'>) => void;
    updateAtom: (id: string, updates: Partial<KnowledgeAtom>) => void;
    deleteAtom: (id: string) => void;
    getDueAtoms: () => KnowledgeAtom[];
    getStats: () => MemoryStats;

    // Debug/Dev
    resetMemory: () => void;
}

export const useMemoryStore = create<MemoryState>()(
    persist(
        (set, get) => ({
            atoms: [],

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

            resetMemory: () => set({ atoms: [] })
        }),
        {
            name: 'ai-student-memory', // Unique key for localStorage
        }
    )
);
