import React from 'react';
import { PawPrint } from 'lucide-react';

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

export const LandingPage: React.FC = () => {
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
        <a href="#signup" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg text-lg transition-all duration-200">Get Started Free</a>
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

      {/* Testimonial & Screenshot */}
      <section className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8 py-8 px-4">
        <div className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 shadow">
          <blockquote className="italic text-lg mb-2">“HerdWise has made managing my farm so much easier!”</blockquote>
          <div className="text-emerald-700 dark:text-emerald-300 font-semibold">— Real Farmer</div>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="w-64 h-40 bg-gray-200 dark:bg-zinc-700 rounded-lg flex items-center justify-center text-gray-400 text-sm">
            [App Screenshot]
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-8 px-4 flex flex-col items-center">
        <h2 className="text-xl font-bold mb-2">Ready to simplify your farm?</h2>
        <a href="#signup" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg text-lg transition-all duration-200">Sign Up Free</a>
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