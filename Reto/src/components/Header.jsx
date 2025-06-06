// src/components/Header.jsx
import React from 'react';
import { Vote, Wallet, Coins } from 'lucide-react';

const Header = ({ 
  isConnected, 
  userAddress, 
  tokenBalance, 
  connectWallet, 
  disconnectWallet 
}) => {
  return (
    <header className="bg-white shadow-lg border-b-2 border-indigo-200 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Vote className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">VoteChain</h1>
              <p className="text-xs text-gray-500">Plataforma de Voto Electrónico Blockchain</p>
            </div>
          </div>
          
          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-800 font-medium">
                    {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 bg-indigo-100 px-3 py-2 rounded-lg">
                  <Coins className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm text-indigo-800 font-medium">{tokenBalance} VTE</span>
                </div>
                
                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-800 transition-colors"
                >
                  Desconectar
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Wallet className="h-4 w-4" />
                <span>Conectar Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;