import React from 'react';
import type { Stack } from '../../types';
import { getTeamColors } from '../../utils/teamColors';

interface StackCardProps {
  stack: Stack;
  totalRosters: number;
}

export const StackCard: React.FC<StackCardProps> = ({ stack, totalRosters }) => {
  const teamColors = getTeamColors(stack.team);

  const cardStyle = {
    borderColor: teamColors.primary,
    background: `linear-gradient(135deg, ${teamColors.primary}15, ${teamColors.secondary}10)`
  };

  return (
    <div 
      className="bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-shadow duration-200 p-4"
      style={cardStyle}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: teamColors.primary }}
          >
            {stack.team}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {stack.team} {stack.size}-Stack
            </h3>
            <p className="text-sm text-gray-600">
              {stack.frequency} roster{stack.frequency !== 1 ? 's' : ''} • {stack.percentage.toFixed(1)}%
              {stack.averageADP < 999 && (
                <span> • Avg ADP: {stack.averageADP.toFixed(1)}</span>
              )}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">
            {stack.frequency}
          </div>
          <div className="text-xs text-gray-500">
            of {totalRosters}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Players:</h4>
        <div className="flex flex-wrap gap-2">
          {stack.players.map((player, index) => {
            const actualPosition = player.actualPosition || player.pn;
            return (
              <div
                key={`${player.pid}-${index}`}
                className="bg-gray-100 px-3 py-1 rounded-full text-sm"
              >
                <span className="font-medium text-gray-900">
                  {player.fn} {player.ln}
                </span>
                <span className="text-gray-600 ml-1">
                  ({actualPosition})
                </span>
                {player.adp && (
                  <span className="text-gray-500 ml-1">
                    - ADP {Math.round(player.adp)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${stack.percentage}%`,
              backgroundColor: teamColors.primary 
            }}
          />
        </div>
      </div>
    </div>
  );
};