import { useState, useEffect, useCallback } from 'react';
import type { DraftablePlayer, LoadingState } from '../types';
import { DraftablesService } from '../services/DraftablesService';

export const useDraftables = () => {
  const [draftablesData, setDraftablesData] = useState<DraftablePlayer[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    error: null
  });

  const draftablesService = DraftablesService.getInstance();

  const loadDraftables = useCallback(async () => {
    setLoading({ isLoading: true, error: null });
    
    try {
      const data = await draftablesService.loadDraftables();
      setDraftablesData(data);
      setLoading({ isLoading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load draftables data';
      setLoading({ isLoading: false, error: errorMessage });
    }
  }, [draftablesService]);

  const refreshDraftables = useCallback(async () => {
    draftablesService.clearCache();
    await loadDraftables();
  }, [draftablesService, loadDraftables]);

  const getActualPosition = useCallback((playerId: number): string | null => {
    return draftablesService.getActualPosition(playerId);
  }, [draftablesService]);

  const getDraftablePlayer = useCallback((playerId: number): DraftablePlayer | null => {
    return draftablesService.getDraftablePlayer(playerId);
  }, [draftablesService]);

  const getPlayersByActualPosition = useCallback((position: string): DraftablePlayer[] => {
    return draftablesService.getPlayersByActualPosition(position);
  }, [draftablesService]);

  const getAllActualPositions = useCallback((): string[] => {
    return draftablesService.getAllActualPositions();
  }, [draftablesService]);

  // Auto-load draftables data on mount
  useEffect(() => {
    loadDraftables();
  }, [loadDraftables]);

  return {
    draftablesData,
    loading,
    loadDraftables,
    refreshDraftables,
    getActualPosition,
    getDraftablePlayer,
    getPlayersByActualPosition,
    getAllActualPositions
  };
};