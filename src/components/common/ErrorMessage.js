import React from 'react';
import { XCircleIcon } from '@heroicons/react/24/solid';
import { formatErrorMessage } from '../../utils/errorHandler';

/**
 * Error message component for displaying errors
 * @param {Object} props - Component props
 * @param {string|Error} props.error - Error message or Error object
 * @param {boolean} props.dismissible - Whether error can be dismissed
 * @param {Function} props.onDismiss - Function to call when error is dismissed
 * @returns {JSX.Element|null} Error message component or null if no error
 */
function ErrorMessage({ error, dismissible = false, onDismiss }) {
  // If no error, don't render anything
  if (!error) return null;
  
  // Format the error message
  const errorMessage = formatErrorMessage(error);
  
  return (
    <div className="rounded-md bg-red-50 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{errorMessage}</p>
          </div>
        </div>
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
              >
                <span className="sr-only">Dismiss</span>
                <XCircleIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage;