import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

// Analytics event types
export type AnalyticsEvent = 
  | 'app_launch'
  | 'user_signup'
  | 'user_login'
  | 'animal_added'
  | 'animal_edited'
  | 'transaction_added'
  | 'task_created'
  | 'camp_created'
  | 'inventory_added'
  | 'report_generated'
  | 'feature_used'
  | 'error_occurred'
  | 'feedback_submitted'
  | 'app_installed'
  | 'premium_upgrade'
  | 'export_data'
  | 'offline_usage'
  | 'sync_completed';

// User behavior tracking
export type UserAction = 
  | 'view_dashboard'
  | 'view_animals'
  | 'view_finances'
  | 'view_tasks'
  | 'view_camps'
  | 'view_inventory'
  | 'view_reports'
  | 'add_animal'
  | 'edit_animal'
  | 'add_transaction'
  | 'add_task'
  | 'add_camp'
  | 'add_inventory'
  | 'export_report'
  | 'use_offline'
  | 'sync_data';

// Analytics data structure
export interface AnalyticsData {
  userId?: string;
  userEmail?: string;
  event: AnalyticsEvent;
  action?: UserAction;
  timestamp: any;
  metadata?: {
    [key: string]: any;
  };
  userAgent?: string;
  url?: string;
  deviceInfo?: {
    platform: string;
    screenSize: string;
    language: string;
  };
  sessionId?: string;
  version?: string;
}

// Business metrics
export interface BusinessMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  retentionRate: number;
  featureUsage: { [feature: string]: number };
  userEngagement: number;
  conversionRate: number;
  revenue: number;
  churnRate: number;
}

class AnalyticsManager {
  private sessionId: string;
  private version: string = '1.0.0';

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Track any analytics event
  async trackEvent(
    event: AnalyticsEvent,
    action?: UserAction,
    metadata?: { [key: string]: any }
  ) {
    try {
      const analyticsData: AnalyticsData = {
        event,
        action,
        timestamp: serverTimestamp(),
        metadata,
        userAgent: navigator.userAgent,
        url: window.location.href,
        deviceInfo: {
          platform: navigator.platform,
          screenSize: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language,
        },
        sessionId: this.sessionId,
        version: this.version,
      };

      // Add to Firestore
      await addDoc(collection(db, 'analytics'), analyticsData);

      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Analytics Event:', { event, action, metadata });
      }
    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  }

  // Track user actions with context
  async trackUserAction(action: UserAction, metadata?: { [key: string]: any }) {
    await this.trackEvent('feature_used', action, metadata);
  }

  // Track app launch
  async trackAppLaunch() {
    await this.trackEvent('app_launch', undefined, {
      referrer: document.referrer,
      loadTime: performance.now(),
    });
  }

  // Track user registration
  async trackUserSignup(userId: string, userEmail: string) {
    await this.trackEvent('user_signup', undefined, {
      userId,
      userEmail,
      signupMethod: 'email', // or 'google', 'facebook', etc.
    });
  }

  // Track premium upgrade
  async trackPremiumUpgrade(userId: string, plan: string, amount: number) {
    await this.trackEvent('premium_upgrade', undefined, {
      userId,
      plan,
      amount,
      currency: 'ZAR',
    });
  }

  // Track offline usage
  async trackOfflineUsage(duration: number, actions: string[]) {
    await this.trackEvent('offline_usage', undefined, {
      duration,
      actions,
      dataSynced: true,
    });
  }

  // Track errors
  async trackError(error: Error, context?: string) {
    await this.trackEvent('error_occurred', undefined, {
      errorMessage: error.message,
      errorStack: error.stack,
      context,
    });
  }

  // Get business metrics
  async getBusinessMetrics(days: number = 30): Promise<BusinessMetrics> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get total users
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const totalUsers = usersSnapshot.size;

      // Get active users (users with activity in last 7 days)
      const activeStartDate = new Date();
      activeStartDate.setDate(activeStartDate.getDate() - 7);
      const activeQuery = query(
        collection(db, 'analytics'),
        where('timestamp', '>=', activeStartDate)
      );
      const activeSnapshot = await getDocs(activeQuery);
      const activeUsers = new Set(activeSnapshot.docs.map(doc => doc.data().userId)).size;

      // Get new users
      const newUsersQuery = query(
        collection(db, 'analytics'),
        where('event', '==', 'user_signup'),
        where('timestamp', '>=', startDate)
      );
      const newUsersSnapshot = await getDocs(newUsersQuery);
      const newUsers = newUsersSnapshot.size;

      // Get feature usage
      const featureQuery = query(
        collection(db, 'analytics'),
        where('event', '==', 'feature_used'),
        where('timestamp', '>=', startDate)
      );
      const featureSnapshot = await getDocs(featureQuery);
      const featureUsage: { [feature: string]: number } = {};
      featureSnapshot.docs.forEach(doc => {
        const action = doc.data().action;
        if (action) {
          featureUsage[action] = (featureUsage[action] || 0) + 1;
        }
      });

      // Calculate retention rate (simplified)
      const retentionRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

      // Calculate user engagement (average actions per user)
      const totalActions = featureSnapshot.size;
      const userEngagement = totalUsers > 0 ? totalActions / totalUsers : 0;

      // Get revenue data
      const revenueQuery = query(
        collection(db, 'analytics'),
        where('event', '==', 'premium_upgrade'),
        where('timestamp', '>=', startDate)
      );
      const revenueSnapshot = await getDocs(revenueQuery);
      const revenue = revenueSnapshot.docs.reduce((sum, doc) => {
        return sum + (doc.data().metadata?.amount || 0);
      }, 0);

      // Calculate conversion rate (users who upgraded to premium)
      const premiumUsers = revenueSnapshot.size;
      const conversionRate = totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0;

      // Calculate churn rate (simplified - users who haven't been active in 30 days)
      const churnQuery = query(
        collection(db, 'analytics'),
        where('timestamp', '<', startDate)
      );
      const churnSnapshot = await getDocs(churnQuery);
      const churnedUsers = new Set(churnSnapshot.docs.map(doc => doc.data().userId)).size;
      const churnRate = totalUsers > 0 ? (churnedUsers / totalUsers) * 100 : 0;

      return {
        totalUsers,
        activeUsers,
        newUsers,
        retentionRate,
        featureUsage,
        userEngagement,
        conversionRate,
        revenue,
        churnRate,
      };
    } catch (error) {
      console.error('Error getting business metrics:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        retentionRate: 0,
        featureUsage: {},
        userEngagement: 0,
        conversionRate: 0,
        revenue: 0,
        churnRate: 0,
      };
    }
  }

  // Get user journey data
  async getUserJourney(userId: string) {
    try {
      const userQuery = query(
        collection(db, 'analytics'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      const snapshot = await getDocs(userQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting user journey:', error);
      return [];
    }
  }

  // Get popular features
  async getPopularFeatures(days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const featureQuery = query(
        collection(db, 'analytics'),
        where('event', '==', 'feature_used'),
        where('timestamp', '>=', startDate)
      );
      const snapshot = await getDocs(featureQuery);
      
      const featureCounts: { [feature: string]: number } = {};
      snapshot.docs.forEach(doc => {
        const action = doc.data().action;
        if (action) {
          featureCounts[action] = (featureCounts[action] || 0) + 1;
        }
      });

      // Sort by usage count
      return Object.entries(featureCounts)
        .sort(([,a], [,b]) => b - a)
        .map(([feature, count]) => ({ feature, count }));
    } catch (error) {
      console.error('Error getting popular features:', error);
      return [];
    }
  }

  // Track user session
  startSession() {
    this.trackAppLaunch();
    
    // Track session end when user leaves
    window.addEventListener('beforeunload', () => {
      this.trackEvent('session_end', undefined, {
        sessionDuration: Date.now() - parseInt(this.sessionId.split('_')[1]),
      });
    });
  }
}

// Create singleton instance
export const analytics = new AnalyticsManager();

// React hook for easy analytics usage
export const useAnalytics = () => {
  const { user } = useAuth();

  const trackEvent = async (
    event: AnalyticsEvent,
    action?: UserAction,
    metadata?: { [key: string]: any }
  ) => {
    const enhancedMetadata = {
      ...metadata,
      userId: user?.uid,
      userEmail: user?.email,
    };
    
    await analytics.trackEvent(event, action, enhancedMetadata);
  };

  const trackUserAction = async (action: UserAction, metadata?: { [key: string]: any }) => {
    await trackEvent('feature_used', action, metadata);
  };

  return {
    trackEvent,
    trackUserAction,
    analytics,
  };
};

export default analytics; 