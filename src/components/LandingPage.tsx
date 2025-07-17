import React, { useState } from 'react';
import { PawPrint, Monitor, Map, Users, Package, Check, Star, ArrowRight, Shield, Clock, Zap, TrendingUp, Globe, Smartphone } from 'lucide-react';
import { AuthForm } from './Auth/AuthForm';

const features = [
  {
    icon: '🐄',
    title: 'Animal Tracking',
    desc: 'Track every animal with detailed health records, breeding history, and performance metrics.'
  },
  {
    icon: '🏕️',
    title: 'Camp Management',
    desc: 'Optimize grazing with smart camp assignments and rotation planning.'
  },
  {
    icon: '📊',
    title: 'Analytics & Reports',
    desc: 'Get insights into your farm performance with beautiful charts and reports.'
  },
  {
    icon: '📱',
    title: 'Mobile First',
    desc: 'Manage your farm from anywhere with our responsive mobile app.'
  },
];

// Pricing removed for now - will add paywall later

// Testimonials removed - will add real ones when we have actual users

// Screenshot data with fallback icons
const screenshots = [
  {
    src: '/screenshots/dashboard.jpg',
    alt: 'HerdWise Dashboard - Overview of farm operations with key metrics and quick actions',
    title: 'Dashboard Overview',
    icon: Monitor,
    desc: 'Get a bird\'s eye view of your farm operations'
  },
  {
    src: '/screenshots/camp-management.jpg',
    alt: 'Camp Management - Interactive map showing grazing areas and animal assignments',
    title: 'Camp Management',
    icon: Map,
    desc: 'Manage grazing areas and animal assignments'
  },
  {
    src: '/screenshots/animals.jpg',
    alt: 'Animal Tracking - Detailed animal records with health history and management tools',
    title: 'Animal Tracking',
    icon: Users,
    desc: 'Track individual animals and their health records'
  },
  {
    src: '/screenshots/inventory.jpg',
    alt: 'Inventory Management - Stock tracking and financial overview for farm supplies',
    title: 'Inventory & Finances',
    icon: Package,
    desc: 'Manage supplies and track farm finances'
  },
];

export const LandingPage: React.FC = () => {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthForm(true);
  };

  if (showAuthForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="w-full max-w-md">
          <button 
            onClick={() => setShowAuthForm(false)}
            className="mb-4 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center"
          >
            ← Back to landing page
          </button>
          <AuthForm initialMode={authMode} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 scroll-smooth">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <PawPrint className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-900 dark:text-white">HerdWise</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleAuthClick('signin')}
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </button>
              <button 
                onClick={() => handleAuthClick('signup')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">


            <h1 className="text-4xl sm:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Farm management
              <span className="block text-blue-600 dark:text-blue-400">made simple</span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              All-in-one platform to track animals, manage camps, handle inventory, and keep your farm running smoothly—anywhere, anytime.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button 
                onClick={() => handleAuthClick('signup')}
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button 
                onClick={() => handleAuthClick('signin')}
                className="inline-flex items-center justify-center border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold px-8 py-4 rounded-xl text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Sign In
              </button>
            </div>


          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-emerald-50/50 dark:from-blue-900/10 dark:to-emerald-900/10"></div>
        <div className="relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything you need to run your farm efficiently
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              From animal tracking to financial management, we've got you covered
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <span className="text-4xl">{feature.icon}</span>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              See HerdWise in action
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Get a glimpse of how HerdWise simplifies your daily farm management tasks
            </p>
          </div>
          
          <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
            {screenshots.map((screenshot, index) => {
              const IconComponent = screenshot.icon;
              return (
                <div key={index} className="flex-shrink-0">
                  <div className="relative group">
                    <img 
                      src={screenshot.src} 
                      alt={screenshot.alt}
                      className="h-80 w-auto rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 object-cover hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="hidden h-80 w-80 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 flex flex-col items-center justify-center p-6 text-center"
                      style={{ display: 'none' }}
                    >
                      <IconComponent className="h-16 w-16 text-blue-600 dark:text-blue-400 mb-4" />
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{screenshot.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{screenshot.desc}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 text-center font-medium">{screenshot.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>





      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to transform your farm management?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Start managing your farm more efficiently today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => handleAuthClick('signup')}
              className="inline-flex items-center justify-center bg-white text-blue-600 font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={() => handleAuthClick('signin')}
              className="inline-flex items-center justify-center border-2 border-white text-white font-semibold px-8 py-4 rounded-xl text-lg hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <PawPrint className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">HerdWise</span>
            </div>
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-8 text-sm">
              <a href="/privacy-policy.html" target="_blank" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
              <a href="/terms-of-service.html" target="_blank" className="hover:text-blue-400 transition-colors">Terms of Service</a>
              <a href="mailto:stihancoetzee0@gmail.com" className="hover:text-blue-400 transition-colors">Contact</a>
              <span className="text-slate-400">&copy; {new Date().getFullYear()} HerdWise. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}; 