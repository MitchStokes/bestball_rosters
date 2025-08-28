import React from 'react';
import type { RosterWithStats } from '../../types';
import { RosterCard } from './RosterCard';

interface RosterListProps {
  rosters: RosterWithStats[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}

export const RosterList: React.FC<RosterListProps> = ({ 
  rosters, 
  loading = false,
  error = null,
  emptyMessage = "No rosters found matching your criteria."
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading rosters...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-2">⚠️ Error</div>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (rosters.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <div className="text-gray-400 text-4xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Rosters Found</h3>
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {rosters.length} roster{rosters.length !== 1 ? 's' : ''}
        </div>
        <div className="text-sm text-gray-500">
          {rosters.length > 1 && 'Click to expand individual rosters'}
        </div>
      </div>

      {/* Roster Cards */}
      <div className="grid gap-6">
        {rosters.map(roster => (
          <RosterCard 
            key={roster.LineupId} 
            roster={roster}
          />
        ))}
      </div>

      {/* Load More / Pagination could go here */}
      {rosters.length > 20 && (
        <div className="text-center pt-6">
          <p className="text-sm text-gray-500">
            Showing first {Math.min(20, rosters.length)} results
          </p>
        </div>
      )}
    </div>
  );
};