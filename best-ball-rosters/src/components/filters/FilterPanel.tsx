import React from 'react';
import type { FilterOptions, SortOptions } from '../../types';
import { TeamFilter } from './TeamFilter';
import { PlayerFilter } from './PlayerFilter';
import { PositionCountFilter } from './PositionCountFilter';

interface FilterPanelProps {
  filters: FilterOptions;
  sort: SortOptions;
  availableFilterValues: {
    teams: string[];
    players: Array<{ name: string; position: string; team: string }>;
    positions: string[];
    stackSizes: number[];
  };
  onTeamToggle: (team: string) => void;
  onPlayerAdd: (player: string) => void;
  onPlayerRemove: (player: string) => void;
  onStackSizeChange: (min?: number, max?: number) => void;
  onPositionCountChange: (position: string, type: 'min' | 'max', value: number | undefined) => void;
  onClearPositionCounts: () => void;
  onClearAllFilters: () => void;
  onClearTeams: () => void;
  onClearPlayers: () => void;
  onSortChange: (sort: Partial<SortOptions>) => void;
  onSearchPlayers: (query: string) => Array<{ name: string; position: string; team: string; count: number }>;
  hasActiveFilters: boolean;
  filterSummary: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  sort,
  availableFilterValues,
  onTeamToggle,
  onPlayerAdd,
  onPlayerRemove,
  onStackSizeChange,
  onPositionCountChange,
  onClearPositionCounts,
  onClearAllFilters,
  onClearTeams,
  onClearPlayers,
  onSortChange,
  onSearchPlayers,
  hasActiveFilters,
  filterSummary
}) => {

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Filters & Sorting</h2>
        {hasActiveFilters && (
          <button
            onClick={onClearAllFilters}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && filterSummary && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Active filters:</span> {filterSummary}
          </p>
        </div>
      )}

      {/* Sort Controls */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Sort By</h3>
        <div className="flex space-x-2">
          <select
            value={sort.field}
            onChange={(e) => onSortChange({ field: e.target.value as any })}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="lineupId">Lineup ID</option>
            <option value="averageADP">Average ADP</option>
          </select>
          
          <button
            onClick={() => onSortChange({ direction: sort.direction === 'asc' ? 'desc' : 'asc' })}
            className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200"
          >
            {sort.direction === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Team Filter */}
        <TeamFilter
          availableTeams={availableFilterValues.teams}
          selectedTeams={filters.teams}
          onTeamToggle={onTeamToggle}
          onClear={onClearTeams}
        />

        {/* Player Filter */}
        <PlayerFilter
          selectedPlayers={filters.players}
          onPlayerAdd={onPlayerAdd}
          onPlayerRemove={onPlayerRemove}
          onClear={onClearPlayers}
          onSearch={onSearchPlayers}
        />

        {/* Position Count Filter */}
        <PositionCountFilter
          positionCounts={filters.positionCounts || {}}
          onPositionCountChange={onPositionCountChange}
          onClear={onClearPositionCounts}
        />

        {/* Stack Size Filter */}
        {availableFilterValues.stackSizes.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Stack Size</h3>
            </div>
            
            <div className="p-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Min Stack Size
                  </label>
                  <select
                    value={filters.minStackSize || ''}
                    onChange={(e) => onStackSizeChange(
                      e.target.value ? parseInt(e.target.value) : undefined,
                      filters.maxStackSize
                    )}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                  >
                    <option value="">Any</option>
                    {availableFilterValues.stackSizes.map(size => (
                      <option key={size} value={size}>{size}+</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Max Stack Size
                  </label>
                  <select
                    value={filters.maxStackSize || ''}
                    onChange={(e) => onStackSizeChange(
                      filters.minStackSize,
                      e.target.value ? parseInt(e.target.value) : undefined
                    )}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                  >
                    <option value="">Any</option>
                    {availableFilterValues.stackSizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};