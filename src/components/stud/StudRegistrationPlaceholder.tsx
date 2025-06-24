import React from 'react';
import { FileText, ExternalLink, Upload, Database } from 'lucide-react';

export const StudRegistrationPlaceholder: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Stud Registration Integration</h2>
        <p className="text-gray-600 dark:text-gray-400">Future integration with breed society databases</p>
      </div>

      <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700">
        <div className="text-center py-12">
          <Database className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Coming Soon: Breed Society Integration
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            This feature will allow you to sync your animal data with official breed society registration databases, 
            automatically import pedigree information, and submit registration applications directly from the app.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gray-50 dark:bg-zinc-700 p-6 rounded-lg">
              <FileText className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Auto Registration</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Submit registration applications directly to breed societies
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-zinc-700 p-6 rounded-lg">
              <Upload className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Pedigree Import</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically import complete pedigree data from official databases
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-zinc-700 p-6 rounded-lg">
              <ExternalLink className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">API Integration</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Real-time sync with multiple breed society databases
              </p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Planned Integrations</h4>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p>• South African Stud Book Association</p>
              <p>• Breed-specific societies (Bonsmara, Brahman, etc.)</p>
              <p>• International breed registries</p>
              <p>• Custom API endpoints for private databases</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 