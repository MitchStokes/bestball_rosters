import React from 'react';
import type { Stack } from '../../types';
import { StackCard } from './StackCard';

interface StacksListProps {
  stacks: Stack[];
  totalRosters: number;
  loading?: boolean;
  error?: string | null;
}

export const StacksList: React.FC<StacksListProps> = ({ 
  stacks, 
  totalRosters,
  loading = false, 
  error = null 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-2">⚠️ Error loading stacks</div>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (stacks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No stacks found</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          No player stacks match your current filters. Try adjusting the stack size range or check if data is available.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Stack Analysis
        </h2>
        <div className="text-sm text-gray-600">
          Showing {stacks.length.toLocaleString()} stack{stacks.length !== 1 ? 's' : ''} across {totalRosters.toLocaleString()} roster{totalRosters !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {stacks.map((stack, index) => (
          <StackCard
            key={`${stack.team}-${stack.playerNames.join(',')}-${index}`}
            stack={stack}
            totalRosters={totalRosters}
          />
        ))}
      </div>
    </div>
  );
};