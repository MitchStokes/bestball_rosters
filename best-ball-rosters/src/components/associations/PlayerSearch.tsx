import React, { useState, useCallback } from 'react';
import { getPositionColor } from '../../utils/teamColors';

interface PlayerSearchProps {
  onPlayerSelect: (playerName: string) => void;
  onSearch: (query: string) => Array<{ name: string; position: string; team: string; count: number }>;
  selectedPlayer?: string;
}

export const PlayerSearch: React.FC<PlayerSearchProps> = ({
  onPlayerSelect,
  onSearch,
  selectedPlayer
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ name: string; position: string; team: string; count: number }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);
    const results = onSearch(query);
    setSearchResults(results);
    setIsSearching(false);
  }, [onSearch]);

  const handlePlayerSelect = (playerName: string) => {
    onPlayerSelect(playerName);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const clearSelection = () => {
    onPlayerSelect('');
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Player Search</h3>
          {selectedPlayer && (
            <button
              onClick={clearSelection}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear
            </button>
          )}
        </div>

        {!selectedPlayer ? (
          <>
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search for a player..."
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {isSearching && (
                <div className="absolute right-3 top-3.5">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>

            {/* Search Results */}
            {showResults && searchResults.length > 0 && (
              <div className="mt-3 max-h-64 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-sm">
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

            {showResults && searchResults.length === 0 && !isSearching && searchQuery.length >= 2 && (
              <div className="mt-3 p-4 text-center text-gray-500 border border-gray-200 rounded-md">
                No players found matching "{searchQuery}"
              </div>
            )}
          </>
        ) : (
          /* Selected Player Display */
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-blue-900">Selected Player</h4>
                <p className="text-lg font-bold text-blue-800">{selectedPlayer}</p>
              </div>
              <button
                onClick={clearSelection}
                className="text-blue-600 hover:text-blue-700 p-1"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs text-gray-600">
          Search for a player to see which other players are commonly drafted with them.
        </p>
      </div>
    </div>
  );
};