import React from 'react';
import { getTeamColors } from '../../utils/teamColors';

interface StackFilterProps {
  minStackSize?: number;
  maxStackSize?: number;
  availableStackSizes: number[];
  selectedTeams: string[];
  availableTeams: string[];
  onStackSizeChange: (min?: number, max?: number) => void;
  onTeamToggle: (team: string) => void;
  onClearTeams: () => void;
  sortBy: 'frequency' | 'averageADP';
  sortDirection: 'asc' | 'desc';
  onSortByChange: (sortBy: 'frequency' | 'averageADP') => void;
  onSortDirectionChange: (direction: 'asc' | 'desc') => void;
  onClear: () => void;
}

export const StackFilter: React.FC<StackFilterProps> = ({
  minStackSize,
  maxStackSize,
  availableStackSizes,
  selectedTeams,
  availableTeams,
  onStackSizeChange,
  onTeamToggle,
  onClearTeams,
  sortBy,
  sortDirection,
  onSortByChange,
  onSortDirectionChange,
  onClear
}) => {
  const hasActiveFilters = minStackSize !== undefined || maxStackSize !== undefined || selectedTeams.length > 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters & Sorting</h3>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Sort By */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Sort By</h4>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => onSortByChange('frequency')}
              className={`px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                sortBy === 'frequency'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Frequency
            </button>
            <button
              onClick={() => onSortByChange('averageADP')}
              className={`px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                sortBy === 'averageADP'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Avg ADP
            </button>
          </div>
          
          {/* Sort Direction */}
          <div className="flex space-x-2">
            <button
              onClick={() => onSortDirectionChange('desc')}
              className={`px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                sortDirection === 'desc'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {sortBy === 'frequency' ? '↓ Most Common' : '↓ Lowest ADP'}
            </button>
            <button
              onClick={() => onSortDirectionChange('asc')}
              className={`px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                sortDirection === 'asc'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {sortBy === 'frequency' ? '↑ Least Common' : '↑ Highest ADP'}
            </button>
          </div>
        </div>

        {/* Team Filter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900">Teams</h4>
            {selectedTeams.length > 0 && (
              <button
                onClick={onClearTeams}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Clear ({selectedTeams.length})
              </button>
            )}
          </div>
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
            {availableTeams.map(team => {
              const teamColors = getTeamColors(team);
              const isSelected = selectedTeams.includes(team);
              return (
                <label
                  key={team}
                  className="flex items-center p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onTeamToggle(team)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: teamColors.primary }}
                    />
                    <span className="text-sm font-medium text-gray-900">{team}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Stack Size Filters */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Stack Size</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Min Size
              </label>
              <select
                value={minStackSize || ''}
                onChange={(e) => onStackSizeChange(
                  e.target.value ? parseInt(e.target.value) : undefined,
                  maxStackSize
                )}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any</option>
                {availableStackSizes.map(size => (
                  <option key={size} value={size}>{size}+</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Max Size
              </label>
              <select
                value={maxStackSize || ''}
                onChange={(e) => onStackSizeChange(
                  minStackSize,
                  e.target.value ? parseInt(e.target.value) : undefined
                )}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any</option>
                {availableStackSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};