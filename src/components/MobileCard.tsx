import React from 'react';

interface MobileCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  variant = 'default',
  padding = 'md',
}) => {
  const handleClick = () => {
    if (disabled || !onClick) return;
    
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
    
    onClick();
  };

  const baseClasses = 'rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2';
  
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const variantClasses = {
    default: 'bg-white dark:bg-zinc-800 shadow-sm border border-gray-200 dark:border-zinc-700',
    elevated: 'bg-white dark:bg-zinc-800 shadow-lg border border-gray-200 dark:border-zinc-700 hover:shadow-xl',
    outlined: 'bg-transparent border-2 border-gray-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-600',
  };

  const interactiveClasses = onClick && !disabled 
    ? 'cursor-pointer active:scale-[0.98] hover:shadow-md' 
    : '';

  return (
    <div
      onClick={handleClick}
      className={`${baseClasses} ${paddingClasses[padding]} ${variantClasses[variant]} ${interactiveClasses} ${className}`}
      style={{ touchAction: 'manipulation' }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}; 