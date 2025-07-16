import React from 'react';
import { StatsCard } from './StatsCard';
import { MobileDashboard } from './MobileDashboard';

interface ResponsiveDashboardProps {
  onNavigate: (tab: 'dashboard' | 'animals' | 'finances' | 'tasks' | 'camps' | 'inventory' | 'reports') => void;
  onAddAnimal: () => void;
  onAddTransaction: () => void;
  onAddTask: () => void;
  onShowOnboarding?: () => void;
}

export const ResponsiveDashboard: React.FC<ResponsiveDashboardProps> = ({
  onNavigate,
  onAddAnimal,
  onAddTransaction,
  onAddTask,
  onShowOnboarding,
}) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (isMobile) {
    return (
      <MobileDashboard
        onNavigate={onNavigate}
        onAddAnimal={onAddAnimal}
        onAddTransaction={onAddTransaction}
        onAddTask={onAddTask}
      />
    );
  }

  return (
    <div className="p-6">
      <StatsCard 
        onShowOnboarding={onShowOnboarding}
        onNavigate={onNavigate}
        onAddAnimal={onAddAnimal}
        onAddTransaction={onAddTransaction}
        onAddTask={onAddTask}
      />
    </div>
  );
}; 