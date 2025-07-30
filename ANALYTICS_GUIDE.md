# HerdWise Analytics System Guide

## 📊 Overview

HerdWise includes a comprehensive analytics system that tracks user behavior, business metrics, and app performance. This system helps you understand how users interact with your app and make data-driven decisions.

## 🎯 What We Track

### User Behavior
- **Page Views**: Which pages users visit most
- **Feature Usage**: Which features are most/least popular
- **User Actions**: Add animals, transactions, tasks, etc.
- **Session Data**: How long users stay, when they're most active
- **Device Information**: Mobile vs desktop usage
- **Geographic Data**: Where your users are located

### Business Metrics
- **User Growth**: New users, active users, retention rate
- **Revenue**: Premium upgrades, conversion rates
- **Engagement**: Actions per user, session duration
- **Churn**: Users who stop using the app

### Technical Metrics
- **Performance**: Load times, errors, uptime
- **Offline Usage**: How often users work offline
- **Data Sync**: Success rates, sync frequency

## 🚀 Quick Start

### 1. Initialize Analytics

The analytics system is already initialized in your app. It starts tracking automatically when users visit your app.

### 2. Track Page Views

Wrap your pages with the `AnalyticsTracker` component:

```tsx
import { AnalyticsTracker } from './components/analytics/AnalyticsTracker';

function Dashboard() {
  return (
    <AnalyticsTracker pageName="Dashboard">
      {/* Your dashboard content */}
    </AnalyticsTracker>
  );
}
```

### 3. Track User Actions

Use the `TrackedButton` component for important actions:

```tsx
import { TrackedButton } from './components/analytics/AnalyticsTracker';

<TrackedButton 
  action="add_animal"
  metadata={{ animalType: 'cattle', source: 'manual_entry' }}
  onClick={handleAddAnimal}
  className="btn btn-primary"
>
  Add Animal
</TrackedButton>
```

### 4. Track Form Submissions

Use the `TrackedForm` component:

```tsx
import { TrackedForm } from './components/analytics/AnalyticsTracker';

<TrackedForm 
  action="user_signup"
  metadata={{ signupMethod: 'email' }}
  onSubmit={handleSignup}
>
  {/* Your form fields */}
</TrackedForm>
```

## 📈 Viewing Analytics

### Business Analytics Dashboard

Access the comprehensive analytics dashboard:

```tsx
import { BusinessAnalytics } from './components/analytics/BusinessAnalytics';

// Add this to your admin panel or analytics page
<BusinessAnalytics />
```

### Key Metrics Available

1. **Overview Tab**
   - Total users, active users, retention rate, revenue
   - Device usage distribution
   - Geographic distribution

2. **Users Tab**
   - User growth trends
   - User engagement metrics
   - Churn analysis

3. **Features Tab**
   - Most used features
   - Feature usage breakdown
   - User journey insights

4. **Revenue Tab**
   - Revenue trends
   - Conversion rates
   - Premium user metrics

5. **Technical Tab**
   - Error tracking
   - Performance metrics
   - Offline usage stats

## 🔧 Advanced Usage

### Custom Event Tracking

Track custom events using the analytics hook:

```tsx
import { useAnalytics } from '../utils/analytics';

function MyComponent() {
  const { trackEvent } = useAnalytics();

  const handleCustomAction = () => {
    trackEvent('custom_action', 'specific_action', {
      customData: 'value',
      timestamp: new Date().toISOString(),
    });
  };

  return <button onClick={handleCustomAction}>Custom Action</button>;
}
```

### Track User Journey

Track a user's complete journey through your app:

```tsx
const { trackUserAction } = useAnalytics();

// Track each step of the user journey
trackUserAction('view_dashboard');
trackUserAction('click_add_animal');
trackUserAction('fill_animal_form');
trackUserAction('submit_animal_form');
```

### Error Tracking

Automatically track errors:

```tsx
import { analytics } from '../utils/analytics';

try {
  // Your code that might fail
} catch (error) {
  analytics.trackError(error, 'component_name');
}
```

## 📊 Data Structure

### Analytics Events

```typescript
type AnalyticsEvent = 
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
```

### User Actions

```typescript
type UserAction = 
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
```

## 🎯 Key Metrics for South African Market

### User Acquisition
- **Facebook Groups**: Track referrals from farming Facebook groups
- **WhatsApp**: Monitor sharing through WhatsApp
- **Local Partnerships**: Track users from agricultural partnerships
- **Word of Mouth**: Monitor organic growth

### User Engagement
- **Offline Usage**: Critical for SA farmers with poor connectivity
- **Mobile Usage**: Most farmers use mobile devices
- **Early Morning Activity**: Farmers are most active 6-8 AM
- **Seasonal Patterns**: Track usage during planting/harvesting seasons

### Revenue Tracking
- **R50/month Subscriptions**: Track premium conversions
- **Payment Methods**: Monitor preferred payment methods (EFT, mobile money)
- **Churn Patterns**: Identify why users cancel subscriptions

## 🔒 Privacy & Compliance

### Data Collection
- All analytics data is stored in Firebase Firestore
- User data is anonymized where possible
- No personally identifiable information is shared
- Users can request data deletion

### GDPR Compliance
- Analytics respects user privacy settings
- Data retention policies are implemented
- Users can opt out of analytics tracking

## 📱 Mobile Analytics

### PWA Tracking
- Track app installations
- Monitor offline usage patterns
- Track sync success rates
- Monitor performance on different devices

### Android App Tracking
- Track Play Store downloads
- Monitor app crashes and errors
- Track in-app purchases
- Monitor user retention

## 🚀 Marketing Insights

### User Acquisition Channels
- **Facebook**: Track referrals from farming groups
- **WhatsApp**: Monitor viral sharing
- **Google Play Store**: Track organic vs paid installs
- **Local Partnerships**: Monitor referrals from agricultural organizations

### Conversion Funnel
1. **Landing Page Visit** → Track website visitors
2. **App Installation** → Monitor PWA/Android installs
3. **User Registration** → Track signup completion
4. **First Animal Added** → Track initial engagement
5. **Premium Upgrade** → Monitor conversion to paid

### Retention Strategies
- **Onboarding**: Track completion rates
- **Feature Adoption**: Monitor which features drive retention
- **Offline Usage**: Track users who value offline functionality
- **Community Features**: Monitor engagement with social features

## 📈 Reporting Schedule

### Daily Metrics
- New user registrations
- Active users
- Revenue generated
- Critical errors

### Weekly Reports
- User engagement trends
- Feature usage analysis
- Geographic distribution
- Performance metrics

### Monthly Analysis
- Retention rate analysis
- Churn analysis
- Revenue trends
- Marketing channel effectiveness

## 🛠️ Technical Implementation

### Firebase Integration
- Analytics data stored in `analytics` collection
- Real-time updates for live dashboards
- Automatic backup and recovery
- Scalable for growing user base

### Performance Optimization
- Analytics tracking doesn't impact app performance
- Data is batched and sent efficiently
- Offline analytics tracking supported
- Minimal impact on user experience

### Data Export
- Export analytics data for external analysis
- Integration with Google Sheets/Excel
- Custom reporting capabilities
- Data backup and recovery

## 🎯 Action Items

### Immediate (Week 1)
1. ✅ Analytics system is implemented
2. ✅ Business dashboard is created
3. ✅ Basic tracking is active

### Short Term (Month 1)
1. [ ] Add analytics tracking to all major user actions
2. [ ] Set up daily/weekly reporting
3. [ ] Monitor key metrics for South African market
4. [ ] Track user acquisition channels

### Medium Term (Month 3)
1. [ ] Implement advanced user journey tracking
2. [ ] Set up A/B testing for features
3. [ ] Create automated marketing reports
4. [ ] Optimize based on analytics insights

### Long Term (Month 6)
1. [ ] Predictive analytics for user behavior
2. [ ] Advanced segmentation and targeting
3. [ ] Integration with marketing automation
4. [ ] Machine learning insights

## 📞 Support

For questions about the analytics system:
- Check the Firebase console for raw data
- Review the analytics dashboard for insights
- Contact the development team for technical issues

---

**Remember**: Analytics is only valuable if you act on the insights. Use this data to make informed decisions about product development, marketing strategies, and user experience improvements. 