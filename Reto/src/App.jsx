import React, { useState, useEffect } from 'react';
import { Users, Vote, Settings, Eye, Plus, Check, AlertCircle, Wallet } from 'lucide-react';
import "tailwindcss";

const VotingPlatform = () => {
  const [activeTab, setActiveTab] = useState('user');
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [elections, setElections] = useState([
    {
      id: 1,
      title: 'Elección Presidencial 2024',
      description: 'Elección para presidente de la república',
      candidates: ['Candidato A', 'Candidato B', 'Candidato C'],
      votes: [245, 187, 98],
      status: 'active',
      endDate: '2024-12-15'
    },
    {
      id: 2,
      title: 'Referéndum Local',
      description: 'Consulta sobre proyecto de infraestructura',
      candidates: ['Sí', 'No'],
      votes: [156, 89],
      status: 'active',
      endDate: '2024-11-30'
    }
  ]);
  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    candidates: ['', ''],
    endDate: ''
  });
  const [votedElections, setVotedElections] = useState(new Set());

  // Simular conexión con MetaMask
  const connectWallet = async () => {
    try {
      // En implementación real, aquí iría la conexión con MetaMask
      setIsConnected(true);
      setUserAddress('0x742d35Cc6634C0532925a3b8D451C5505D6a1234');
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setUserAddress('');
  };

  // Función para crear nueva elección (Admin)
  const createElection = () => {
    if (newElection.title && newElection.description && newElection.endDate) {
      const election = {
        id: elections.length + 1,
        title: newElection.title,
        description: newElection.description,
        candidates: newElection.candidates.filter(c => c.trim() !== ''),
        votes: new Array(newElection.candidates.filter(c => c.trim() !== '').length).fill(0),
        status: 'active',
        endDate: newElection.endDate
      };
      setElections([...elections, election]);
      setNewElection({ title: '', description: '', candidates: ['', ''], endDate: '' });
    }
  };

  // Función para votar (Usuario)
  const vote = (electionId, candidateIndex) => {
    if (!isConnected) {
      alert('Conecta tu wallet para votar');
      return;
    }
    
    setElections(elections.map(election => {
      if (election.id === electionId) {
        const newVotes = [...election.votes];
        newVotes[candidateIndex]++;
        return { ...election, votes: newVotes };
      }
      return election;
    }));
    
    setVotedElections(new Set([...votedElections, electionId]));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2 border-indigo-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                                  width: `${election.votes.reduce((a, b) => a + b, 0) > 0 
                                    ? (election.votes[index] / election.votes.reduce((a, b) => a + b, 0)) * 100 
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
                              disabled={!isConnected}
                              className="ml-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              Votar
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        Finaliza: {new Date(election.endDate).toLocaleDateString()}
                      </p>
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
                    Fecha de finalización
                  </label>
                  <input
                    type="date"
                    value={newElection.endDate}
                    onChange={(e) => setNewElection({ ...newElection, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Crear Votación
                </button>
              </div>
            </div>
            
            {/* Lista de Elecciones Existentes */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Votaciones Existentes</h3>
              
              <div className="space-y-4">
                {elections.map((election) => (
                  <div key={election.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{election.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        election.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {election.status === 'active' ? 'Activa' : 'Finalizada'}
                      </span>
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
                        Total: {election.votes.reduce((a, b) => a + b, 0)} votos
                      </span>
                      <span className="text-sm text-gray-500">
                        Finaliza: {new Date(election.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default VotingPlatform;