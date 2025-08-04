import { motion } from "framer-motion";
import {
  FaPlane,
  FaRocket,
  FaLeaf,
  FaHistory,
  FaGraduationCap,
  FaCog,
  FaNewspaper,
  FaEnvelope,
} from "react-icons/fa";

const Projects = () => {
  const projects = [
    {
      id: 1,
      title: "Analyse des tendances aéronautiques 2024",
      description:
        "Une étude approfondie des innovations technologiques et des tendances émergentes dans l'industrie aéronautique.",
      category: "Recherche",
      icon: <FaPlane className="text-2xl" />,
      date: "2024-01-15",
    },
    {
      id: 2,
      title: "Guide de sécurité aérienne",
      description:
        "Un guide complet sur les meilleures pratiques de sécurité dans l'aviation civile et commerciale.",
      category: "Sécurité",
      icon: <FaRocket className="text-2xl" />,
      date: "2024-01-10",
    },
    {
      id: 3,
      title: "Technologies vertes en aviation",
      description:
        "Exploration des solutions durables et des technologies respectueuses de l'environnement dans l'aviation.",
      category: "Développement durable",
      icon: <FaLeaf className="text-2xl" />,
      date: "2024-01-05",
    },
    {
      id: 4,
      title: "Histoire de l'aviation militaire",
      description:
        "Un voyage à travers l'histoire fascinante de l'aviation militaire et ses évolutions technologiques.",
      category: "Histoire",
      icon: <FaHistory className="text-2xl" />,
      date: "2023-12-28",
    },
    {
      id: 5,
      title: "Simulateurs de vol modernes",
      description:
        "Analyse des simulateurs de vol les plus avancés et leur rôle dans la formation des pilotes.",
      category: "Formation",
      icon: <FaGraduationCap className="text-2xl" />,
      date: "2023-12-20",
    },
    {
      id: 6,
      title: "Drones et aviation civile",
      description:
        "Impact des drones sur l'aviation civile et les nouveaux défis réglementaires.",
      category: "Technologie",
      icon: <FaCog className="text-2xl" />,
      date: "2023-12-15",
    },
  ];

  const categories = [
    { name: "Tous", icon: <FaNewspaper /> },
    { name: "Recherche", icon: <FaPlane /> },
    { name: "Sécurité", icon: <FaRocket /> },
    { name: "Développement durable", icon: <FaLeaf /> },
    { name: "Histoire", icon: <FaHistory /> },
    { name: "Formation", icon: <FaGraduationCap /> },
    { name: "Technologie", icon: <FaCog /> },
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
    <div className="min-h-screen bg-base-200">
      {/* Hero Section */}
      <motion.div
        className="hero bg-base-100 py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-6">
              Nos{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Projets et Articles
              </span>
            </h1>
            <p className="text-lg opacity-70 mb-8">
              Découvrez nos derniers articles et projets sur l'aéronautique
            </p>
          </div>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Grille des projets */}
        <motion.div
          className="mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                variants={itemVariants}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="card-body">
                  <div className="flex items-center justify-between mb-4">
                    <div className="badge badge-primary badge-outline">
                      {project.category}
                    </div>
                    <span className="text-sm opacity-60">
                      {new Date(project.date).toLocaleDateString("fr-FR")}
                    </span>
                  </div>

                  <div className="text-primary mb-4">{project.icon}</div>

                  <h3 className="card-title text-lg mb-3">{project.title}</h3>
                  <p className="opacity-70 text-sm leading-relaxed mb-4">
                    {project.description}
                  </p>

                  <div className="card-actions justify-end">
                    <motion.button
                      className="btn btn-primary btn-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Lire la suite →
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Section de filtres */}
        <motion.div
          className="card bg-base-100 shadow-xl mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="card-body">
            <h2 className="card-title text-xl mb-6">
              <FaNewspaper className="text-primary mr-2" />
              Filtrer par catégorie
            </h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <motion.button
                  key={category.name}
                  className="btn btn-outline btn-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Newsletter */}
        <motion.div
          className="card bg-gradient-to-r from-primary/10 to-secondary/10 shadow-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <div className="card-body text-center">
            <h2 className="card-title text-2xl justify-center mb-4">
              <FaEnvelope className="text-primary mr-2" />
              Restez informé
            </h2>
            <p className="opacity-70 mb-6">
              Recevez nos derniers articles et actualités directement dans votre
              boîte mail.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="input input-bordered flex-1"
              />
              <motion.button
                className="btn btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                S'abonner
              </motion.button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Projects;
