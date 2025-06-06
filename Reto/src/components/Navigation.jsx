// src/components/Navigation.jsx
import React from 'react';
import { Users, Settings, Coins } from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="bg-white shadow-sm w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('user')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'user'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Usuario</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'tokens'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Coins className="h-4 w-4" />
              <span>Tokens</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'admin'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Administrador</span>
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;