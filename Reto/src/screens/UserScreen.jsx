// src/screens/UserScreen.jsx
import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

const UserScreen = ({ 
  isConnected, 
  elections, 
  votedElections, 
  vote, 
  tokenBalance 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Votaciones Activas</h2>
        {!isConnected && (
          <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Conecta tu wallet para votar</span>
          </div>
        )}
        {isConnected && tokenBalance === 0 && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Necesitas tokens VTE para votar</span>
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
                        <span className="text-sm ml-1">Votado</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => vote(election.id, index)}
                        disabled={!isConnected || tokenBalance === 0 || election.status !== 'active'}
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
        
        {elections.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-500">
            <div className="text-lg mb-2">No hay votaciones disponibles</div>
            <p className="text-sm">Las votaciones aparecerán aquí cuando sean creadas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserScreen;