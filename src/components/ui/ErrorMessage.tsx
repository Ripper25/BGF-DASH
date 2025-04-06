"use client";

import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Error message component for displaying API errors
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onDismiss,
  className = ''
}) => {
  return (
    <div className={`bg-terracotta/10 border border-terracotta rounded-md p-4 mb-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FiAlertTriangle className="h-5 w-5 text-terracotta" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-terracotta">{message}</p>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              className="inline-flex rounded-md bg-terracotta/10 text-terracotta hover:bg-terracotta/20 focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2"
              onClick={onDismiss}
            >
              <span className="sr-only">Dismiss</span>
              <FiX className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
