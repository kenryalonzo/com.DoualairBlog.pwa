import { motion } from "framer-motion";

const Projects = () => {
  const projects = [
    {
      id: 1,
      title: "Analyse des tendances aéronautiques 2024",
      description:
        "Une étude approfondie des innovations technologiques et des tendances émergentes dans l'industrie aéronautique.",
      category: "Recherche",
      image: "/logo.png",
      date: "2024-01-15",
    },
    {
      id: 2,
      title: "Guide de sécurité aérienne",
      description:
        "Un guide complet sur les meilleures pratiques de sécurité dans l'aviation civile et commerciale.",
      category: "Sécurité",
      image: "/logo.png",
      date: "2024-01-10",
    },
    {
      id: 3,
      title: "Technologies vertes en aviation",
      description:
        "Exploration des solutions durables et des technologies respectueuses de l'environnement dans l'aviation.",
      category: "Développement durable",
      image: "/logo.png",
      date: "2024-01-05",
    },
    {
      id: 4,
      title: "Histoire de l'aviation militaire",
      description:
        "Un voyage à travers l'histoire fascinante de l'aviation militaire et ses évolutions technologiques.",
      category: "Histoire",
      image: "/logo.png",
      date: "2023-12-28",
    },
    {
      id: 5,
      title: "Simulateurs de vol modernes",
      description:
        "Analyse des simulateurs de vol les plus avancés et leur rôle dans la formation des pilotes.",
      category: "Formation",
      image: "/logo.png",
      date: "2023-12-20",
    },
    {
      id: 6,
      title: "Drones et aviation civile",
      description:
        "Impact des drones sur l'aviation civile et les nouveaux défis réglementaires.",
      category: "Technologie",
      image: "/logo.png",
      date: "2023-12-15",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* En-tête */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <motion.h1
            className="text-3xl font-bold text-gray-900 dark:text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Nos Projets et Articles
          </motion.h1>
          <motion.p
            className="mt-2 text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Découvrez nos derniers articles et projets sur l'aéronautique
          </motion.p>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <motion.div
          className="px-4 py-6 sm:px-0"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="h-48 bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="h-16 w-16 object-contain"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {project.category}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(project.date).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {project.description}
                  </p>
                  <div className="mt-4">
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm transition-colors">
                      Lire la suite →
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Section de filtres */}
          <motion.div
            className="mt-12 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Filtrer par catégorie
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                "Tous",
                "Recherche",
                "Sécurité",
                "Développement durable",
                "Histoire",
                "Formation",
                "Technologie",
              ].map((category) => (
                <button
                  key={category}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-blue-900 dark:hover:text-blue-200 transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            className="mt-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg p-8 text-center text-white"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <h2 className="text-2xl font-bold mb-4">Restez informé</h2>
            <p className="mb-6 text-blue-100">
              Recevez nos derniers articles et actualités directement dans votre
              boîte mail.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="px-6 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors">
                S'abonner
              </button>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Projects;
