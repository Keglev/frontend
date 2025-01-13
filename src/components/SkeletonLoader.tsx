import React from 'react';

const SkeletonLoader: React.FC = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="w-full h-6 bg-gray-300 rounded"></div>
      <div className="w-3/4 h-6 bg-gray-300 rounded"></div>
      <div className="w-1/2 h-6 bg-gray-300 rounded"></div>
    </div>
  );
};

export default SkeletonLoader;
