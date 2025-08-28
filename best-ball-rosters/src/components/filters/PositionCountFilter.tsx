import React from 'react';
import type { PositionCounts } from '../../types';

interface PositionCountFilterProps {
  positionCounts: PositionCounts;
  onPositionCountChange: (position: string, type: 'min' | 'max', value: number | undefined) => void;
  onClear: () => void;
}

const positions = ['QB', 'RB', 'WR', 'TE'];

export const PositionCountFilter: React.FC<PositionCountFilterProps> = ({
  positionCounts,
  onPositionCountChange,
  onClear
}) => {
  const hasActiveFilters = Object.keys(positionCounts).length > 0;

  const handleInputChange = (position: string, type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : parseInt(value, 10);
    if (numValue !== undefined && (numValue < 0 || numValue > 20)) return;
    onPositionCountChange(position, type, numValue);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Position Counts</h3>
          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Clear
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Filter by number of players at each position
        </p>
      </div>

      <div className="p-3 space-y-4">
        {positions.map(position => {
          const counts = positionCounts[position as keyof PositionCounts];
          return (
            <div key={position} className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {position}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Min</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={counts?.min ?? ''}
                    onChange={(e) => handleInputChange(position, 'min', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Min"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Max</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={counts?.max ?? ''}
                    onChange={(e) => handleInputChange(position, 'max', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};