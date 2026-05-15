import React from 'react';
import { Inbox } from 'lucide-react';
import NavyButton from "./Buttons";

/**
 * Reusable empty state component
 * @param {string} title - Title of the empty state
 * @param {string} message - Message describing the empty state
 * @param {function} onAction - Optional callback function for action button
 * @param {string} actionLabel - Label for the action button
 */
const EmptyState = ({ title = 'No Data', message, onAction, actionLabel = 'Create' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Inbox className="w-12 h-12 text-gray-300 mb-4" />
      
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
      
      {message && (
        <p className="text-sm text-gray-500 text-center max-w-sm mb-4">
          {message}
        </p>
      )}

      {onAction && actionLabel && (
        <NavyButton
          onClick={onAction}
          className="mt-2 px-4 py-2 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {actionLabel}
        </NavyButton>
      )}
    </div>  
  );
};

export default EmptyState;  
