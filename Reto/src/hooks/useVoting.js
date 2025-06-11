// src/hooks/useVoting.js
import { useState, useEffect } from 'react';
import { createContracts, createReadOnlyWeb3, VOTING_CONTRACT_ABI, VOTING_CONTRACT_ADDRESS } from '../services/contractService';

const useVoting = (web3, userAddress) => {
  const [votingContract, setVotingContract] = useState(null);
  const [votingActive, setVotingActive] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [voteCounts, setVoteCounts] = useState([]);
  const [hasUserVoted, setHasUserVoted] = useState(false);
  const [elections, setElections] = useState([]);
  const [votedElections, setVotedElections] = useState(new Set());
  
  // Estado para metadata de elección
  const [electionMetadata, setElectionMetadata] = useState({
    title: 'Elección Principal',
    description: 'Votación principal del sistema',
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Inicializar contratos cuando se conecta la wallet
  useEffect(() => {
    if (web3) {
      const { votingContract: vc } = createContracts(web3);
      setVotingContract(vc);
    }
  }, [web3]);

  // Cargar datos básicos de votación (sin wallet)
  const loadBasicVotingData = async () => {
    try {
      const readOnlyWeb3 = createReadOnlyWeb3();
      const votingContractInstance = new readOnlyWeb3.eth.Contract(VOTING_CONTRACT_ABI, VOTING_CONTRACT_ADDRESS);
      
      const isActive = await votingContractInstance.methods.votingActive().call();
      setVotingActive(isActive);
      
      const results = await votingContractInstance.methods.getResults().call();
      setCandidates(results.candidateNames || []);
      setVoteCounts(results.voteCounts ? results.voteCounts.map(count => parseInt(count)) : []);
      
      if (results.candidateNames && results.candidateNames.length > 0) {
        const totalVotes = results.voteCounts.reduce((sum, count) => sum + parseInt(count), 0);
        const election = {
          id: 1,
          title: electionMetadata.title,
          description: electionMetadata.description,
          candidates: results.candidateNames,
          votes: results.voteCounts.map(count => parseInt(count)),
          status: isActive ? 'active' : 'finished',
          endDate: electionMetadata.endDate,
          totalVotes: totalVotes
        };
        setElections([election]);
      } else {
        setElections([]);
      }
    } catch (error) {
      console.error('Error loading basic voting data:', error);
      setElections([{
        id: 0,
        title: 'Cargando votación...',
        description: 'Conectando con el contrato de votación',
        candidates: [],
        votes: [],
        status: 'loading',
        endDate: new Date().toISOString().split('T')[0],
        totalVotes: 0
      }]);
    }
  };

  // Cargar datos completos de votación (con wallet)
  const loadVotingData = async () => {
    try {
      if (votingContract) {
        const isActive = await votingContract.methods.votingActive().call();
        setVotingActive(isActive);
        
        if (userAddress) {
          try {
            const userHasVoted = await votingContract.methods.hasVoted(userAddress).call();
            setHasUserVoted(userHasVoted);
            
            if (userHasVoted) {
              setVotedElections(new Set([1]));
            } else {
              setVotedElections(new Set());
            }
          } catch (error) {
            console.log("Error checking vote status:", error);
            setHasUserVoted(false);
          }
        }
        
        const results = await votingContract.methods.getResults().call();
        setCandidates(results.candidateNames || []);
        setVoteCounts(results.voteCounts ? results.voteCounts.map(count => parseInt(count)) : []);
        
        if (results.candidateNames && results.candidateNames.length > 0) {
          const totalVotes = results.voteCounts.reduce((sum, count) => sum + parseInt(count), 0);
          const election = {
            id: 1,
            title: electionMetadata.title,
            description: electionMetadata.description,
            candidates: results.candidateNames,
            votes: results.voteCounts.map(count => parseInt(count)),
            status: isActive ? 'active' : 'finished',
            endDate: electionMetadata.endDate,
            totalVotes: totalVotes
          };
          setElections([election]);
        } else {
          setElections([]);
          setVotedElections(new Set());
        }
      }
    } catch (error) {
      console.error('Error loading voting data:', error);
    }
  };

  // Funciones de administración
  const addCandidate = async (candidateName) => {
    if (!votingContract || !userAddress) throw new Error('Contract or user not available');
    
    await votingContract.methods.addCandidate(candidateName).send({ from: userAddress });
    await loadVotingData();
    await loadBasicVotingData();
  };

  const removeCandidate = async (candidateName) => {
    if (!votingContract || !userAddress) throw new Error('Contract or user not available');
    if (votingActive) throw new Error('Cannot remove candidates while voting is active');
    
    await votingContract.methods.removeCandidate(candidateName).send({ from: userAddress });
    await loadVotingData();
    await loadBasicVotingData();
  };

  const toggleVoting = async () => {
    if (!votingContract || !userAddress) throw new Error('Contract or user not available');
    
    await votingContract.methods.toggleVoting().send({ from: userAddress });
    await loadVotingData();
    await loadBasicVotingData();
  };

  const resetElection = async () => {
    if (!votingContract || !userAddress) throw new Error('Contract or user not available');
    if (votingActive) throw new Error('Cannot reset while voting is active');
    
    await votingContract.methods.resetElection().send({ from: userAddress });
    
    // Resetear metadata local
    setElectionMetadata({
      title: 'Elección Principal',
      description: 'Votación principal del sistema',
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    
    await loadVotingData();
    await loadBasicVotingData();
  };

  // Cargar datos básicos al inicio y cada 30 segundos
  useEffect(() => {
    loadBasicVotingData();
    
    const interval = setInterval(() => {
      loadBasicVotingData();
    }, 30000);

    return () => clearInterval(interval);
  }, [electionMetadata]);

  // Cargar datos completos cuando hay wallet conectada
  useEffect(() => {
    if (votingContract && userAddress) {
      loadVotingData();
      
      const interval = setInterval(() => {
        loadVotingData();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [votingContract, userAddress, electionMetadata]);

  return {
    votingContract,
    votingActive,
    candidates,
    voteCounts,
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
  };
};

export default useVoting;