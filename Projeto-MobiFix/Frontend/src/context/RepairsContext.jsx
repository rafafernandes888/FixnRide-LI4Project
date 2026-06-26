import { createContext, useContext, useState } from 'react';
import { mockRepairs } from '../data/mockData';

const RepairsContext = createContext(undefined);

export function RepairsProvider({ children }) {
    const [repairs, setRepairs] = useState(mockRepairs);

    const updateRepairStatus = (repairId, status) => {
        setRepairs((prev) =>
            prev.map((r) => (r.id === repairId ? { ...r, status } : r))
        );
    };

    const addRepairDetails = (repairId, interventions, parts, notes) => {
        setRepairs((prev) =>
            prev.map((r) =>
                r.id === repairId
                    ? {
                        ...r,
                        interventions: interventions.map((i) => ({
                            ...i,
                            completed: false,
                        })),
                        parts,
                        notes,
                    }
                    : r
            )
        );
    };

    const completeIntervention = (repairId, interventionId) => {
        setRepairs((prev) =>
            prev.map((r) => {
                if (r.id === repairId && r.interventions) {
                    const updatedInterventions = r.interventions.map((i) =>
                        i.id === interventionId ? { ...i, completed: true } : i
                    );

                    // Verifica se todas as intervenções foram concluídas
                    const allCompleted = updatedInterventions.every((i) => i.completed);

                    return {
                        ...r,
                        interventions: updatedInterventions,
                        status: allCompleted ? 'completed' : r.status,
                    };
                }
                return r;
            })
        );
    };

    const getRepair = (repairId) => {
        return repairs.find((r) => r.id === repairId);
    };

    return (
        <RepairsContext.Provider
            value={{
                repairs,
                updateRepairStatus,
                addRepairDetails,
                completeIntervention,
                getRepair,
            }}
        >
            {children}
        </RepairsContext.Provider>
    );
}

export function useRepairs() {
    const context = useContext(RepairsContext);
    if (!context) {
        throw new Error('useRepairs deve ser usado dentro de um RepairsProvider');
    }
    return context;
}