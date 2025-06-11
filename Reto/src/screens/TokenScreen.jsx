// src/screens/TokenScreen.jsx - CORREGIDO SIN ERRORES JSX
import React, { useState } from 'react';
import { Coins, Send, Users, Plus, Wallet, Lock } from 'lucide-react';

const TokenScreen = ({ 
  isConnected, 
  userAddress, 
  tokenContract, 
  tokenBalance, 
  loadTokenBalance,
  mintTokens,
  transferTokens,
  distributeTokens,
  burnAddress,
  voteCost
}) => {
  // Estados para autenticación de administrador
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Estados para formularios
  const [mintData, setMintData] = useState({
    recipient: '',
    amount: ''
  });
  
  const [transferData, setTransferData] = useState({
    recipient: '',
    amount: ''
  });
  
  const [distributionData, setDistributionData] = useState({
    recipients: [''],
    amount: ''
  });

  // Manejar autenticación
  const handleAuth = (e) => {
    e.preventDefault();
    if (password === '1116661') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Contraseña incorrecta');
      setPassword('');
    }
  };

  // Cerrar sesión de admin
  const logout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setAuthError('');
  };

  // Funciones para distribución masiva
  const addRecipient = () => {
    setDistributionData({
      ...distributionData,
      recipients: [...distributionData.recipients, '']
    });
  };

  const updateRecipient = (index, value) => {
    const newRecipients = [...distributionData.recipients];
    newRecipients[index] = value;
    setDistributionData({ ...distributionData, recipients: newRecipients });
  };

  const removeRecipient = (index) => {
    if (distributionData.recipients.length > 1) {
      const newRecipients = distributionData.recipients.filter((_, i) => i !== index);
      setDistributionData({ ...distributionData, recipients: newRecipients });
    }
  };

  // Handlers para acciones de tokens
  const handleMint = async () => {
    if (!mintData.recipient || !mintData.amount) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    try {
      await mintTokens(mintData.recipient, mintData.amount);
      setMintData({ recipient: '', amount: '' });
      await loadTokenBalance();
    } catch (error) {
      console.error('Error minting tokens:', error);
    }
  };

  const handleTransfer = async () => {
    if (!transferData.recipient || !transferData.amount) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    try {
      await transferTokens(transferData.recipient, transferData.amount);
      setTransferData({ recipient: '', amount: '' });
      await loadTokenBalance();
    } catch (error) {
      console.error('Error transferring tokens:', error);
    }
  };

  const handleDistribution = async () => {
    const validRecipients = distributionData.recipients.filter(r => r.trim() !== '');
    
    if (validRecipients.length === 0 || !distributionData.amount) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    try {
      await distributeTokens(validRecipients, distributionData.amount);
      setDistributionData({ recipients: [''], amount: '' });
      await loadTokenBalance();
    } catch (error) {
      console.error('Error distributing tokens:', error);
    }
  };

  // Pantalla de autenticación
  if (!isAuthenticated) {
    return (
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-gray-900">Gestión de Tokens</h2>
        
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Acceso Restringido</h3>
              <p className="text-gray-600 mt-2">Ingresa la contraseña de administrador</p>
            </div>
            
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña de Administrador
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ingresa la contraseña"
                  required
                />
                {authError && (
                  <p className="text-red-600 text-sm mt-1">{authError}</p>
                )}
              </div>
              
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Acceder
              </button>
            </form>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 text-center">
                Solo los administradores autorizados pueden acceder a esta sección
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla cuando no hay wallet conectada
  if (!isConnected) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Gestión de Tokens VTE</h2>
          <button
            onClick={logout}
            className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
          >
            Cerrar Sesión Admin
          </button>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Wallet className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <p className="text-yellow-800 text-lg">Conecta tu wallet para gestionar tokens</p>
        </div>
      </div>
    );
  }

  // Pantalla principal de gestión
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Gestión de Tokens VTE</h2>
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-100 px-4 py-2 rounded-lg">
            <span className="text-sm text-indigo-800 font-medium">
              Balance: {tokenBalance} VTE
            </span>
          </div>
          <button
            onClick={logout}
            className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
          >
            Cerrar Sesión Admin
          </button>
        </div>
      </div>

      {/* Información del Token */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Coins className="h-5 w-5 mr-2" />
          Información del Token
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-sm text-gray-600">Nombre</label>
            <p className="font-semibold">VoteChain Token</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-sm text-gray-600">Símbolo</label>
            <p className="font-semibold">VTE</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-sm text-gray-600">Tu Balance</label>
            <p className="font-semibold text-indigo-600">{tokenBalance} VTE</p>
          </div>
        </div>
      </div>

      {/* Crear Tokens */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Crear Tokens
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección del destinatario
            </label>
            <input
              type="text"
              value={mintData.recipient}
              onChange={(e) => setMintData({ ...mintData, recipient: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="0x..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad de tokens
            </label>
            <input
              type="number"
              value={mintData.amount}
              onChange={(e) => setMintData({ ...mintData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="100"
              min="1"
            />
          </div>
          <button
            onClick={handleMint}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Crear Tokens
          </button>
        </div>
      </div>

      {/* Transferir Tokens */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Send className="h-5 w-5 mr-2" />
          Transferir Tokens
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección del destinatario
            </label>
            <input
              type="text"
              value={transferData.recipient}
              onChange={(e) => setTransferData({ ...transferData, recipient: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="0x..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad de tokens
            </label>
            <input
              type="number"
              value={transferData.amount}
              onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="50"
              min="1"
              max={tokenBalance}
            />
          </div>
          <button
            onClick={handleTransfer}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Transferir Tokens
          </button>
        </div>
      </div>

      {/* Distribuir Tokens */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Distribuir Tokens Masivamente
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Direcciones de destinatarios
              </label>
              <button
                onClick={addRecipient}
                className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Agregar Dirección</span>
              </button>
            </div>
            
            <div className="space-y-2">
              {distributionData.recipients.map((recipient, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => updateRecipient(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={`Dirección ${index + 1}`}
                  />
                  {distributionData.recipients.length > 1 && (
                    <button
                      onClick={() => removeRecipient(index)}
                      className="text-red-600 hover:text-red-800 px-2 py-2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad por destinatario
            </label>
            <input
              type="number"
              value={distributionData.amount}
              onChange={(e) => setDistributionData({ ...distributionData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="10"
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Total necesario: {distributionData.amount * distributionData.recipients.filter(r => r.trim() !== '').length || 0} VTE
            </p>
          </div>
          
          <button
            onClick={handleDistribution}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Distribuir Tokens
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenScreen;