import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const DashBoard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  // Fonction de déconnexion
  const handleLogout = () => {
    // TODO: Implémenter la logique de déconnexion
    console.log("Déconnexion");
    // Redirection vers la page d'accueil après déconnexion
    navigate("/");
  };

  // Données factices pour les statistiques
  const stats = [
    {
      name: "Articles publiés",
      value: "12",
      change: "+2.5%",
      changeType: "increase",
    },
    {
      name: "Commentaires",
      value: "84",
      change: "+12%",
      changeType: "increase",
    },
    { name: "Vues", value: "2,543", change: "+8.2%", changeType: "increase" },
    {
      name: "Abonnés",
      value: "1,234",
      change: "-0.5%",
      changeType: "decrease",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Barre de navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  Doualair Blog
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`${
                    activeTab === "dashboard"
                      ? "border-blue-500 text-gray-900 dark:text-white"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                >
                  Tableau de bord
                </button>
                <button
                  onClick={() => setActiveTab("articles")}
                  className={`${
                    activeTab === "articles"
                      ? "border-blue-500 text-gray-900 dark:text-white"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                >
                  Articles
                </button>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 transition-colors"
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
            <motion.h1
              className="text-3xl font-bold text-gray-900 dark:text-white"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Tableau de bord
            </motion.h1>
          </div>
        </header>

        {/* Cartes de statistiques */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <motion.div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.name}
                className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    {stat.name}
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                    <span
                      className={`ml-2 text-sm font-medium ${
                        stat.changeType === "increase"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {stat.change}
                    </span>
                  </dd>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Actions rapides */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <motion.div
            className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Actions rapides
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/new-article"
                    className="relative bg-white dark:bg-gray-700 p-6 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm flex flex-col items-center text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                      <svg
                        className="h-6 w-6 text-blue-600 dark:text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <span className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
                      Nouvel article
                    </span>
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/articles"
                    className="relative bg-white dark:bg-gray-700 p-6 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm flex flex-col items-center text-center hover:border-green-500 dark:hover:border-green-400 transition-colors"
                  >
                    <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                      <svg
                        className="h-6 w-6 text-green-600 dark:text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <span className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
                      Gérer les articles
                    </span>
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/settings"
                    className="relative bg-white dark:bg-gray-700 p-6 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm flex flex-col items-center text-center hover:border-yellow-500 dark:hover:border-yellow-400 transition-colors"
                  >
                    <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
                      <svg
                        className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <span className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
                      Paramètres
                    </span>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Section d'activité récente */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <motion.div
            className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Activité récente
              </h3>
              <div className="space-y-4">
                {[
                  {
                    action: "Nouvel article publié",
                    title: "Technologies vertes en aviation",
                    time: "Il y a 2 heures",
                  },
                  {
                    action: "Commentaire reçu",
                    title: "Guide de sécurité aérienne",
                    time: "Il y a 4 heures",
                  },
                  {
                    action: "Nouvel abonné",
                    title: "Marie Dupont",
                    time: "Il y a 6 heures",
                  },
                  {
                    action: "Article modifié",
                    title: "Histoire de l'aviation militaire",
                    time: "Il y a 1 jour",
                  },
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activity.title}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
