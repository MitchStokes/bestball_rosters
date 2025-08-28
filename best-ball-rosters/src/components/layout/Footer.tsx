import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span>Best Ball Rosters</span>
            <span className="mx-2">•</span>
            <span>Fantasy Football Analysis Tool</span>
          </div>
          <div className="text-sm text-gray-400">
            Built with React + TypeScript
          </div>
        </div>
      </div>
    </footer>
  );
};