import React, { useEffect } from 'react';
import { useAnalytics } from '../../utils/analytics';
import { useAuth } from '../../context/AuthContext';

interface AnalyticsTrackerProps {
  pageName: string;
  children: React.ReactNode;
}

export const AnalyticsTracker: React.FC<AnalyticsTrackerProps> = ({ pageName, children }) => {
  const { trackUserAction } = useAnalytics();
  const { user } = useAuth();

  useEffect(() => {
    // Track page view
    trackUserAction(`view_${pageName.toLowerCase().replace(/\s+/g, '_')}` as any, {
      pageName,
      timestamp: new Date().toISOString(),
    });
  }, [pageName, trackUserAction]);

  return <>{children}</>;
};

// Hook for tracking specific user actions
export const useTrackAction = () => {
  const { trackUserAction } = useAnalytics();

  const trackAction = (action: string, metadata?: { [key: string]: any }) => {
    trackUserAction(action as any, {
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  };

  return { trackAction };
};

// Component for tracking button clicks
interface TrackedButtonProps {
  action: string;
  metadata?: { [key: string]: any };
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const TrackedButton: React.FC<TrackedButtonProps> = ({
  action,
  metadata,
  onClick,
  children,
  className = '',
  disabled = false,
  type = 'button',
}) => {
  const { trackAction } = useTrackAction();

  const handleClick = () => {
    trackAction(action, metadata);
    if (onClick) onClick();
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      className={className}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Component for tracking form submissions
interface TrackedFormProps {
  action: string;
  metadata?: { [key: string]: any };
  onSubmit?: (e: React.FormEvent) => void;
  children: React.ReactNode;
  className?: string;
}

export const TrackedForm: React.FC<TrackedFormProps> = ({
  action,
  metadata,
  onSubmit,
  children,
  className = '',
}) => {
  const { trackAction } = useTrackAction();

  const handleSubmit = (e: React.FormEvent) => {
    trackAction(action, metadata);
    if (onSubmit) onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
}; 