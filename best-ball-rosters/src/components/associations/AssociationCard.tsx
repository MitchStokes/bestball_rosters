import React from 'react';
import type { PlayerAssociation } from '../../types';
import { getTeamColors, getPositionColor } from '../../utils/teamColors';

interface AssociationCardProps {
  association: PlayerAssociation;
  searchedPlayerRosters: number;
}

export const AssociationCard: React.FC<AssociationCardProps> = ({ 
  association, 
  searchedPlayerRosters 
}) => {
  const { player, sharedRosters, sharedPercentage, averageADP } = association;
  
  const actualTeam = player.actualTeam || player.atabbr;
  const teamColors = actualTeam === 'FA' ? { primary: '#6B7280', secondary: '#9CA3AF', accent: '#FFFFFF' } : getTeamColors(actualTeam);
  const positionColor = getPositionColor(player.actualPosition || player.pn);

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
          <div className="flex items-center space-x-2">
            {player.i ? (
              <img 
                src={player.i} 
                alt={`${player.fn} ${player.ln}`}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${!player.i ? '' : 'hidden'}`}
              style={{ backgroundColor: teamColors.primary }}
            >
              {player.fn.charAt(0)}{player.ln.charAt(0)}
            </div>
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-gray-900">
                {player.fn} {player.ln}
              </h3>
              <span 
                className="px-2 py-1 text-xs font-medium text-white rounded"
                style={{ backgroundColor: positionColor }}
              >
                {player.actualPosition || player.pn}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="font-medium">{actualTeam}</span>
              
              {player.adp && (
                <>
                  <span>•</span>
                  <span>ADP: {player.adpRank}</span>
                </>
              )}
              
              {player.byeWeek && (
                <>
                  <span>•</span>
                  <span>Bye: {player.byeWeek}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">
            {sharedPercentage.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">
            {sharedRosters} of {searchedPlayerRosters}
          </div>
        </div>
      </div>

      {/* Association Stats */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Shared Rosters:</span>
          <span className="font-medium text-gray-900">
            {sharedRosters} ({sharedPercentage.toFixed(1)}%)
          </span>
        </div>
        
        {averageADP < 999 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Average ADP:</span>
            <span className="font-medium text-gray-900">
              {averageADP.toFixed(1)}
            </span>
          </div>
        )}
        
        {player.ppg && parseFloat(player.ppg) > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">PPG:</span>
            <span className="font-medium text-gray-900">
              {parseFloat(player.ppg).toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${sharedPercentage}%`,
              backgroundColor: teamColors.primary 
            }}
          />
        </div>
      </div>
    </div>
  );
};