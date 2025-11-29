import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

export function usePetSystem() {
    const {
        petHealth,
        petHunger,
        petLevel,
        updatePetStats,
        setPetMessage,
        isPetActive
    } = useAppStore();

    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        // Heartbeat: Run every 60 seconds
        timerRef.current = window.setInterval(() => {
            // Hunger increases
            const newHunger = Math.min(100, petHunger + 2);

            // Health decreases if hungry
            let newHealth = petHealth;
            if (newHunger > 80) {
                newHealth = Math.max(0, petHealth - 5);
                if (isPetActive) {
                    setPetMessage("我好餓... 肚子咕嚕咕嚕叫... 🍖");
                }
            } else if (newHunger < 20 && petHealth < 100) {
                // Heal if well fed
                newHealth = Math.min(100, petHealth + 2);
            }

            updatePetStats({
                hunger: newHunger,
                health: newHealth
            });

        }, 60000); // 1 minute

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [petHealth, petHunger, isPetActive, updatePetStats, setPetMessage]);

    // Evolution Check (Simple placeholder for now)
    useEffect(() => {
        if (petLevel === 5) {
            // Trigger evolution event (future)
            // setPetMessage("我感覺體內充滿了力量... 要進化了嗎？！ ✨");
        }
    }, [petLevel]);
}
