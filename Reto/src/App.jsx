import React, { useState, useEffect } from 'react';
import { Users, Vote, Settings, Eye, Plus, Check, AlertCircle, Wallet } from 'lucide-react';
import Web3 from 'web3';
import "tailwindcss";

// ABI del contrato (simplificado - obtienes el completo de Remix)
const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "selfRegister",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_title", "type": "string"},
      {"internalType": "string", "name": "_description", "type": "string"},
      {"internalType": "string[]", "name": "_candidateNames", "type": "string[]"},
      {"internalType": "uint256", "name": "_durationInDays", "type": "uint256"}
    ],
    "name": "createElection",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_electionId", "type": "uint256"},
      {"internalType": "uint256", "name": "_candidateIndex", "type": "uint256"}
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_electionId", "type": "uint256"}],
    "name": "getElection",
    "outputs": [
      {"internalType": "string", "name": "title", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "uint256", "name": "startTime", "type": "uint256"},
      {"internalType": "uint256", "name": "endTime", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "uint256", "name": "totalVotes", "type": "uint256"},
      {"internalType": "uint256", "name": "candidateCount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_electionId", "type": "uint256"},
      {"internalType": "uint256", "name": "_candidateIndex", "type": "uint256"}
    ],
    "name": "getCandidate",
    "outputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "uint256", "name": "voteCount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllElectionIds",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_voter", "type": "address"}],
    "name": "isRegisteredVoter",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Dirección del contrato (reemplaza con la tuya después de deployar)
const CONTRACT_ADDRESS = "0xf8e81D47203A594245E36C48e151709F0C19fBe8";

const VotingPlatform = () => {
  const [activeTab, setActiveTab] = useState('user');
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    candidates: ['', ''],
    duration: 7
  });
  const [votedElections, setVotedElections] = useState(new Set());

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
        
        // Crear instancia del contrato
        const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        setContract(contractInstance);
        
        // Configurar estado
        setIsConnected(true);
        setUserAddress(accounts[0]);
        
        // Verificar si el usuario está registrado
        await checkRegistration(contractInstance, accounts[0]);
        
        // Cargar elecciones
        await loadElections(contractInstance);
        
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

  // Verificar registro del usuario
  const checkRegistration = async (contractInstance, address) => {
    try {
      const registered = await contractInstance.methods.isRegisteredVoter(address).call();
      setIsRegistered(registered);
    } catch (error) {
      console.error('Error checking registration:', error);
    }
  };

  // Registrarse como votante
  const registerAsVoter = async () => {
    try {
      setLoading(true);
      await contract.methods.selfRegister().send({ from: userAddress });
      setIsRegistered(true);
      alert('Te has registrado como votante exitosamente!');
      setLoading(false);
    } catch (error) {
      console.error('Error registering voter:', error);
      alert('Error al registrarse: ' + error.message);
      setLoading(false);
    }
  };

  // Cargar elecciones desde el contrato
  const loadElections = async (contractInstance) => {
    try {
      const electionIds = await contractInstance.methods.getAllElectionIds().call();
      const electionsData = [];
      
      for (let i = 0; i < electionIds.length; i++) {
        const electionId = electionIds[i];
        const electionInfo = await contractInstance.methods.getElection(electionId).call();
        
        // Cargar candidatos
        const candidates = [];
        const votes = [];
        
        for (let j = 0; j < parseInt(electionInfo.candidateCount); j++) {
          const candidateInfo = await contractInstance.methods.getCandidate(electionId, j).call();
          candidates.push(candidateInfo.name);
          votes.push(parseInt(candidateInfo.voteCount));
        }
        
        const election = {
          id: parseInt(electionId),
          title: electionInfo.title,
          description: electionInfo.description,
          candidates: candidates,
          votes: votes,
          status: electionInfo.isActive ? 'active' : 'finished',
          endDate: new Date(parseInt(electionInfo.endTime) * 1000).toISOString().split('T')[0],
          totalVotes: parseInt(electionInfo.totalVotes)
        };
        
        electionsData.push(election);
      }
      
      setElections(electionsData);
    } catch (error) {
      console.error('Error loading elections:', error);
    }
  };

  // Crear nueva elección
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
      await contract.methods.createElection(
        newElection.title,
        newElection.description,
        validCandidates,
        newElection.duration
      ).send({ from: userAddress });
      
      alert('Elección creada exitosamente!');
      setNewElection({ title: '', description: '', candidates: ['', ''], duration: 7 });
      
      // Recargar elecciones
      await loadElections(contract);
      setLoading(false);
    } catch (error) {
      console.error('Error creating election:', error);
      alert('Error al crear la elección: ' + error.message);
      setLoading(false);
    }
  };

  // Votar
  const vote = async (electionId, candidateIndex) => {
    if (!isRegistered) {
      alert('Debes registrarte como votante primero');
      return;
    }
    
    try {
      setLoading(true);
      await contract.methods.vote(electionId, candidateIndex).send({ from: userAddress });
      
      alert('Voto registrado exitosamente!');
      setVotedElections(new Set([...votedElections, electionId]));
      
      // Recargar elecciones para actualizar conteos
      await loadElections(contract);
      setLoading(false);
    } catch (error) {
      console.error('Error voting:', error);
      alert('Error al votar: ' + error.message);
      setLoading(false);
    }
  };

  // Desconectar wallet
  const disconnectWallet = () => {
    setIsConnected(false);
    setUserAddress('');
    setWeb3(null);
    setContract(null);
    setIsRegistered(false);
    setElections([]);
    setVotedElections(new Set());
  };

  // Agregar candidato
  const addCandidate = () => {
    setNewElection({
      ...newElection,
      candidates: [...newElection.candidates, '']
    });
  };

  // Actualizar candidato
  const updateCandidate = (index, value) => {
    const newCandidates = [...newElection.candidates];
    newCandidates[index] = value;
    setNewElection({ ...newElection, candidates: newCandidates });
  };

  // Detectar cambios de cuenta en MetaMask
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setUserAddress(accounts[0]);
          if (contract) {
            checkRegistration(contract, accounts[0]);
          }
        }
      });
    }
  }, [contract]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 w-full">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Procesando transacción...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-lg border-b-2 border-indigo-200 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Vote className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">VoteChain</h1>
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
                  {!isRegistered && (
                    <button
                      onClick={registerAsVoter}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Registrarse
                    </button>
                  )}
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

      {/* Navigation Tabs */}
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

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'user' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">Votaciones Activas</h2>
              {!isConnected && (
                <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Conecta tu wallet para votar</span>
                </div>
              )}
              {isConnected && !isRegistered && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Regístrate como votante para participar</span>
                </div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {elections.map((election) => (
                <div key={election.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">{election.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        election.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {election.status === 'active' ? 'Activa' : 'Finalizada'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{election.description}</p>
                    
                    <div className="space-y-3">
                      {election.candidates.map((candidate, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">{candidate}</span>
                            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${election.totalVotes > 0 
                                    ? (election.votes[index] / election.totalVotes) * 100 
                                    : 0}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500">{election.votes[index]} votos</span>
                          </div>
                          
                          {votedElections.has(election.id) ? (
                            <div className="ml-4 flex items-center text-green-600">
                              <Check className="h-5 w-5" />
                            </div>
                          ) : (
                            <button
                              onClick={() => vote(election.id, index)}
                              disabled={!isConnected || !isRegistered}
                              className="ml-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              Votar
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          Total: {election.totalVotes} votos
                        </span>
                        <span className="text-sm text-gray-500">
                          Finaliza: {new Date(election.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900">Panel de Administración</h2>
            
            {!isConnected && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">Conecta tu wallet para acceder a las funciones de administrador</p>
              </div>
            )}
            
            {/* Crear Nueva Elección */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Crear Nueva Votación</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título de la votación
                  </label>
                  <input
                    type="text"
                    value={newElection.title}
                    onChange={(e) => setNewElection({ ...newElection, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ej: Elección Municipal 2024"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={newElection.description}
                    onChange={(e) => setNewElection({ ...newElection, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows="3"
                    placeholder="Descripción detallada de la votación..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duración (días)
                  </label>
                  <input
                    type="number"
                    value={newElection.duration}
                    onChange={(e) => setNewElection({ ...newElection, duration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    min="1"
                    max="365"
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Candidatos/Opciones
                    </label>
                    <button
                      onClick={addCandidate}
                      className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Agregar</span>
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {newElection.candidates.map((candidate, index) => (
                      <input
                        key={index}
                        type="text"
                        value={candidate}
                        onChange={(e) => updateCandidate(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder={`Candidato ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={createElection}
                  disabled={!isConnected}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Crear Votación en Blockchain
                </button>
              </div>
            </div>
            
            {/* Lista de Elecciones Existentes */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Votaciones en Blockchain</h3>
              
              <div className="space-y-4">
                {elections.map((election) => (
                  <div key={election.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{election.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          election.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {election.status === 'active' ? 'Activa' : 'Finalizada'}
                        </span>
                        <span className="text-xs text-gray-500">ID: {election.id}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{election.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {election.candidates.map((candidate, index) => (
                        <div key={index} className="bg-gray-50 p-2 rounded">
                          <span className="font-medium">{candidate}</span>
                          <div className="text-indigo-600">{election.votes[index]} votos</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Total: {election.totalVotes} votos
                      </span>
                      <span className="text-sm text-gray-500">
                        Finaliza: {new Date(election.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                
                {elections.length === 0 && isConnected && (
                  <div className="text-center py-8 text-gray-500">
                    No hay votaciones creadas aún
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default VotingPlatform;