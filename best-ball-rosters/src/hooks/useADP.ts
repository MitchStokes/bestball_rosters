import { useState, useEffect, useCallback } from 'react';
import type { ADPEntry, LoadingState } from '../types';
import { ADPService } from '../services/ADPService';

export const useADP = () => {
  const [adpData, setADPData] = useState<ADPEntry[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    error: null
  });

  const adpService = ADPService.getInstance();

  const loadADP = useCallback(async () => {
    setLoading({ isLoading: true, error: null });
    
    try {
      const data = await adpService.loadADP();
      setADPData(data);
      setLoading({ isLoading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load ADP data';
      setLoading({ isLoading: false, error: errorMessage });
    }
  }, [adpService]);

  const refreshADP = useCallback(async () => {
    adpService.clearCache();
    await loadADP();
  }, [adpService, loadADP]);

  const getADPByPlayerName = useCallback((firstName: string, lastName: string): ADPEntry | null => {
    return adpService.getADPByPlayerName(firstName, lastName);
  }, [adpService]);

  const getADPById = useCallback((playerId: string): ADPEntry | null => {
    return adpService.getADPById(playerId);
  }, [adpService]);

  const getPlayersByPosition = useCallback((position: string): ADPEntry[] => {
    return adpService.getPlayersByPosition(position);
  }, [adpService]);

  const getTopPlayersByPosition = useCallback((position: string, count: number = 10): ADPEntry[] => {
    return adpService.getTopPlayersByPosition(position, count);
  }, [adpService]);

  const getAllPositions = useCallback((): string[] => {
    return adpService.getAllPositions();
  }, [adpService]);

  const getPlayerRank = useCallback((playerId: string): number | null => {
    const player = adpService.getADPById(playerId);
    if (!player) return null;
    
    // Find rank by counting players with better (lower) ADP
    const betterPlayers = adpData.filter(p => p.ADP < player.ADP).length;
    return betterPlayers + 1;
  }, [adpService, adpData]);

  const getPositionRank = useCallback((playerId: string): number | null => {
    const player = adpService.getADPById(playerId);
    if (!player) return null;
    
    const positionPlayers = adpService.getPlayersByPosition(player.Position);
    const betterPlayers = positionPlayers.filter(p => p.ADP < player.ADP).length;
    return betterPlayers + 1;
  }, [adpService]);

  const searchPlayers = useCallback((query: string): ADPEntry[] => {
    const normalizedQuery = query.toLowerCase();
    return adpData
      .filter(player => 
        player.Name.toLowerCase().includes(normalizedQuery) ||
        player.Team.toLowerCase().includes(normalizedQuery)
      )
      .sort((a, b) => a.ADP - b.ADP)
      .slice(0, 20); // Limit to top 20 results
  }, [adpData]);

  const getADPStats = useCallback(() => {
    if (adpData.length === 0) return null;

    const positions = adpService.getAllPositions();
    const positionStats = positions.map(position => {
      const players = adpService.getPlayersByPosition(position);
      const avgADP = players.reduce((sum, p) => sum + p.ADP, 0) / players.length;
      
      return {
        position,
        count: players.length,
        averageADP: Math.round(avgADP * 10) / 10,
        topPlayer: players.sort((a, b) => a.ADP - b.ADP)[0]
      };
    });

    return {
      totalPlayers: adpData.length,
      averageADP: Math.round((adpData.reduce((sum, p) => sum + p.ADP, 0) / adpData.length) * 10) / 10,
      positionBreakdown: positionStats
    };
  }, [adpData, adpService]);

  // Auto-load ADP data on mount
  useEffect(() => {
    loadADP();
  }, [loadADP]);

  return {
    adpData,
    loading,
    loadADP,
    refreshADP,
    getADPByPlayerName,
    getADPById,
    getPlayersByPosition,
    getTopPlayersByPosition,
    getAllPositions,
    getPlayerRank,
    getPositionRank,
    searchPlayers,
    getADPStats
  };
};