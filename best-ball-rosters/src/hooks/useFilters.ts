import { useState, useCallback, useMemo } from 'react';
import type { FilterOptions, SortOptions, RosterWithStats, PositionCounts } from '../types';
import { FilterService } from '../services/FilterService';

const initialFilters: FilterOptions = {
  teams: [],
  players: [],
  positions: [],
  minStackSize: undefined,
  maxStackSize: undefined,
  positionCounts: {}
};

const initialSort: SortOptions = {
  field: 'lineupId',
  direction: 'asc'
};

export const useFilters = (rosters: RosterWithStats[]) => {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [sort, setSort] = useState<SortOptions>(initialSort);
  
  const filterService = FilterService.getInstance();

  // Apply filters and sorting
  const filteredAndSortedRosters = useMemo(() => {
    let filtered = filterService.applyFilters(rosters, filters);
    return filterService.sortRosters(filtered, sort);
  }, [rosters, filters, sort, filterService]);

  // Get available filter values based on current data
  const availableFilterValues = useMemo(() => {
    return filterService.getAvailableFilterValues(rosters);
  }, [rosters, filterService]);

  // Filter management functions
  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const addTeamFilter = useCallback((team: string) => {
    setFilters(prev => ({
      ...prev,
      teams: prev.teams.includes(team) ? prev.teams : [...prev.teams, team]
    }));
  }, []);

  const removeTeamFilter = useCallback((team: string) => {
    setFilters(prev => ({
      ...prev,
      teams: prev.teams.filter(t => t !== team)
    }));
  }, []);

  const addPlayerFilter = useCallback((player: string) => {
    setFilters(prev => ({
      ...prev,
      players: prev.players.includes(player) ? prev.players : [...prev.players, player]
    }));
  }, []);

  const removePlayerFilter = useCallback((player: string) => {
    setFilters(prev => ({
      ...prev,
      players: prev.players.filter(p => p !== player)
    }));
  }, []);

  const addPositionFilter = useCallback((position: string) => {
    setFilters(prev => ({
      ...prev,
      positions: prev.positions.includes(position) ? prev.positions : [...prev.positions, position]
    }));
  }, []);

  const removePositionFilter = useCallback((position: string) => {
    setFilters(prev => ({
      ...prev,
      positions: prev.positions.filter(p => p !== position)
    }));
  }, []);

  const setStackSizeFilter = useCallback((minSize?: number, maxSize?: number) => {
    setFilters(prev => ({
      ...prev,
      minStackSize: minSize,
      maxStackSize: maxSize
    }));
  }, []);

  const setPositionCountFilter = useCallback((position: string, type: 'min' | 'max', value: number | undefined) => {
    setFilters(prev => {
      const currentCounts = prev.positionCounts || {};
      const positionCounts = { ...currentCounts };
      
      if (!positionCounts[position as keyof PositionCounts]) {
        positionCounts[position as keyof PositionCounts] = {};
      }
      
      const currentPositionCounts = positionCounts[position as keyof PositionCounts]!;
      currentPositionCounts[type] = value;
      
      // Remove position entry if both min and max are undefined
      if (currentPositionCounts.min === undefined && currentPositionCounts.max === undefined) {
        delete positionCounts[position as keyof PositionCounts];
      }
      
      return {
        ...prev,
        positionCounts
      };
    });
  }, []);

  const clearPositionCountFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      positionCounts: {}
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const clearFilter = useCallback((filterType: keyof FilterOptions) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: filterType === 'minStackSize' || filterType === 'maxStackSize' 
        ? undefined 
        : filterType === 'positionCounts' 
        ? {} 
        : []
    }));
  }, []);

  // Sort management functions
  const updateSort = useCallback((newSort: Partial<SortOptions>) => {
    setSort(prev => ({ ...prev, ...newSort }));
  }, []);

  const toggleSortDirection = useCallback(() => {
    setSort(prev => ({
      ...prev,
      direction: prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Search functionality
  const searchPlayers = useCallback((query: string) => {
    return filterService.searchPlayers(rosters, query);
  }, [rosters, filterService]);

  // Helper functions
  const hasActiveFilters = useMemo(() => {
    return filters.teams.length > 0 || 
           filters.players.length > 0 || 
           filters.positions.length > 0 ||
           filters.minStackSize !== undefined ||
           filters.maxStackSize !== undefined ||
           Object.keys(filters.positionCounts || {}).length > 0;
  }, [filters]);

  const getFilterSummary = useMemo(() => {
    const summary: string[] = [];
    
    if (filters.teams.length > 0) {
      summary.push(`Teams: ${filters.teams.join(', ')}`);
    }
    
    if (filters.players.length > 0) {
      summary.push(`Players: ${filters.players.join(', ')}`);
    }
    
    if (filters.positions.length > 0) {
      summary.push(`Positions: ${filters.positions.join(', ')}`);
    }
    
    if (filters.minStackSize !== undefined || filters.maxStackSize !== undefined) {
      const min = filters.minStackSize || 'any';
      const max = filters.maxStackSize || 'any';
      summary.push(`Stack size: ${min}-${max}`);
    }
    
    if (filters.positionCounts && Object.keys(filters.positionCounts).length > 0) {
      const positionSummary = Object.entries(filters.positionCounts)
        .map(([position, counts]) => {
          const min = counts.min !== undefined ? counts.min.toString() : 'any';
          const max = counts.max !== undefined ? counts.max.toString() : 'any';
          return `${position}: ${min}-${max}`;
        })
        .join(', ');
      summary.push(`Position counts: ${positionSummary}`);
    }
    
    return summary.join(' | ');
  }, [filters]);

  return {
    filters,
    sort,
    filteredRosters: filteredAndSortedRosters,
    availableFilterValues,
    hasActiveFilters,
    filterSummary: getFilterSummary,
    
    // Filter actions
    updateFilters,
    addTeamFilter,
    removeTeamFilter,
    addPlayerFilter,
    removePlayerFilter,
    addPositionFilter,
    removePositionFilter,
    setStackSizeFilter,
    setPositionCountFilter,
    clearPositionCountFilters,
    clearAllFilters,
    clearFilter,
    
    // Sort actions
    updateSort,
    toggleSortDirection,
    
    // Search
    searchPlayers
  };
};