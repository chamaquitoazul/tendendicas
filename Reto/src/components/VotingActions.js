// src/components/VotingActions.js
import React from 'react';
import { VOTE_COST } from '../services/contractService';

const VotingActions = ({ 
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
}) => {

  // Función principal para votar
  const handleVote = async (electionId, candidateIndex) => {
    // Verificaciones iniciales
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
      
      console.log(`🔥 Paso 1: Quemando ${VOTE_COST} tokens VTE...`);
      
      // Ejecutar voto con quemado de tokens
      const candidateName = await voteWithTokenBurn(votingContract, candidateIndex, candidates);
      
      console.log(`✅ Voto registrado exitosamente para: ${candidateName}`);
      
      // Actualizar estado local
      setVotedElections(new Set([...votedElections, electionId]));
      setHasUserVoted(true);
      
      // Mostrar confirmación
      alert(`🎉 ¡Voto registrado exitosamente!\n\n` +
            `• Candidato: ${candidateName}\n` +
            `• Tokens consumidos: ${VOTE_COST} VTE\n` +
            `• Nuevo balance: ${tokenBalance - VOTE_COST} VTE`);
      
      // Recargar datos
      await loadVotingData();
      
      setLoading(false);
      
    } catch (error) {
      console.error('Error voting with token burn:', error);
      
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

  // Verificar si el usuario puede votar
  const canVote = () => {
    return (
      isConnected && 
      tokenBalance >= VOTE_COST && 
      !hasUserVoted && 
      votingActive &&
      candidates.length > 0
    );
  };

  return {
    handleVote,
    canVote: canVote()
  };
};

export default VotingActions;