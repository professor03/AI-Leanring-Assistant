import { KnowledgeAtom } from '../types/memory';

/**
 * SuperMemo-2 (SM-2) Algorithm Implementation
 * 
 * @param atom The current state of the knowledge atom
 * @param quality The user's rating of their recall quality (0-5)
 *        0: Total blackout
 *        1: Incorrect response; the correct one remembered
 *        2: Incorrect response; where the correct one seemed easy to recall
 *        3: Correct response recalled with serious difficulty
 *        4: Correct response after a hesitation
 *        5: Perfect recall
 * 
 * @returns Updates for the atom (nextReview, easeFactor, streak, mastery)
 */
export function calculateReview(atom: KnowledgeAtom, quality: number): Partial<KnowledgeAtom> {
    let { streak, easeFactor, mastery } = atom;

    // 1. Update Mastery & Streak
    if (quality >= 3) {
        // Correct response
        streak += 1;
        mastery = Math.min(5, mastery + 1);
    } else {
        // Incorrect response
        streak = 0;
        mastery = Math.max(0, mastery - 1); // Decrease mastery on failure
    }

    // 2. Calculate Interval (I) in days
    let interval = 1;
    if (streak === 1) {
        interval = 1;
    } else if (streak === 2) {
        interval = 6;
    } else {
        // I(n) = I(n-1) * EF
        // We approximate previous interval based on streak for simplicity in this stateless function,
        // or we could store 'lastInterval'. For now, we'll use a simplified recursive logic 
        // assuming the user followed the schedule.
        // A more robust way is to store 'interval' in the Atom. 
        // Let's assume we want to just calculate the *next* delta.
        // For a true SM-2, we need the previous interval. 
        // Since we don't store it explicitly in the simplified Atom, we'll estimate:
        interval = Math.round(6 * Math.pow(easeFactor, streak - 2));
    }

    // 3. Update Ease Factor (EF)
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    // EF cannot go below 1.3
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    // 4. Calculate Next Review Date
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const nextReview = Date.now() + (interval * ONE_DAY_MS);

    return {
        streak,
        easeFactor,
        mastery,
        lastReview: Date.now(),
        nextReview
    };
}

/**
 * Helper to get initial state for a new atom
 */
export function createInitialAtomState(): Partial<KnowledgeAtom> {
    return {
        mastery: 0,
        streak: 0,
        easeFactor: 2.5,
        lastReview: 0,
        nextReview: Date.now(), // Due immediately
        createdAt: Date.now()
    };
}
