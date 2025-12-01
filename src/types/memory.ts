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
    masteredCount: number;
    newCount: number;
}

export interface KnowledgeStock {
    id: string;                    // Stock ID (same as Note ID)
    name: string;                  // Stock name (Note title)
    sourceId: string;              // Reference to Note ID
    icon: string;                  // Stock icon (auto-assigned or custom)

    // Holdings
    totalHoldings: number;         // Total atoms from this Note
    masteredHoldings: number;      // Atoms with mastery >= 4

    // Dividends
    monthlyDividend: number;       // Dividends earned this month
    totalEarnings: number;         // All-time total earnings
    lastDividendDate: number;      // Timestamp of last dividend

    // Performance
    performance: number;           // Average mastery percentage (0-100%)
    trend: 'up' | 'down' | 'stable'; // Performance trend
}

export interface StockStats {
    totalStocks: number;
    totalValue: number;            // Sum of all totalEarnings
    topPerformer: KnowledgeStock | null;
    monthlyReturn: number;         // Sum of all monthlyDividend
}
