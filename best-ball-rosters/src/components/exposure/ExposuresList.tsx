import React from 'react';
import type { PlayerExposure, PlayerExposureAnalysis } from '../../types';
import { ExposureCard } from './ExposureCard';

interface ExposuresListProps {
  analysis: PlayerExposureAnalysis | null;
  exposures: PlayerExposure[];
  loading?: boolean;
  error?: string | null;
}

export const ExposuresList: React.FC<ExposuresListProps> = ({ 
  analysis,
  exposures,
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
        <div className="text-red-600 mb-2">⚠️ Error loading player exposures</div>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">👥</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Unable to load player exposure data. Please check if roster data is available.
        </p>
      </div>
    );
  }

  if (exposures.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No players found</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          No players match your current filters. Try adjusting your search criteria or clearing filters.
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
              Player Exposure Analysis
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing exposure rates across {analysis.totalRosters.toLocaleString()} total roster{analysis.totalRosters !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-sm text-gray-600">
            {exposures.length.toLocaleString()} player{exposures.length !== 1 ? 's' : ''} displayed
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {exposures.map((exposure, index) => (
          <ExposureCard
            key={`${exposure.player.pid}-${index}`}
            exposure={exposure}
            totalRosters={analysis.totalRosters}
          />
        ))}
      </div>
    </div>
  );
};