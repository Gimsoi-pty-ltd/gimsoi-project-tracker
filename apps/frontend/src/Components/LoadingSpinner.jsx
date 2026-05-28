
/**
 * Reusable loading spinner component
 * @param {string} size - Size of the spinner: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} color - Color of the spinner: 'blue', 'white' (default: 'blue')
 * @param {string} message - Optional loading message to display
 */
const LoadingSpinner = ({ size = 'md', color = 'blue', message = null }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  };

  const colorClasses = {
    blue: 'border-blue-200 border-t-blue-600',
    white: 'border-gray-200 border-t-white',
  };

  const containerSize = {
    sm: 'min-h-0',
    md: 'min-h-screen',
    lg: 'min-h-screen',
  };

  return (
    <div className={`${containerSize[size]} flex flex-col items-center justify-center gap-4`}>
      <div
        className={`${sizeClasses[size]} rounded-full animate-spin ${colorClasses[color]}`}
      />
      {message && <p className="text-gray-500 text-sm font-medium">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
