import React from 'react';

const ProgressBar = ({ progress = 0, size = "medium", showLabel = true }) => {
  const sizeClasses = {
    small: "h-2",
    medium: "h-3",
    large: "h-4"
  };

  return (
    <div className={`w-full ${sizeClasses[size]} bg-gray-200 rounded-full overflow-hidden`}>
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
      {showLabel && (
        <p className="text-sm text-gray-600 mt-1 font-semibold">{Math.round(progress)}% Complete</p>
      )}
    </div>
  );
};

export default ProgressBar;
