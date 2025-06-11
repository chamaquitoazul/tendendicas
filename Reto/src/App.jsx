// src/App.jsx - REFACTORIZADO CON COMPONENTES SEPARADOS
import React, { useState } from 'react';
import "tailwindcss";

// Hooks personalizados
import useWallet from './hooks/useWallet';
import useVoting from './hooks/useVoting';
import useTokens from './hooks/useTokens';

// Componentes
import Header from './components/Header';
import Navigation from './components/Navigation';
import UserScreen from './screens/UserScreen';
import AdminScreen from './screens/AdminScreen';
import TokenScreen from './screens/TokenScreen';
import VotingActions from './components/VotingActions';

// Servicios y constantes
import { BURN_ADDRESS, VOTE_COST, VOTING_CONTRACT_ADDRESS, TOKEN_CONTRACT_ADDRESS } from './services/contractService';

const VotingPlatform = () => {
  // Estados locales
  const [activeTab, setActiveTab] = useState('user');
  const [loading, setLoading] = useState(false);
  
  // Estado para nueva elección
  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    candidates: ['', ''],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Hooks personalizados
  const { 
    isConnected, 
    userAddress, 
    web3, 
    loading: walletLoading, 
    connectWallet, 
    disconnectWallet 
  } = useWallet();

  const {
    votingContract,
    votingActive,
    candidates,
    hasUserVoted,
    elections,
    votedElections,
    electionMetadata,
    setElectionMetadata,
    setVotedElections,
    setHasUserVoted,
    loadVotingData,
    loadBasicVotingData,
    addCandidate,
    removeCandidate,
    toggleVoting,
    resetElection
  } = useVoting(web3, userAddress);

  const {
    tokenContract,
    tokenBalance,
    loadTokenBalance,
    mintTokens,
    transferTokens,
    distributeTokens,
    voteWithTokenBurn,
    canUserVote
  } = useTokens(web3, userAddress);

  // Componente de acciones de votación
  const votingActions = VotingActions({
    isConnected,
    tokenBalance,
    hasUserVoted,
    votingActive,
    candidates,
    voteWithTokenBurn,
    votingContract,
    setVotedElections,
    votedElections,
    setHasUserVoted,
    loadVotingData,
    setLoading
  });

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
      
      // Guardar metadata de la elección
      setElectionMetadata({
        title: newElection.title,
        description: newElection.description,
        endDate: newElection.endDate
      });
      
      // Agregar cada candidato al contrato
      for (const candidate of validCandidates) {
        await addCandidate(candidate);
      }
      
      alert('Candidatos agregados exitosamente! Activa la votación cuando estés listo.');
      setNewElection({ 
        title: '', 
        description: '', 
        candidates: ['', ''], 
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error creating election:', error);
      alert('Error al crear la elección: ' + error.message);
      setLoading(false);
    }
  };

  // Manejar conexión de wallet con carga inicial
  const handleConnectWallet = async () => {
    try {
      const { web3Instance, address } = await connectWallet();
      // Los hooks se encargarán automáticamente de cargar los datos
    } catch (error) {
      alert('Error al conectar la wallet: ' + error.message);
    }
  };

  // Manejar desconexión de wallet
  const handleDisconnectWallet = () => {
    disconnectWallet();
    // Los datos básicos de votación seguirán visibles gracias a loadBasicVotingData
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 w-full flex flex-col">
      {/* Loading Overlay */}
      {(loading || walletLoading) && (
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

      {/* Header */}
      <Header 
        isConnected={isConnected}
        userAddress={userAddress}
        tokenBalance={tokenBalance}
        connectWallet={handleConnectWallet}
        disconnectWallet={handleDisconnectWallet}
        voteCost={VOTE_COST}
        canVote={canUserVote(hasUserVoted, votingActive)}
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
            vote={votingActions.handleVote}
            tokenBalance={tokenBalance}
            hasUserVoted={hasUserVoted}
            voteCost={VOTE_COST}
            canUserVote={votingActions.canVote}
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
            voteCost={VOTE_COST}
            burnAddress={BURN_ADDRESS}
            electionMetadata={electionMetadata}
          />
        )}
      </main>

      {/* Footer */}
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
                  <span className="text-xs text-green-600">Conectado</span>
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