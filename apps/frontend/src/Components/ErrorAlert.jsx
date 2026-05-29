import { AlertCircle, X } from 'lucide-react';

/**
 * Reusable error alert component
 * @param {string} message - The error message to display
 * @param {string} type - Type of alert: 'error', 'warning', 'success' (default: 'error')
 * @param {function} onDismiss - Optional callback function when alert is dismissed
 * @param {array} actions - Optional array of action buttons: [{label: 'Retry', onClick: fn}]
 */
const ErrorAlert = ({ message, type = 'error', onDismiss, actions = [] }) => {
  const typeStyles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      text: 'text-red-600',
      button: 'hover:bg-red-100',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      text: 'text-yellow-600',
      button: 'hover:bg-yellow-100',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      text: 'text-green-600',
      button: 'hover:bg-green-100',
    },
  };

  const style = typeStyles[type];

  return (
    <div
      className={`${style.bg} border ${style.border} rounded-lg p-4 flex items-start gap-3`}
      role="alert"
    >
      {/* Icon */}
      <AlertCircle className={`${style.icon} flex-shrink-0 mt-0.5 w-5 h-5`} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`${style.text} text-sm font-medium`}>{message}</p>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className={`text-xs font-semibold px-3 py-1 rounded ${style.text} ${style.button} transition-colors`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dismiss Button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`flex-shrink-0 ${style.button} rounded p-1 transition-colors`}
          aria-label="Dismiss alert"
        >
          <X className={`${style.icon} w-4 h-4`} />
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
