
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const DashBoard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  // Fonction de déconnexion
  const handleLogout = () => {
    // TODO: Implémenter la logique de déconnexion
    console.log('Déconnexion');
    // Redirection vers la page d'accueil après déconnexion
    navigate('/');
  };

  // Données factices pour les statistiques
  const stats = [
    { name: 'Articles publiés', value: '12', change: '+2.5%', changeType: 'increase' },
    { name: 'Commentaires', value: '84', change: '+12%', changeType: 'increase' },
    { name: 'Vues', value: '2,543', change: '+8.2%', changeType: 'increase' },
    { name: 'Abonnés', value: '1,234', change: '-0.5%', changeType: 'decrease' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barre de navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600">Doualair Blog</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`${activeTab === 'dashboard' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Tableau de bord
                </button>
                <button
                  onClick={() => setActiveTab('articles')}
                  className={`${activeTab === 'articles' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Articles
                </button>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          </div>
        </header>
        
        {/* Cartes de statistiques */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {stat.value}
                    <span className={`ml-2 text-sm font-medium ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                  </dd>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Actions rapides</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Link
                  to="/new-article"
                  className="relative bg-white p-6 border border-gray-200 rounded-lg shadow-sm flex flex-col items-center text-center hover:border-blue-500 transition-colors"
                >
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <span className="mt-4 text-sm font-medium text-gray-900">Nouvel article</span>
                </Link>
                <Link
                  to="/articles"
                  className="relative bg-white p-6 border border-gray-200 rounded-lg shadow-sm flex flex-col items-center text-center hover:border-green-500 transition-colors"
                >
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <span className="mt-4 text-sm font-medium text-gray-900">Gérer les articles</span>
                </Link>
                <Link
                  to="/settings"
                  className="relative bg-white p-6 border border-gray-200 rounded-lg shadow-sm flex flex-col items-center text-center hover:border-yellow-500 transition-colors"
                >
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="mt-4 text-sm font-medium text-gray-900">Paramètres</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;