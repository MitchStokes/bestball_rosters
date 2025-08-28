import { useState, useEffect, useCallback } from 'react';
import type { RosterWithStats, LoadingState } from '../types';
import { RosterService } from '../services/RosterService';
import { PlayerMatchingService } from '../services/PlayerMatchingService';

export const useRosters = () => {
  const [rosters, setRosters] = useState<RosterWithStats[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    error: null
  });

  const rosterService = RosterService.getInstance();
  const playerMatchingService = PlayerMatchingService.getInstance();

  const loadRosters = useCallback(async () => {
    setLoading({ isLoading: true, error: null });
    
    try {
      const rawRosters = await rosterService.loadRosters();
      const enrichedRosters = await playerMatchingService.enrichRostersWithStats(rawRosters);
      
      setRosters(enrichedRosters);
      setLoading({ isLoading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load rosters';
      setLoading({ isLoading: false, error: errorMessage });
    }
  }, [rosterService, playerMatchingService]);

  const refreshRosters = useCallback(async () => {
    rosterService.clearCache();
    await loadRosters();
  }, [rosterService, loadRosters]);

  const getRosterById = useCallback((lineupId: number): RosterWithStats | undefined => {
    return rosters.find(roster => roster.LineupId === lineupId);
  }, [rosters]);

  const getRostersByPlayer = useCallback((playerName: string): RosterWithStats[] => {
    const normalizedName = playerName.toLowerCase();
    return rosters.filter(roster => 
      roster.Players.some(player => 
        `${player.fn} ${player.ln}`.toLowerCase().includes(normalizedName)
      )
    );
  }, [rosters]);

  const getRostersByTeam = useCallback((teamAbbr: string): RosterWithStats[] => {
    return rosters.filter(roster => 
      roster.Players.some(player => 
        player.atabbr === teamAbbr || player.htabbr === teamAbbr
      )
    );
  }, [rosters]);

  const getValueRankings = useCallback((): RosterWithStats[] => {
    return [...rosters]
      .filter(roster => roster.totalADP > 0) // Only include rosters with ADP data
      .sort((a, b) => a.totalADP - b.totalADP); // Lower total ADP = better value
  }, [rosters]);

  const getTopValueRosters = useCallback((count: number = 10): RosterWithStats[] => {
    return getValueRankings().slice(0, count);
  }, [getValueRankings]);

  // Auto-load rosters on mount
  useEffect(() => {
    loadRosters();
  }, [loadRosters]);

  return {
    rosters,
    loading,
    loadRosters,
    refreshRosters,
    getRosterById,
    getRostersByPlayer,
    getRostersByTeam,
    getValueRankings,
    getTopValueRosters
  };
};