import React, { useState } from 'react';
import { getTeamColors } from '../../utils/teamColors';

interface TeamFilterProps {
  availableTeams: string[];
  selectedTeams: string[];
  onTeamToggle: (team: string) => void;
  onClear: () => void;
}

export const TeamFilter: React.FC<TeamFilterProps> = ({
  availableTeams,
  selectedTeams,
  onTeamToggle,
  onClear
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const sortedTeams = availableTeams.sort();

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Teams</h3>
          <div className="flex items-center space-x-2">
            {selectedTeams.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Clear ({selectedTeams.length})
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              {isExpanded ? 'Hide ▲' : 'Show ▼'}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3">
          <div className="max-h-40 overflow-y-auto space-y-1">
            {sortedTeams.map(team => {
              const isSelected = selectedTeams.includes(team);
              const teamColors = getTeamColors(team);
              
              return (
                <label
                  key={team}
                  className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onTeamToggle(team)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: teamColors.primary }}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {team}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
          
          {selectedTeams.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-2">
                Selected teams (rosters must have players from ALL selected teams):
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedTeams.map(team => {
                  const teamColors = getTeamColors(team);
                  return (
                    <span
                      key={team}
                      className="px-2 py-1 text-xs font-medium text-white rounded"
                      style={{ backgroundColor: teamColors.primary }}
                    >
                      {team}
                      <button
                        onClick={() => onTeamToggle(team)}
                        className="ml-1 text-white hover:text-gray-200"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};