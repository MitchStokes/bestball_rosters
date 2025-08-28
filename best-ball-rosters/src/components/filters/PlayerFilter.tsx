import React, { useState, useCallback } from 'react';
import { getPositionColor } from '../../utils/teamColors';

interface PlayerFilterProps {
  selectedPlayers: string[];
  onPlayerAdd: (player: string) => void;
  onPlayerRemove: (player: string) => void;
  onClear: () => void;
  onSearch: (query: string) => Array<{ name: string; position: string; team: string; count: number }>;
}

export const PlayerFilter: React.FC<PlayerFilterProps> = ({
  selectedPlayers,
  onPlayerAdd,
  onPlayerRemove,
  onClear,
  onSearch
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ name: string; position: string; team: string; count: number }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const results = onSearch(query);
    setSearchResults(results);
    setIsSearching(false);
  }, [onSearch]);

  const handlePlayerSelect = (playerName: string) => {
    onPlayerAdd(playerName);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Players</h3>
          {selectedPlayers.length > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Clear ({selectedPlayers.length})
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
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
        {searchResults.length > 0 && (
          <div className="mt-3 max-h-48 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-sm">
            {searchResults.map(player => (
              <button
                key={player.name}
                onClick={() => handlePlayerSelect(player.name)}
                className="w-full p-4 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50 transition-colors"
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

      {/* Selected Players */}
      {selectedPlayers.length > 0 && (
        <div className="p-3">
          <p className="text-xs text-gray-600 mb-2">
            Selected players (rosters must have ALL selected players):
          </p>
          <div className="space-y-1">
            {selectedPlayers.map(playerName => (
              <div
                key={playerName}
                className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-md"
              >
                <span className="text-sm font-medium text-gray-900">
                  {playerName}
                </span>
                <button
                  onClick={() => onPlayerRemove(playerName)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};