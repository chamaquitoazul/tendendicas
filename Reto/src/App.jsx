// src/App.jsx
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import "tailwindcss";

// Importar componentes y pantallas
import Header from './components/Header';
import Navigation from './components/Navigation';
import UserScreen from './screens/UserScreen';
import AdminScreen from './screens/AdminScreen';
import TokenScreen from './screens/TokenScreen';

// CONSTANTES DEL SISTEMA DE QUEMADO DE TOKENS
const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD";
const VOTE_COST = 1; // 1 VTE por voto

// ABI del contrato de votación actualizado
const VOTING_CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "votingActive",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "candidate", "type": "string"}],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "candidate", "type": "string"}],
    "name": "addCandidate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "candidate", "type": "string"}],
    "name": "removeCandidate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "toggleVoting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllCandidates",
    "outputs": [{"internalType": "string[]", "name": "", "type": "string[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalVotes",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getResults",
    "outputs": [
      {"internalType": "string[]", "name": "candidateNames", "type": "string[]"},
      {"internalType": "uint256[]", "name": "voteCounts", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "", "type": "string"}],
    "name": "voteCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "hasVoted",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCandidateCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resetElection",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// ABI del contrato de tokens
const TOKEN_CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_to", "type": "address"},
      {"internalType": "uint256", "name": "_value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_to", "type": "address"},
      {"internalType": "uint256", "name": "_amount", "type": "uint256"}
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address[]", "name": "_recipients", "type": "address[]"},
      {"internalType": "uint256", "name": "_amount", "type": "uint256"}
    ],
    "name": "distributeTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Direcciones de los contratos (reemplaza con las tuyas después de deployar)
const VOTING_CONTRACT_ADDRESS = "0xcc42105EBf3a54371F6B380955946818BcbA1519";
const TOKEN_CONTRACT_ADDRESS = "0x5Cd4e9d0ffad11dDd497029E8720d538Bc8Bd479"; 

const VotingPlatform = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState('user');
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [web3, setWeb3] = useState(null);
  const [votingContract, setVotingContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [votedElections, setVotedElections] = useState(new Set());
  
  // Estado para nueva elección
  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    candidates: ['', ''],
    duration: 7
  });

  // Estados para votación activa
  const [votingActive, setVotingActive] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [voteCounts, setVoteCounts] = useState([]);
  const [hasUserVoted, setHasUserVoted] = useState(false);

  // Conectar con MetaMask
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        setLoading(true);
        
        // Solicitar conexión a MetaMask
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        // Crear instancia de Web3
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        
        // Crear instancias de los contratos
        const votingContractInstance = new web3Instance.eth.Contract(VOTING_CONTRACT_ABI, VOTING_CONTRACT_ADDRESS);
        const tokenContractInstance = new web3Instance.eth.Contract(TOKEN_CONTRACT_ABI, TOKEN_CONTRACT_ADDRESS);
        
        setVotingContract(votingContractInstance);
        setTokenContract(tokenContractInstance);
        
        // Configurar estado
        setIsConnected(true);
        setUserAddress(accounts[0]);
        
        // Cargar datos
        await loadTokenBalance(tokenContractInstance, accounts[0]);
        await loadVotingData(votingContractInstance, accounts[0]);
        
        setLoading(false);
      } else {
        alert('MetaMask no está instalado. Por favor instálalo para continuar.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Error al conectar la wallet: ' + error.message);
      setLoading(false);
    }
  };

  // Cargar balance de tokens
  const loadTokenBalance = async (tokenContractInstance = tokenContract, address = userAddress) => {
    try {
      if (tokenContractInstance && address) {
        const balance = await tokenContractInstance.methods.balanceOf(address).call();
        const decimals = await tokenContractInstance.methods.decimals().call();
        const formattedBalance = parseInt(balance) / Math.pow(10, parseInt(decimals));
        setTokenBalance(formattedBalance);
      }
    } catch (error) {
      console.error('Error loading token balance:', error);
    }
  };

  // Cargar datos de votación
  const loadVotingData = async (votingContractInstance = votingContract, address = userAddress) => {
    try {
      if (votingContractInstance) {
        // Verificar si la votación está activa
        const isActive = await votingContractInstance.methods.votingActive().call();
        setVotingActive(isActive);
        
        // Verificar si el usuario ya votó EN LA VERSIÓN ACTUAL de la elección
        if (address) {
          let userHasVoted = false;
          try {
            // Intentar usar la nueva función si existe
            userHasVoted = await votingContractInstance.methods.hasVotedInCurrentElection(address).call();
          } catch (error) {
            // Fallback a la función original si no existe la nueva
            try {
              userHasVoted = await votingContractInstance.methods.hasVoted(address).call();
            } catch (err) {
              console.log("Error checking vote status:", err);
              userHasVoted = false;
            }
          }
          setHasUserVoted(userHasVoted);
        }
        
        // Obtener candidatos y resultados
        const results = await votingContractInstance.methods.getResults().call();
        setCandidates(results.candidateNames || []);
        setVoteCounts(results.voteCounts ? results.voteCounts.map(count => parseInt(count)) : []);
        
        // Simular elecciones para mantener compatibilidad con el UI existente
        if (results.candidateNames && results.candidateNames.length > 0) {
          const totalVotes = results.voteCounts.reduce((sum, count) => sum + parseInt(count), 0);
          const election = {
            id: 1,
            title: 'Elección Principal',
            description: 'Votación principal del sistema',
            candidates: results.candidateNames,
            votes: results.voteCounts.map(count => parseInt(count)),
            status: isActive ? 'active' : 'finished',
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            totalVotes: totalVotes
          };
          setElections([election]);
          
          // Actualizar estado de votación del usuario
          if (userHasVoted) {
            setVotedElections(new Set([1]));
          } else {
            setVotedElections(new Set());
          }
        } else {
          setElections([]);
          setVotedElections(new Set());
        }
      }
    } catch (error) {
      console.error('Error loading voting data:', error);
    }
  };

  // 🔥 FUNCIÓN PRINCIPAL: VOTAR CON QUEMADO DE TOKENS
  const voteWithTokenBurn = async (electionId, candidateIndex) => {
    // ✅ VERIFICACIONES INICIALES
    if (tokenBalance < VOTE_COST) {
      alert(`❌ Necesitas al menos ${VOTE_COST} tokens VTE para votar.\nTienes: ${tokenBalance} VTE\nCosto: ${VOTE_COST} VTE`);
      return;
    }

    if (hasUserVoted) {
      alert('❌ Ya has votado en esta elección');
      return;
    }

    if (!votingActive) {
      alert('❌ La votación no está activa');
      return;
    }
    
    try {
      setLoading(true);
      
      // ✅ PASO 1: QUEMAR TOKENS VTE (transferir a dirección burn)
      console.log(`🔥 Paso 1: Quemando ${VOTE_COST} tokens VTE...`);
      
      const decimals = await tokenContract.methods.decimals().call();
      const burnAmount = BigInt(VOTE_COST) * BigInt(10 ** parseInt(decimals));
      
      // Transferir tokens a dirección burn
      console.log(`Transfiriendo ${burnAmount.toString()} wei a ${BURN_ADDRESS}`);
      
      const burnTx = await tokenContract.methods.transfer(BURN_ADDRESS, burnAmount.toString()).send({ 
        from: userAddress 
      });
      
      console.log(`✅ ${VOTE_COST} tokens VTE quemados exitosamente. TX: ${burnTx.transactionHash}`);
      
      // ✅ PASO 2: REGISTRAR EL VOTO EN EL CONTRATO
      console.log(`🗳️  Paso 2: Registrando voto...`);
      
      const candidateName = candidates[candidateIndex];
      const voteTx = await votingContract.methods.vote(candidateName).send({ from: userAddress });
      
      console.log(`✅ Voto registrado exitosamente. TX: ${voteTx.transactionHash}`);
      
      // ✅ PASO 3: ACTUALIZAR ESTADO LOCAL
      setVotedElections(new Set([...votedElections, electionId]));
      setHasUserVoted(true);
      
      // ✅ PASO 4: MOSTRAR CONFIRMACIÓN
      alert(`🎉 ¡Voto registrado exitosamente!\n\n` +
            `• Candidato: ${candidateName}\n` +
            `• Tokens consumidos: ${VOTE_COST} VTE\n` +
            `• Nuevo balance: ${tokenBalance - VOTE_COST} VTE`);
      
      // ✅ PASO 5: RECARGAR DATOS
      await loadVotingData();
      await loadTokenBalance(); // ← Balance reducido
      
      setLoading(false);
      
    } catch (error) {
      console.error('Error voting with token burn:', error);
      
      // Mensaje de error más detallado
      let errorMessage = 'Error al votar: ';
      if (error.message.includes('insufficient funds')) {
        errorMessage += 'Fondos insuficientes para pagar gas fees';
      } else if (error.message.includes('User denied')) {
        errorMessage += 'Transacción cancelada por el usuario';
      } else if (error.message.includes('revert')) {
        errorMessage += 'Transacción rechazada por el contrato';
      } else {
        errorMessage += error.message;
      }
      
      alert('❌ ' + errorMessage);
      setLoading(false);
    }
  };

  // 🔥 FUNCIÓN PARA VERIFICAR SI EL USUARIO PUEDE VOTAR
  const canUserVote = () => {
    return (
      isConnected && 
      tokenBalance >= VOTE_COST && 
      !hasUserVoted && 
      votingActive &&
      candidates.length > 0
    );
  };

  // Crear tokens (mint)
  const mintTokens = async (recipient, amount) => {
    try {
      setLoading(true);
      await tokenContract.methods.mint(recipient, amount).send({ from: userAddress });
      alert('Tokens creados exitosamente!');
      await loadTokenBalance();
      setLoading(false);
    } catch (error) {
      console.error('Error minting tokens:', error);
      alert('Error al crear tokens: ' + error.message);
      setLoading(false);
    }
  };

  // Transferir tokens
  const transferTokens = async (recipient, amount) => {
    try {
      setLoading(true);
      const decimals = await tokenContract.methods.decimals().call();
      
      // ✅ SOLUCIÓN: Usar BigInt en lugar de Web3.utils.toBN
      const transferAmount = BigInt(amount) * BigInt(10 ** parseInt(decimals));
      
      await tokenContract.methods.transfer(recipient, transferAmount.toString()).send({ from: userAddress });
      alert('Tokens transferidos exitosamente!');
      await loadTokenBalance();
      setLoading(false);
    } catch (error) {
      console.error('Error transferring tokens:', error);
      alert('Error al transferir tokens: ' + error.message);
      setLoading(false);
    }
  };

  // Distribuir tokens
  const distributeTokens = async (recipients, amount) => {
    try {
      setLoading(true);
      await tokenContract.methods.distributeTokens(recipients, amount).send({ from: userAddress });
      alert('Tokens distribuidos exitosamente!');
      await loadTokenBalance();
      setLoading(false);
    } catch (error) {
      console.error('Error distributing tokens:', error);
      alert('Error al distribuir tokens: ' + error.message);
      setLoading(false);
    }
  };

  // Agregar candidato
  const addCandidate = async (candidateName) => {
    try {
      setLoading(true);
      await votingContract.methods.addCandidate(candidateName).send({ from: userAddress });
      alert('Candidato agregado exitosamente!');
      await loadVotingData();
      setLoading(false);
    } catch (error) {
      console.error('Error adding candidate:', error);
      alert('Error al agregar candidato: ' + error.message);
      setLoading(false);
    }
  };

  // Remover candidato
  const removeCandidate = async (candidateName) => {
    if (votingActive) {
      alert('No se puede eliminar candidatos mientras la votación esté activa');
      return;
    }
    
    try {
      setLoading(true);
      await votingContract.methods.removeCandidate(candidateName).send({ from: userAddress });
      alert('Candidato eliminado exitosamente!');
      await loadVotingData();
      setLoading(false);
    } catch (error) {
      console.error('Error removing candidate:', error);
      alert('Error al eliminar candidato: ' + error.message);
      setLoading(false);
    }
  };

  // Activar/desactivar votación
  const toggleVoting = async () => {
    try {
      setLoading(true);
      await votingContract.methods.toggleVoting().send({ from: userAddress });
      alert(`Votación ${votingActive ? 'desactivada' : 'activada'} exitosamente!`);
      await loadVotingData();
      setLoading(false);
    } catch (error) {
      console.error('Error toggling voting:', error);
      alert('Error al cambiar estado de votación: ' + error.message);
      setLoading(false);
    }
  };

  // Crear nueva elección (para compatibilidad con el admin screen)
  const createElection = async () => {
    if (!newElection.title || !newElection.description) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    const validCandidates = newElection.candidates.filter(c => c.trim() !== '');
    if (validCandidates.length < 2) {
      alert('Debe haber al menos 2 candidatos');
      return;
    }
    
    try {
      setLoading(true);
      
      // Agregar cada candidato al contrato
      for (const candidate of validCandidates) {
        await votingContract.methods.addCandidate(candidate).send({ from: userAddress });
      }
      
      alert('Candidatos agregados exitosamente! Activa la votación cuando estés listo.');
      setNewElection({ title: '', description: '', candidates: ['', ''], duration: 7 });
      
      // Recargar datos
      await loadVotingData();
      setLoading(false);
    } catch (error) {
      console.error('Error creating election:', error);
      alert('Error al crear la elección: ' + error.message);
      setLoading(false);
    }
  };

  // Resetear elección (función de emergencia)
  const resetElection = async () => {
    if (votingActive) {
      alert('No se puede resetear la elección mientras la votación esté activa');
      return;
    }

    const confirmed = window.confirm(
      '¿Estás seguro de que quieres resetear toda la elección? ' +
      'Esto eliminará todos los candidatos y votos. Esta acción no se puede deshacer.'
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      await votingContract.methods.resetElection().send({ from: userAddress });
      alert('Elección reseteada exitosamente!');
      await loadVotingData();
      setLoading(false);
    } catch (error) {
      console.error('Error resetting election:', error);
      alert('Error al resetear la elección: ' + error.message);
      setLoading(false);
    }
  };

  // Función de debugging temporal
  const debugContractState = async () => {
    if (!votingContract) {
      console.log("❌ Contract not connected");
      return;
    }

    try {
      console.log("🔍 DEBUGGING CONTRACT STATE:");
      
      // Estado básico
      const isActive = await votingContract.methods.votingActive().call();
      console.log("- Voting Active:", isActive);
      
      // Candidatos
      const allCandidates = await votingContract.methods.getAllCandidates().call();
      console.log("- Candidates:", allCandidates);
      console.log("- Candidate Count:", allCandidates.length);
      
      // Resultados
      const results = await votingContract.methods.getResults().call();
      console.log("- Results:", results);
      
      // Votos totales
      const totalVotes = await votingContract.methods.getTotalVotes().call();
      console.log("- Total Votes:", totalVotes.toString());
      
      // Usuario ha votado
      if (userAddress) {
        const hasUserVotedState = await votingContract.methods.hasVoted(userAddress).call();
        console.log("- User has voted:", hasUserVotedState);
      }

      // Estado de tokens
      console.log("- User token balance:", tokenBalance);
      console.log("- Can user vote:", canUserVote());
      console.log("- Vote cost:", VOTE_COST);
      
      console.log("✅ Debug complete");
      
    } catch (error) {
      console.error("❌ Debug error:", error);
    }
  };

  // Desconectar wallet
  const disconnectWallet = () => {
    setIsConnected(false);
    setUserAddress('');
    setWeb3(null);
    setVotingContract(null);
    setTokenContract(null);
    setTokenBalance(0);
    setElections([]);
    setVotedElections(new Set());
    setCandidates([]);
    setVoteCounts([]);
    setHasUserVoted(false);
  };

  // Detectar cambios de cuenta en MetaMask
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setUserAddress(accounts[0]);
          if (tokenContract && votingContract) {
            loadTokenBalance(tokenContract, accounts[0]);
            loadVotingData(votingContract, accounts[0]);
          }
        }
      });

      // Detectar cambios de red
      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });
    }

    // Cleanup
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [tokenContract, votingContract]);

  // Cargar datos automáticamente cada 30 segundos si está conectado
  useEffect(() => {
    if (isConnected && votingContract && tokenContract) {
      const interval = setInterval(() => {
        loadVotingData();
        loadTokenBalance();
      }, 30000); // 30 segundos

      return () => clearInterval(interval);
    }
  }, [isConnected, votingContract, tokenContract]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 w-full flex flex-col">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-center">Procesando transacción...</p>
            <p className="text-xs text-gray-500 text-center mt-1">
              {tokenBalance < VOTE_COST && activeTab === 'user' ? 
                'Quemando tokens VTE y registrando voto...' : 
                'Confirma la transacción en MetaMask'
              }
            </p>
          </div>
        </div>
      )}

      {/* Header con información del sistema de tokens */}
      <Header 
        isConnected={isConnected}
        userAddress={userAddress}
        tokenBalance={tokenBalance}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
        voteCost={VOTE_COST}
        canVote={canUserVote()}
      />

      {/* Navigation Tabs */}
      <Navigation 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'user' && (
          <UserScreen 
            isConnected={isConnected}
            elections={elections}
            votedElections={votedElections}
            vote={voteWithTokenBurn} // ← Usar la función de quemado
            tokenBalance={tokenBalance}
            hasUserVoted={hasUserVoted}
            voteCost={VOTE_COST}
            canUserVote={canUserVote}
          />
        )}

        {activeTab === 'tokens' && (
          <TokenScreen 
            isConnected={isConnected}
            userAddress={userAddress}
            tokenContract={tokenContract}
            tokenBalance={tokenBalance}
            loadTokenBalance={loadTokenBalance}
            mintTokens={mintTokens}
            transferTokens={transferTokens}
            distributeTokens={distributeTokens}
            burnAddress={BURN_ADDRESS}
            voteCost={VOTE_COST}
          />
        )}

        {activeTab === 'admin' && (
          <AdminScreen 
            isConnected={isConnected}
            elections={elections}
            newElection={newElection}
            setNewElection={setNewElection}
            createElection={createElection}
            candidates={candidates}
            votingActive={votingActive}
            addCandidate={addCandidate}
            toggleVoting={toggleVoting}
            removeCandidate={removeCandidate}
            resetElection={resetElection}
            debugContractState={debugContractState}
            voteCost={VOTE_COST}
            burnAddress={BURN_ADDRESS}
          />
        )}
      </main>

      {/* Footer con información del sistema */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              Plataforma de Voto Electrónico con Tokens VTE
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="text-xs text-gray-400">
                Voting: {VOTING_CONTRACT_ADDRESS.slice(0, 6)}...{VOTING_CONTRACT_ADDRESS.slice(-4)}
              </div>
              <div className="text-xs text-gray-400">
                Token: {TOKEN_CONTRACT_ADDRESS.slice(0, 6)}...{TOKEN_CONTRACT_ADDRESS.slice(-4)}
              </div>
              <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                Costo por voto: {VOTE_COST} VTE
              </div>
              {isConnected && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                 
                </div>
              )}
            </div>
          </div>
          
          {/* Información adicional del sistema */}
         
        </div>
      </footer>
    </div>
  );
};

export default VotingPlatform;