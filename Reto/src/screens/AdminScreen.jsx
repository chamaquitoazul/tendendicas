// src/screens/AdminScreen.jsx - ACTUALIZADO CON CAMPO DE FECHA
import React, { useState } from 'react';
import { Plus, Eye, Lock, Trash2, AlertTriangle, Calendar } from 'lucide-react';

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
  removeCandidate: removeCandidateFromContract,
  electionMetadata // ✅ NUEVO: Metadatos de la elección actual
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [candidateToDelete, setCandidateToDelete] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  // ✅ FORMATEAR FECHA PARA MOSTRAR
  const formatDate = (dateString) => {
    if (!dateString) return 'No definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      
      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Conecta tu wallet para acceder a las funciones de administrador</p>
        </div>
      )}

      {/* ✅ INFORMACIÓN DE LA ELECCIÓN ACTUAL */}
      {electionMetadata && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Elección Actual Configurada
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <label className="text-sm text-blue-600 font-medium">Título</label>
              <p className="text-gray-900 font-semibold">{electionMetadata.title}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <label className="text-sm text-blue-600 font-medium">Descripción</label>
              <p className="text-gray-900">{electionMetadata.description}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <label className="text-sm text-blue-600 font-medium">Fecha de Finalización</label>
              <p className="text-gray-900 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(electionMetadata.endDate)}
              </p>
            </div>
          </div>
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

      {/* ✅ CREAR NUEVA ELECCIÓN CON FECHA */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Configurar Nueva Elección</h3>
        
        <div className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título de la elección *
              </label>
              <input
                type="text"
                value={newElection.title}
                onChange={(e) => setNewElection({ ...newElection, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej: Elección Municipal 2024"
                required
              />
            </div>
            
            {/* ✅ CAMPO DE FECHA AGREGADO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de finalización *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={newElection.endDate}
                  onChange={(e) => setNewElection({ ...newElection, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-10"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                <Calendar className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Fecha cuando terminará la votación
              </p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción de la elección *
            </label>
            <textarea
              value={newElection.description}
              onChange={(e) => setNewElection({ ...newElection, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows="3"
              placeholder="Descripción detallada de la votación y sus objetivos..."
              required
            />
          </div>
          
          {/* Candidatos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Candidatos/Opciones de votación *
              </label>
              <button
                onClick={addCandidateToForm}
                className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Agregar Candidato</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {newElection.candidates.map((candidate, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-indigo-600">{index + 1}</span>
                  </div>
                  <input
                    type="text"
                    value={candidate}
                    onChange={(e) => updateCandidate(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={`Nombre del candidato ${index + 1}`}
                    required
                  />
                  {newElection.candidates.length > 2 && (
                    <button
                      onClick={() => removeCandidateFromForm(index)}
                      className="text-red-600 hover:text-red-800 p-1 rounded-lg hover:bg-red-50 transition-colors"
                      title="Eliminar candidato"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                Mínimo 2 candidatos requeridos. 
              </p>
            </div>
          </div>
          
          {/* Botón de crear */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={createElection}
              disabled={!isConnected || !newElection.title || !newElection.description || newElection.candidates.filter(c => c.trim()).length < 2}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Crear Elección y Agregar Candidatos</span>
            </button>
            
            {(!newElection.title || !newElection.description || newElection.candidates.filter(c => c.trim()).length < 2) && (
              <p className="text-xs text-gray-500 text-center mt-2">
                Complete todos los campos obligatorios y agregue al menos 2 candidatos
              </p>
            )}
          </div>
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
              <p className="text-sm">Configura una nueva elección usando el formulario de arriba</p>
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
          <h3 className="text-xl font-semibold text-gray-900">Estado de la Votación</h3>
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
                      : election.status === 'loading'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {election.status === 'active' ? 'Activa' : 
                     election.status === 'loading' ? 'Cargando...' : 'Finalizada'}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    ID: {election.id}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{election.description}</p>
              
              {election.candidates && election.candidates.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  {election.candidates.map((candidate, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded border">
                      <div className="font-medium text-gray-900">{candidate}</div>
                      <div className="text-indigo-600 font-semibold">
                        {election.votes && election.votes[index] ? election.votes[index] : 0} votos
                      </div>
                      <div className="text-xs text-gray-500">
                        {election.totalVotes > 0 
                          ? `${(((election.votes && election.votes[index] ? election.votes[index] : 0) / election.totalVotes) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 bg-gray-50 rounded">
                  <p className="text-sm">No hay candidatos configurados</p>
                </div>
              )}
              
              <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">
                  Total: {election.totalVotes || 0} votos
                </span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Finaliza: {formatDate(election.endDate)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {elections.length === 0 && isConnected && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-lg mb-2">No hay votaciones creadas aún</div>
              <p className="text-sm">Configura una nueva elección usando el formulario de arriba</p>
            </div>
          )}
          
          {!isConnected && (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <div className="text-lg mb-2">Conecta tu wallet</div>
              <p className="text-sm">Necesitas conectar tu wallet para ver el estado completo de las votaciones</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminScreen;