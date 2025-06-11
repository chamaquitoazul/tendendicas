// src/hooks/useWallet.js
import { useState, useEffect } from 'react';
import Web3 from 'web3';

const useWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [web3, setWeb3] = useState(null);
  const [loading, setLoading] = useState(false);

  // Conectar con MetaMask
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        setLoading(true);
        
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        setIsConnected(true);
        setUserAddress(accounts[0]);
        
        setLoading(false);
        return { web3Instance, address: accounts[0] };
      } else {
        throw new Error('MetaMask no está instalado');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setLoading(false);
      throw error;
    }
  };

  // Desconectar wallet
  const disconnectWallet = () => {
    setIsConnected(false);
    setUserAddress('');
    setWeb3(null);
  };

  // Detectar cambios de cuenta y red
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setUserAddress(accounts[0]);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      };
    }
  }, []);

  return {
    isConnected,
    userAddress,
    web3,
    loading,
    connectWallet,
    disconnectWallet
  };
};

export default useWallet;