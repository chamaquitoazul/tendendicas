// src/screens/AdminScreen.jsx
import React, { useState } from 'react';
import { Plus, Eye, Lock, Trash2, AlertTriangle } from 'lucide-react';

const AdminScreen = ({ 
  isConnected, 
  elections, 
  newElection, 
  setNewElection, 
  createElection,
  candidates,
  votingActive,
  addCandidate,
  toggleVoting,
  removeCandidate: removeCandidateFromContract, // Renombrar para evitar conflicto
  resetElection // Nueva función para resetear la elección completa
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [candidateToDelete, setCandidateToDelete] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleAuth = (e) => {
    e.preventDefault();
    if (password === '1116661') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Contraseña incorrecta');
      setPassword('');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setAuthError('');
  };

  // Agregar candidato
  const addCandidateToForm = () => {
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

  // Remover candidato del formulario
  const removeCandidateFromForm = (index) => {
    if (newElection.candidates.length > 2) {
      const newCandidates = newElection.candidates.filter((_, i) => i !== index);
      setNewElection({ ...newElection, candidates: newCandidates });
    }
  };

  // Confirmar eliminación de candidato
  const confirmDeleteCandidate = (candidateName) => {
    setCandidateToDelete(candidateName);
    setShowDeleteConfirm(true);
  };

  // Ejecutar eliminación de candidato
  const executeDeleteCandidate = async () => {
    if (candidateToDelete && removeCandidateFromContract) {
      await removeCandidateFromContract(candidateToDelete);
      setShowDeleteConfirm(false);
      setCandidateToDelete('');
    }
  };

  // Cancelar eliminación
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setCandidateToDelete('');
  };

  // Confirmar reset de elección
  const confirmResetElection = () => {
    setShowResetConfirm(true);
  };

  // Ejecutar reset de elección
  const executeResetElection = async () => {
    if (resetElection) {
      await resetElection();
      setShowResetConfirm(false);
    }
  };

  // Cancelar reset
  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-gray-900">Panel de Administración</h2>
        
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Acceso Restringido</h3>
              <p className="text-gray-600 mt-2">Ingresa la contraseña de administrador</p>
            </div>
            
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña de Administrador
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ingresa la contraseña"
                  required
                />
                {authError && (
                  <p className="text-red-600 text-sm mt-1">{authError}</p>
                )}
              </div>
              
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Acceder
              </button>
            </form>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 text-center">
                Solo los administradores autorizados pueden acceder a esta sección
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Panel de Administración</h2>
        <button
          onClick={logout}
          className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
        >
          Cerrar Sesión Admin
        </button>
      </div>

      {/* Modal de confirmación para eliminar candidato */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar al candidato "{candidateToDelete}"? 
              Esta acción no se puede deshacer y se perderán todos los votos asociados.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={executeDeleteCandidate}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Eliminar
              </button>
              <button
                onClick={cancelDelete}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para resetear elección */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">⚠️ RESETEAR ELECCIÓN COMPLETA</h3>
            </div>
            <div className="mb-6">
              <p className="text-red-600 font-semibold mb-2">
                ¡ADVERTENCIA! Esta acción es IRREVERSIBLE.
              </p>
              <p className="text-gray-600 mb-2">
                Al resetear la elección se eliminará:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Todos los candidatos ({candidates.length} candidatos)</li>
                <li>Todos los votos registrados</li>
                <li>Todo el historial de la elección</li>
              </ul>
              <p className="text-red-600 text-sm mt-3 font-medium">
                Esta acción NO se puede deshacer.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={executeResetElection}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                SÍ, RESETEAR TODO
              </button>
              <button
                onClick={cancelReset}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Conecta tu wallet para acceder a las funciones de administrador</p>
        </div>
      )}
      
      {/* Gestión de Votación Actual */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Control de Votación</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Estado de la votación</h4>
              <p className="text-sm text-gray-600">
                {votingActive ? 'La votación está activa' : 'La votación está inactiva'}
              </p>
              {votingActive && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ No se pueden eliminar candidatos mientras la votación esté activa
                </p>
              )}
            </div>
            <button
              onClick={toggleVoting}
              disabled={!isConnected}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                votingActive 
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              } disabled:bg-gray-400`}
            >
              {votingActive ? 'Desactivar Votación' : 'Activar Votación'}
            </button>
          </div>
          
          {/* Botón de Reset de Elección */}
          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
            <div>
              <h4 className="font-medium text-red-900">Resetear Elección Completa</h4>
              <p className="text-sm text-red-700">
                Elimina todos los candidatos y votos. ⚠️ Acción irreversible
              </p>
            </div>
            <button
              onClick={confirmResetElection}
              disabled={!isConnected || votingActive}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              Resetear Todo
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-sm text-gray-600">Candidatos registrados</label>
              <p className="font-semibold text-lg">{candidates.length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-sm text-gray-600">Estado</label>
              <p className={`font-semibold text-lg ${votingActive ? 'text-green-600' : 'text-red-600'}`}>
                {votingActive ? 'Activa' : 'Inactiva'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Agregar Candidato Individual */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Agregar Candidato</h3>
        
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Nombre del candidato"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addCandidate(e.target.value);
                e.target.value = '';
              }
            }}
          />
          <button
            onClick={(e) => {
              const input = e.target.parentElement.querySelector('input');
              if (input.value.trim()) {
                addCandidate(input.value);
                input.value = '';
              }
            }}
            disabled={!isConnected}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Agregar
          </button>
        </div>
      </div>

      {/* Agregar Múltiples Candidatos */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Agregar Múltiples Candidatos</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título de la votación (informativo)
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
              Descripción (informativo)
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Candidatos/Opciones
              </label>
              <button
                onClick={addCandidateToForm}
                className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Agregar Candidato</span>
              </button>
            </div>
            
            <div className="space-y-2">
              {newElection.candidates.map((candidate, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={candidate}
                    onChange={(e) => updateCandidate(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={`Candidato ${index + 1}`}
                  />
                  {newElection.candidates.length > 2 && (
                    <button
                      onClick={() => removeCandidateFromForm(index)}
                      className="text-red-600 hover:text-red-800 px-2 py-2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Mínimo 2 candidatos requeridos
            </p>
          </div>
          
          <button
            onClick={createElection}
            disabled={!isConnected}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Agregar Candidatos al Contrato
          </button>
        </div>
      </div>
      
      {/* Lista de Candidatos Actuales con opción de eliminar */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Candidatos Registrados</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Eye className="h-4 w-4" />
            <span>Vista de Administrador</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {candidates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidates.map((candidate, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-2">{candidate}</div>
                      <div className="text-sm text-gray-500">
                        Candidato #{index + 1}
                      </div>
                    </div>
                    <button
                      onClick={() => confirmDeleteCandidate(candidate)}
                      disabled={votingActive || !isConnected}
                      className="ml-3 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={votingActive ? "No se puede eliminar durante votación activa" : "Eliminar candidato"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-lg mb-2">No hay candidatos registrados</div>
              <p className="text-sm">Agrega candidatos usando los formularios de arriba</p>
            </div>
          )}
        </div>

        {votingActive && candidates.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ La votación está activa. Desactívala primero para poder eliminar candidatos.
            </p>
          </div>
        )}
      </div>

      {/* Lista de Elecciones Existentes */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Votaciones en Blockchain</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Eye className="h-4 w-4" />
            <span>Vista de Administrador</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {elections.map((election) => (
            <div key={election.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
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
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    ID: {election.id}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{election.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {election.candidates.map((candidate, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded border">
                    <div className="font-medium text-gray-900">{candidate}</div>
                    <div className="text-indigo-600 font-semibold">{election.votes[index]} votos</div>
                    <div className="text-xs text-gray-500">
                      {election.totalVotes > 0 
                        ? `${((election.votes[index] / election.totalVotes) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">
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
              <div className="text-lg mb-2">No hay votaciones creadas aún</div>
              <p className="text-sm">Agrega candidatos y activa la votación para comenzar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminScreen;