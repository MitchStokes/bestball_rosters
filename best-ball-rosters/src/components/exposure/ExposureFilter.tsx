import React, { useState, useCallback } from 'react';
import { getTeamColors, getPositionColor } from '../../utils/teamColors';

interface ExposureFilterProps {
  selectedTeams: string[];
  availableTeams: string[];
  onTeamToggle: (team: string) => void;
  onClearTeams: () => void;
  playerNameQuery: string;
  onPlayerNameChange: (query: string) => void;
  onSearchPlayers: (query: string) => Array<{ name: string; position: string; team: string; count: number }>;
  sortBy: 'frequency' | 'averageADP';
  sortDirection: 'asc' | 'desc';
  onSortByChange: (sortBy: 'frequency' | 'averageADP') => void;
  onSortDirectionChange: (direction: 'asc' | 'desc') => void;
  onClear: () => void;
}

export const ExposureFilter: React.FC<ExposureFilterProps> = ({
  selectedTeams,
  availableTeams,
  onTeamToggle,
  onClearTeams,
  playerNameQuery,
  onPlayerNameChange,
  onSearchPlayers,
  sortBy,
  sortDirection,
  onSortByChange,
  onSortDirectionChange,
  onClear
}) => {
  const [searchResults, setSearchResults] = useState<Array<{ name: string; position: string; team: string; count: number }>>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const hasActiveFilters = selectedTeams.length > 0 || playerNameQuery.trim().length > 0;

  const handlePlayerSearch = useCallback((query: string) => {
    onPlayerNameChange(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);
    const results = onSearchPlayers(query);
    setSearchResults(results);
    setIsSearching(false);
  }, [onPlayerNameChange, onSearchPlayers]);

  const handlePlayerSelect = (playerName: string) => {
    onPlayerNameChange(playerName);
    setSearchResults([]);
    setShowResults(false);
  };


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

        {/* Player Name Filter */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Player Name</h4>
          <div className="relative">
            <input
              type="text"
              value={playerNameQuery}
              onChange={(e) => handlePlayerSearch(e.target.value)}
              placeholder="Search for players..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {isSearching && (
              <div className="absolute right-3 top-2.5">
                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>

          {/* Search Results */}
          {showResults && searchResults.length > 0 && (
            <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-sm">
              {searchResults.map(player => (
                <button
                  key={player.name}
                  onClick={() => handlePlayerSelect(player.name)}
                  className="w-full p-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="text-sm font-semibold text-gray-900 truncate">
                          {player.name}
                        </span>
                        <span 
                          className="px-2 py-1 text-xs font-medium text-white rounded flex-shrink-0"
                          style={{ backgroundColor: getPositionColor(player.position) }}
                        >
                          {player.position}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <span>{player.team}</span>
                        <span>•</span>
                        <span>{player.count} roster{player.count !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Team Filter */}
        {availableTeams.length > 0 && (
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
        )}
      </div>
    </div>
  );
};