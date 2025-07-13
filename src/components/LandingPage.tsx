import React, { useState } from 'react';
import { PawPrint, Monitor, Map, Users, Package, Check, Star, ArrowRight, Zap, Shield, Clock } from 'lucide-react';
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

// Pricing plans for monetization
const pricingPlans = [
  {
    name: 'Starter',
    price: '$9',
    period: '/month',
    description: 'Perfect for small farms getting started',
    features: [
      'Up to 50 animals',
      'Basic camp management',
      'Inventory tracking',
      'Mobile app access',
      'Email support'
    ],
    popular: false,
    cta: 'Start Free Trial'
  },
  {
    name: 'Professional',
    price: '$29',
    period: '/month',
    description: 'Most popular for growing farms',
    features: [
      'Unlimited animals',
      'Advanced analytics',
      'Weight tracking',
      'Financial reports',
      'Priority support',
      'API access'
    ],
    popular: true,
    cta: 'Start Free Trial'
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'For large operations and cooperatives',
    features: [
      'Everything in Professional',
      'Multi-user access',
      'Custom integrations',
      'Dedicated support',
      'White-label options',
      'Advanced reporting'
    ],
    popular: false,
    cta: 'Contact Sales'
  }
];

// Testimonials for social proof
const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Dairy Farmer',
    content: 'HerdWise has saved me hours every week. The animal tracking is incredible!',
    rating: 5
  },
  {
    name: 'Mike Chen',
    role: 'Cattle Rancher',
    content: 'Finally, a farm management app that actually works. The camp management feature is a game-changer.',
    rating: 5
  },
  {
    name: 'Emma Rodriguez',
    role: 'Sheep Farmer',
    content: 'Simple, intuitive, and powerful. Exactly what I needed for my farm.',
    rating: 5
  }
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
      <header className="w-full py-12 px-4 flex flex-col items-center bg-gradient-to-br from-white to-emerald-50 dark:from-zinc-800 dark:to-emerald-900/20 shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <PawPrint className="h-12 w-12 text-emerald-500" />
          <span className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">HerdWise</span>
        </div>
        
        {/* Trust badges */}
        <div className="flex items-center space-x-6 mb-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span>Trusted by 500+ farms</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4 text-emerald-500" />
            <span>Save 10+ hours/week</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold mb-4 text-center leading-tight">
          Modern farm management, 
          <span className="text-emerald-600 dark:text-emerald-400"> made simple.</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 text-center max-w-3xl leading-relaxed">
          All-in-one platform to track animals, manage camps, handle inventory, and keep your farm running smoothly—anywhere, anytime.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button 
            onClick={() => handleAuthClick('signup')}
            className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-full shadow-lg text-lg transition-all duration-200 transform hover:scale-105"
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          <button 
            onClick={() => handleAuthClick('signin')}
            className="inline-flex items-center justify-center bg-white border-2 border-emerald-600 text-emerald-600 font-bold px-8 py-4 rounded-full shadow text-lg hover:bg-emerald-50 transition-all duration-200"
          >
            Sign In
          </button>
        </div>

        {/* Social proof */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
            ))}
            <span className="ml-1">4.9/5</span>
          </div>
          <span>•</span>
          <span>Join 500+ farmers already using HerdWise</span>
        </div>
      </header>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything you need to run your farm efficiently</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            From animal tracking to financial management, we've got you covered
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {features.map((f, i) => (
            <div key={i} className="flex items-start space-x-4 bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <span className="text-4xl">{f.icon}</span>
              <div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="w-full py-16 bg-white dark:bg-zinc-800">
        <div className="max-w-6xl mx-auto px-4 mb-12">
          <h2 className="text-3xl font-bold mb-4 text-center">See HerdWise in Action</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 text-center max-w-2xl mx-auto">
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
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
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
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">What farmers are saying</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 bg-white dark:bg-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Choose the plan that fits your farm size and needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`relative bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8 border-2 ${plan.popular ? 'border-emerald-500 scale-105' : 'border-gray-200 dark:border-zinc-700'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-600 dark:text-gray-400 ml-1">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{plan.description}</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => handleAuthClick('signup')}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                    plan.popular 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-600 dark:text-gray-400">
              All plans include a 14-day free trial. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your farm management?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of farmers who've already simplified their operations with HerdWise
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => handleAuthClick('signup')}
              className="inline-flex items-center justify-center bg-white text-emerald-600 font-bold px-8 py-4 rounded-full shadow-lg text-lg transition-all duration-200 transform hover:scale-105"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={() => handleAuthClick('signin')}
              className="inline-flex items-center justify-center border-2 border-white text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-white hover:text-emerald-600 transition-all duration-200"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 px-4 bg-gray-900 dark:bg-black text-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <PawPrint className="h-8 w-8 text-emerald-500" />
            <span className="text-xl font-bold">HerdWise</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
            <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Contact</a>
            <span>&copy; {new Date().getFullYear()} HerdWise. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}; 