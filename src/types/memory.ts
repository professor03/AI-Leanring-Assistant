export interface KnowledgeAtom {
    /** Unique UUID for the atom */
    id: string;
    /** The core concept term (e.g., "Mitochondria") */
    term: string;
    /** The definition or context */
    definition: string;
    /** ID of the source note this was extracted from */
    sourceId: string;
    /** Current mastery level (0-5) */
    mastery: number;
    /** Number of consecutive correct answers */
    streak: number;
    /** Ease factor for SM-2 algorithm (default 2.5) */
    easeFactor: number;
    /** Timestamp of the last review */
    lastReview: number;
    /** Timestamp of when the next review is due */
    nextReview: number;
    /** Creation timestamp */
    createdAt: number;
}

export interface MemoryStats {
    totalAtoms: number;
    atomsDue: number;
    masteredCount: number; // Mastery >= 4
    newCount: number;      // Mastery = 0
}
