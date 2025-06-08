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
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
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
const VOTING_CONTRACT_ADDRESS = "0xde0b71BAED8F2059077c1B72CEa525b9185E5B7d";
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
        await loadVotingData(votingContractInstance);
        
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
  const loadVotingData = async (votingContractInstance = votingContract) => {
    try {
      if (votingContractInstance) {
        // Verificar si la votación está activa
        const isActive = await votingContractInstance.methods.votingActive().call();
        setVotingActive(isActive);
        
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
        } else {
          setElections([]);
        }
      }
    } catch (error) {
      console.error('Error loading voting data:', error);
    }
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
      const transferAmount = Web3.utils.toBN(amount).mul(Web3.utils.toBN(10).pow(Web3.utils.toBN(decimals)));
      
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

  // Votar
  const vote = async (electionId, candidateIndex) => {
    if (tokenBalance === 0) {
      alert('Necesitas tokens VTE para votar');
      return;
    }
    
    try {
      setLoading(true);
      const candidateName = candidates[candidateIndex];
      await votingContract.methods.vote(candidateName).send({ from: userAddress });
      
      alert('Voto registrado exitosamente!');
      setVotedElections(new Set([...votedElections, electionId]));
      
      // Recargar datos
      await loadVotingData();
      setLoading(false);
    } catch (error) {
      console.error('Error voting:', error);
      alert('Error al votar: ' + error.message);
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
  };

  // Detectar cambios de cuenta en MetaMask
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setUserAddress(accounts[0]);
          if (tokenContract) {
            loadTokenBalance(tokenContract, accounts[0]);
          }
        }
      });
    }
  }, [tokenContract]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 w-full flex flex-col">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-center">Procesando transacción...</p>
            <p className="text-xs text-gray-500 text-center mt-1">
              Confirma la transacción en MetaMask
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <Header 
        isConnected={isConnected}
        userAddress={userAddress}
        tokenBalance={tokenBalance}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
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
            vote={vote}
            tokenBalance={tokenBalance}
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
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              Plataforma de Voto Electrónico Basada en Blockchain
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="text-xs text-gray-400">
                Voting: {VOTING_CONTRACT_ADDRESS.slice(0, 6)}...{VOTING_CONTRACT_ADDRESS.slice(-4)}
              </div>
              <div className="text-xs text-gray-400">
                Token: {TOKEN_CONTRACT_ADDRESS.slice(0, 6)}...{TOKEN_CONTRACT_ADDRESS.slice(-4)}
              </div>
              {isConnected && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600">Conectado a Blockchain</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VotingPlatform;