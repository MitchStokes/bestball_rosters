import React, { useState } from 'react';
import type { RosterWithStats } from '../../types';
import { PlayerCard } from '../player/PlayerCard';

interface RosterCardProps {
  roster: RosterWithStats;
  showExpanded?: boolean;
}

export const RosterCard: React.FC<RosterCardProps> = ({ 
  roster, 
  showExpanded = true 
}) => {
  const [isExpanded, setIsExpanded] = useState(showExpanded);
  
  const positions = ['QB', 'RB', 'WR', 'TE'];
  
  const getPositionPlayers = (position: string) => {
    const players = roster.playersByActualPosition?.[position] || [];
    // Sort by ADP (lowest first), with players without ADP at the end
    return players.sort((a, b) => {
      if (!a.adp && !b.adp) return 0;
      if (!a.adp) return 1;
      if (!b.adp) return -1;
      return a.adp - b.adp;
    });
  };

  const getPositionCount = (position: string) => {
    const players = roster.playersByActualPosition?.[position] || [];
    return players.length;
  };

  const formatADP = (adp: number) => {
    return adp === 0 ? '--' : adp.toFixed(1);
  };

  const getValueGrade = (): { grade: string; color: string } | null => {
    if (!roster.totalADP || roster.totalADP === 0) return null;
    
    // Lower total ADP = better value
    // Rough grading: <1500=A, <2000=B, <2500=C, else D
    if (roster.totalADP < 1500) return { grade: 'A', color: 'text-green-600' };
    if (roster.totalADP < 2000) return { grade: 'B', color: 'text-blue-600' };
    if (roster.totalADP < 2500) return { grade: 'C', color: 'text-yellow-600' };
    return { grade: 'D', color: 'text-red-600' };
  };

  const valueGrade = getValueGrade();

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {roster.DisplayName}
            </h3>
            <p className="text-sm text-gray-600">
              Lineup #{roster.LineupId}
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600">
              Avg ADP: {formatADP(roster.averageADP)}
            </div>
          </div>
        </div>
      </div>

      {/* Position Summary */}
      <div className="p-4">
        <div className="grid grid-cols-4 gap-2 mb-4">
          {positions.map(position => {
            const count = getPositionCount(position);
            return (
              <div key={position} className="text-center">
                <div className="text-xs font-semibold text-gray-600 mb-1">
                  {position}
                </div>
                <div className="text-sm text-gray-900">
                  {count}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors duration-200"
        >
          {isExpanded ? 'Hide Players ▲' : `Show All ${roster.Players.length} Players ▼`}
        </button>
      </div>

      {/* Expanded Player List */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="border-t border-gray-200 pt-4">
            {positions.map(position => {
              const players = getPositionPlayers(position);
              if (players.length === 0) return null;
              
              return (
                <div key={position} className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    {position} ({players.length})
                  </h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    {players.map(player => (
                      <PlayerCard 
                        key={player.pid} 
                        player={player} 
                        size="sm"
                        showTeamColors={true}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};