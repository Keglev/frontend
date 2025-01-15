import React from 'react';

const SkeletonLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="animate-pulse text-gray-500">Loading...</div>
    </div>
  );
};

export default SkeletonLoader;
