import React from 'react';
import type { PlayerAssociation, PlayerAssociationsAnalysis } from '../../types';
import { AssociationCard } from './AssociationCard';

interface AssociationsListProps {
  analysis: PlayerAssociationsAnalysis | null;
  associations: PlayerAssociation[];
  loading?: boolean;
  error?: string | null;
}

export const AssociationsList: React.FC<AssociationsListProps> = ({ 
  analysis,
  associations,
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
        <div className="text-red-600 mb-2">⚠️ Error loading associations</div>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🔗</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Player Selected</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Search for a player to see which other players are commonly drafted with them.
        </p>
      </div>
    );
  }

  if (associations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No associations found</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          No player associations match your current filters for <strong>{analysis.searchedPlayer.fn} {analysis.searchedPlayer.ln}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Players Associated with {analysis.searchedPlayer.fn} {analysis.searchedPlayer.ln}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Based on {analysis.searchedPlayerRosters.toLocaleString()} roster{analysis.searchedPlayerRosters !== 1 ? 's' : ''} containing this player
            </p>
          </div>
          <div className="text-sm text-gray-600">
            Showing {associations.length.toLocaleString()} association{associations.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {associations.map((association, index) => (
          <AssociationCard
            key={`${association.player.pid}-${index}`}
            association={association}
            searchedPlayerRosters={analysis.searchedPlayerRosters}
          />
        ))}
      </div>
    </div>
  );
};