import React from 'react';

interface LiveFeedbackProps {
  status?: 'idle' | 'pending' | 'success' | 'failed';
  children: React.ReactNode;
  pendingLabel?: string;
  successLabel?: string;
  failedLabel?: string;
  className?: string;
}

export const LiveFeedback: React.FC<LiveFeedbackProps> = ({
  status = 'idle',
  children,
  pendingLabel = 'Loading...',
  successLabel = 'Success!',
  failedLabel = 'Failed',
  className = ''
}) => {
  const getStatusContent = () => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <span>{pendingLabel}</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{successLabel}</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>{failedLabel}</span>
          </div>
        );
      default:
        return children;
    }
  };

  return (
    <div className={`transition-all duration-200 ${className}`}>
      {getStatusContent()}
    </div>
  );
}; 