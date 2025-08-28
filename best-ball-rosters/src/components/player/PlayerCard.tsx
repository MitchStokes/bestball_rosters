import React from 'react';
import type { PlayerWithADP } from '../../types';
import { PlayerAvatar } from './PlayerAvatar';
import { getTeamColors, getPositionColor } from '../../utils/teamColors';

interface PlayerCardProps {
  player: PlayerWithADP;
  size?: 'sm' | 'md' | 'lg';
  showADP?: boolean;
  showTeamColors?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, 
  size = 'md',
  showADP = true,
  showTeamColors = true 
}) => {
  const actualTeam = player.actualTeam || player.atabbr;
  const teamColors = actualTeam === 'FA' ? { primary: '#6B7280', secondary: '#9CA3AF', accent: '#FFFFFF' } : getTeamColors(actualTeam);
  const positionColor = getPositionColor(player.actualPosition || player.pn);
  
  const cardClasses = {
    sm: 'p-2 text-xs',
    md: 'p-3 text-sm',
    lg: 'p-4 text-base'
  };

  const avatarSize = {
    sm: 'sm' as const,
    md: 'md' as const, 
    lg: 'lg' as const
  };

  const cardStyle = showTeamColors ? {
    borderColor: teamColors.primary,
    background: `linear-gradient(135deg, ${teamColors.primary}15, ${teamColors.secondary}10)`
  } : {};

  return (
    <div 
      className={`${cardClasses[size]} bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-shadow duration-200`}
      style={cardStyle}
    >

      <div className="flex items-center space-x-3">
        <PlayerAvatar player={player} size={avatarSize[size]} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-900 truncate">
              {player.fn} {player.ln}
            </h3>
            <span 
              className="px-2 py-1 text-xs font-medium text-white rounded"
              style={{ backgroundColor: positionColor }}
            >
              {player.actualPosition || player.pn}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-gray-600 font-medium">
              {actualTeam}
            </span>

            {showADP && player.adp && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">
                  ADP: {player.adpRank}
                </span>
              </>
            )}

            {player.byeWeek && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">
                  Bye: {player.byeWeek}
                </span>
              </>
            )}

            {player.ppg && parseFloat(player.ppg) > 0 && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">
                  {parseFloat(player.ppg).toFixed(1)} PPG
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};