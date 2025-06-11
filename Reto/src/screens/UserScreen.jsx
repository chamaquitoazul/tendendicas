// src/screens/UserScreen.jsx - ACTUALIZADO: Votaciones visibles sin wallet
import React from 'react';
import { Check, AlertCircle, Wallet, Eye, Clock, Users } from 'lucide-react';

const UserScreen = ({ 
  isConnected, 
  elections, 
  votedElections, 
  vote, 
  tokenBalance,
  hasUserVoted,
  voteCost,
  canUserVote
}) => {
  // ✅ FUNCIÓN PARA MANEJAR INTENTO DE VOTO SIN WALLET
  const handleVoteAttempt = (electionId, candidateIndex) => {
    if (!isConnected) {
      alert('⚠️ Debes conectar tu wallet para poder votar.\n\nPasos:\n1. Conecta tu wallet MetaMask\n2. Asegúrate de tener tokens VTE\n3. Selecciona tu candidato preferido');
      return;
    }
    
    if (tokenBalance < voteCost) {
      alert(`❌ Necesitas al menos ${voteCost} tokens VTE para votar.\n\nActualmente tienes: ${tokenBalance} VTE\nVe a la pestaña "Tokens" para obtener más.`);
      return;
    }
    
    // Si todo está bien, proceder con el voto
    vote(electionId, candidateIndex);
  };

  // ✅ FUNCIÓN PARA FORMATEAR FECHAS
  const formatDate = (dateString) => {
    if (!dateString) return 'No definida';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Finalizada el ${date.toLocaleDateString('es-ES')}`;
    } else if (diffDays === 0) {
      return 'Finaliza hoy';
    } else if (diffDays === 1) {
      return 'Finaliza mañana';
    } else {
      return `Finaliza en ${diffDays} días (${date.toLocaleDateString('es-ES')})`;
    }
  };

  // ✅ FUNCIÓN PARA DETERMINAR EL COLOR DEL ESTADO
  const getStatusColor = (election) => {
    if (election.status === 'loading') return 'bg-blue-100 text-blue-800';
    if (election.status === 'active') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* ✅ HEADER MEJORADO CON INFORMACIÓN PARA USUARIOS SIN WALLET */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Votaciones Disponibles</h2>
          <p className="text-gray-600 mt-1">
            {isConnected 
              ? `Puedes votar en las elecciones activas usando tus ${tokenBalance} tokens VTE`
              : 'Explora las votaciones disponibles. Conecta tu wallet para participar.'
            }
          </p>
        </div>
        
        {/* ✅ INDICADORES DE ESTADO */}
        <div className="flex flex-col items-end space-y-2">
          {!isConnected && (
            <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
              <Wallet className="h-4 w-4" />
              <span className="text-sm">Conecta tu wallet para votar</span>
            </div>
          )}
          
          {isConnected && tokenBalance < voteCost && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Necesitas {voteCost} VTE para votar</span>
            </div>
          )}
          
          {isConnected && tokenBalance >= voteCost && !hasUserVoted && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
              <Check className="h-4 w-4" />
              <span className="text-sm">Listo para votar</span>
            </div>
          )}
          
          {isConnected && hasUserVoted && (
            <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
              <Check className="h-4 w-4" />
              <span className="text-sm">Ya has votado</span>
            </div>
          )}
        </div>
      </div>

      {/* ✅ LISTA DE ELECCIONES - VISIBLE SIEMPRE */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {elections.map((election) => (
          <div key={election.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
            {/* Header de la elección */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">{election.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(election)}`}>
                  {election.status === 'active' ? 'Activa' : 
                   election.status === 'loading' ? 'Cargando...' : 'Finalizada'}
                </span>
              </div>
              <p className="text-indigo-100 text-sm mb-3">{election.description}</p>
              
              {/* Información de la elección */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{election.totalVotes || 0} votos</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{election.candidates ? election.candidates.length : 0} candidatos</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-indigo-200">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">{formatDate(election.endDate)}</span>
                </div>
              </div>
            </div>
            
            {/* Contenido de la elección */}
            <div className="p-6">
              {election.candidates && election.candidates.length > 0 ? (
                <div className="space-y-3">
                  {election.candidates.map((candidate, index) => {
                    const votes = election.votes && election.votes[index] ? election.votes[index] : 0;
                    const percentage = election.totalVotes > 0 ? (votes / election.totalVotes) * 100 : 0;
                    const userVoted = votedElections.has(election.id);
                    const canVote = isConnected && !userVoted && election.status === 'active' && tokenBalance >= voteCost;
                    
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-lg">{candidate}</h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-600 font-medium">{votes} votos</span>
                              <span className="text-sm text-indigo-600 font-medium">{percentage.toFixed(1)}%</span>
                            </div>
                          </div>
                          
                          {/* Botón de voto */}
                          <div className="ml-4">
                            {userVoted ? (
                              <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                                <Check className="h-4 w-4 mr-2" />
                                <span className="text-sm font-medium">Votado</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleVoteAttempt(election.id, index)}
                                disabled={election.status !== 'active'}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  election.status !== 'active'
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : canVote
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                    : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300'
                                }`}
                              >
                                {election.status !== 'active' 
                                  ? 'Votación cerrada'
                                  : !isConnected 
                                  ? 'Conectar para votar'
                                  : tokenBalance < voteCost
                                  ? 'Necesitas VTE'
                                  : 'Votar'
                                }
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* Barra de progreso */}
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <div className="text-lg mb-2">
                    {election.status === 'loading' ? 'Cargando candidatos...' : 'No hay candidatos configurados'}
                  </div>
                  <p className="text-sm">
                    {election.status === 'loading' 
                      ? 'Conectando con la blockchain...' 
                      : 'Esta elección aún no tiene candidatos registrados'
                    }
                  </p>
                </div>
              )}
              
              {/* Footer de la elección */}
              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
                <span>Elección ID: {election.id}</span>
                <span>Total de participantes: {election.totalVotes || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* ✅ ESTADO CUANDO NO HAY ELECCIONES */}
      {elections.length === 0 && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Eye className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No hay votaciones disponibles</h3>
            <p className="text-gray-600 mb-6">
              Actualmente no hay elecciones configuradas. Las votaciones aparecerán aquí cuando sean creadas por los administradores.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                💡 <strong>Mantente atento:</strong> Esta página se actualiza automáticamente cuando hay nuevas votaciones disponibles.
              </p>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default UserScreen;