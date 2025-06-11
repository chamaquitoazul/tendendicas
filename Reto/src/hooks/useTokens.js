// src/hooks/useTokens.js
import { useState, useEffect } from 'react';
import { createContracts, BURN_ADDRESS, VOTE_COST } from '../services/contractService';

const useTokens = (web3, userAddress) => {
  const [tokenContract, setTokenContract] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);

  // Inicializar contrato cuando se conecta la wallet
  useEffect(() => {
    if (web3) {
      const { tokenContract: tc } = createContracts(web3);
      setTokenContract(tc);
    }
  }, [web3]);

  // Cargar balance de tokens
  const loadTokenBalance = async (contractInstance = tokenContract, address = userAddress) => {
    try {
      if (contractInstance && address) {
        const balance = await contractInstance.methods.balanceOf(address).call();
        const decimals = await contractInstance.methods.decimals().call();
        const formattedBalance = parseInt(balance) / Math.pow(10, parseInt(decimals));
        setTokenBalance(formattedBalance);
        return formattedBalance;
      }
    } catch (error) {
      console.error('Error loading token balance:', error);
      return 0;
    }
  };

  // Crear tokens (mint)
  const mintTokens = async (recipient, amount) => {
    if (!tokenContract || !userAddress) throw new Error('Contract or user not available');
    
    await tokenContract.methods.mint(recipient, amount).send({ from: userAddress });
    await loadTokenBalance();
  };

  // Transferir tokens
  const transferTokens = async (recipient, amount) => {
    if (!tokenContract || !userAddress) throw new Error('Contract or user not available');
    
    const decimals = await tokenContract.methods.decimals().call();
    const transferAmount = BigInt(amount) * BigInt(10 ** parseInt(decimals));
    
    await tokenContract.methods.transfer(recipient, transferAmount.toString()).send({ from: userAddress });
    await loadTokenBalance();
  };

  // Distribuir tokens
  const distributeTokens = async (recipients, amount) => {
    if (!tokenContract || !userAddress) throw new Error('Contract or user not available');
    
    await tokenContract.methods.distributeTokens(recipients, amount).send({ from: userAddress });
    await loadTokenBalance();
  };

  // Votar con quemado de tokens
  const voteWithTokenBurn = async (votingContract, candidateIndex, candidates) => {
    if (!tokenContract || !userAddress) throw new Error('Contract or user not available');
    if (tokenBalance < VOTE_COST) throw new Error(`Insufficient tokens. Need ${VOTE_COST} VTE`);
    
    // Paso 1: Quemar tokens
    const decimals = await tokenContract.methods.decimals().call();
    const burnAmount = BigInt(VOTE_COST) * BigInt(10 ** parseInt(decimals));
    
    await tokenContract.methods.transfer(BURN_ADDRESS, burnAmount.toString()).send({ 
      from: userAddress 
    });
    
    // Paso 2: Registrar voto
    const candidateName = candidates[candidateIndex];
    await votingContract.methods.vote(candidateName).send({ from: userAddress });
    
    // Paso 3: Actualizar balance
    await loadTokenBalance();
    
    return candidateName;
  };

  // Verificar si puede votar
  const canUserVote = (hasUserVoted, votingActive) => {
    return (
      userAddress && 
      tokenBalance >= VOTE_COST && 
      !hasUserVoted && 
      votingActive
    );
  };

  // Cargar balance automáticamente
  useEffect(() => {
    if (tokenContract && userAddress) {
      loadTokenBalance();
      
      const interval = setInterval(() => {
        loadTokenBalance();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [tokenContract, userAddress]);

  return {
    tokenContract,
    tokenBalance,
    loadTokenBalance,
    mintTokens,
    transferTokens,
    distributeTokens,
    voteWithTokenBurn,
    canUserVote
  };
};

export default useTokens;