import React, { useState } from 'react';
import type { PlayerWithADP } from '../../types';

interface PlayerAvatarProps {
  player: PlayerWithADP;
  size?: 'sm' | 'md' | 'lg';
  showFallback?: boolean;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ 
  player, 
  size = 'md',
  showFallback = true 
}) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm', 
    lg: 'w-16 h-16 text-base'
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getInitials = () => {
    return `${player.fn.charAt(0)}${player.ln.charAt(0)}`.toUpperCase();
  };

  if (!player.i || imageError) {
    if (!showFallback) return null;
    
    return (
      <div 
        className={`${sizeClasses[size]} rounded-full bg-gray-600 flex items-center justify-center text-white font-medium`}
        title={`${player.fn} ${player.ln}`}
      >
        {getInitials()}
      </div>
    );
  }

  return (
    <img
      src={player.i}
      alt={`${player.fn} ${player.ln}`}
      className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-300`}
      onError={handleImageError}
      title={`${player.fn} ${player.ln}`}
    />
  );
};