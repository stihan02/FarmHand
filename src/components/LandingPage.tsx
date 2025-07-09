import React, { useState } from 'react';
import { PawPrint, Monitor, Map, Users, Package } from 'lucide-react';
import { AuthForm } from './Auth/AuthForm';

const features = [
  {
    icon: '🐄',
    title: 'Animal Tracking',
    desc: 'Easily manage and monitor your livestock with detailed records and health tracking.'
  },
  {
    icon: '🏕️',
    title: 'Camp & Grazing Management',
    desc: 'Assign animals to camps, track grazing, and optimize your land use.'
  },
  {
    icon: '📦',
    title: 'Inventory & Finances',
    desc: 'Keep tabs on feed, medicine, and farm expenses with simple inventory and finance tools.'
  },
  {
    icon: '📱',
    title: 'Mobile-first',
    desc: 'Manage your farm from anywhere, on any device.'
  },
];

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 p-4">
        <div className="w-full max-w-md">
          <button 
            onClick={() => setShowAuthForm(false)}
            className="mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center"
          >
            ← Back to landing page
          </button>
          <AuthForm initialMode={authMode} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-gray-100">
      {/* Hero Section */}
      <header className="w-full py-8 px-4 flex flex-col items-center bg-white dark:bg-zinc-800 shadow-md">
        <div className="flex items-center space-x-3 mb-2">
          <PawPrint className="h-10 w-10 text-emerald-500" />
          <span className="text-3xl font-bold">HerdWise</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2 text-center">Modern farm management, made simple.</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center max-w-xl">All-in-one platform to track animals, manage camps, handle inventory, and keep your farm running smoothly—anywhere, anytime.</p>
        <div className="flex gap-4">
          <button 
            onClick={() => handleAuthClick('signup')}
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg text-lg transition-all duration-200"
          >
            Sign Up Free
          </button>
          <button 
            onClick={() => handleAuthClick('signin')}
            className="inline-block bg-white border border-emerald-600 text-emerald-600 font-semibold px-8 py-3 rounded-full shadow text-lg hover:bg-emerald-50 transition-all duration-200"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Features Section */}
      <section className="max-w-4xl mx-auto py-12 px-4 grid grid-cols-1 sm:grid-cols-2 gap-8">
        {features.map((f, i) => (
          <div key={i} className="flex items-start space-x-4 bg-white dark:bg-zinc-800 rounded-xl shadow p-6">
            <span className="text-3xl">{f.icon}</span>
            <div>
              <h3 className="text-lg font-bold mb-1">{f.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Screenshots Section (horizontal scroll) */}
      <section className="w-full py-12">
        <div className="max-w-6xl mx-auto px-4 mb-8">
          <h2 className="text-2xl font-bold mb-2 text-center">See HerdWise in Action</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-2xl mx-auto">
            Get a glimpse of how HerdWise simplifies your daily farm management tasks
          </p>
        </div>
        <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide px-4 max-w-full">
          {screenshots.map((screenshot, index) => {
            const IconComponent = screenshot.icon;
            return (
              <div key={index} className="flex-shrink-0">
                <div className="relative group">
                  <img 
                    src={screenshot.src} 
                    alt={screenshot.alt}
                    className="h-80 w-auto rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 object-cover hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                    onError={(e) => {
                      // Hide the image and show fallback
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  {/* Fallback when image fails to load */}
                  <div 
                    className="hidden h-80 w-80 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 flex flex-col items-center justify-center p-6 text-center"
                    style={{ display: 'none' }}
                  >
                    <IconComponent className="h-16 w-16 text-emerald-600 dark:text-emerald-400 mb-4" />
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{screenshot.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{screenshot.desc}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">{screenshot.title}</p>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            💡 <strong>Tip:</strong> Swipe or scroll to see more screenshots
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-8 px-4 flex flex-col items-center">
        <h2 className="text-xl font-bold mb-2">Ready to simplify your farm?</h2>
        <div className="flex gap-4">
          <button 
            onClick={() => handleAuthClick('signup')}
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg text-lg transition-all duration-200"
          >
            Sign Up Free
          </button>
          <button 
            onClick={() => handleAuthClick('signin')}
            className="inline-block bg-white border border-emerald-600 text-emerald-600 font-semibold px-8 py-3 rounded-full shadow text-lg hover:bg-emerald-50 transition-all duration-200"
          >
            Sign In
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto w-full py-6 px-4 bg-white dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-700 flex flex-col sm:flex-row items-center justify-between text-sm">
        <div className="mb-2 sm:mb-0">&copy; {new Date().getFullYear()} HerdWise. All rights reserved.</div>
        <div className="flex space-x-4">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Contact</a>
        </div>
      </footer>
    </div>
  );
}; 