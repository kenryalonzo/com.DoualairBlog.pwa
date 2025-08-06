import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaArrowRight, FaNewspaper, FaPlane, FaRocket } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useToastContext } from "../contexts/ToastContext";
import { useAuth } from "../hooks/useAuth";
import { articleService } from "../services/articleService";

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToastContext();

  useEffect(() => {
    setIsVisible(true);
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const response = await articleService.getAll({
        page: 1,
        limit: 6,
        status: "published",
        sort: "createdAt",
        order: "desc",
      });
      setArticles(response.articles || []);
    } catch (error) {
      console.error("Erreur lors du chargement des articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 relative overflow-hidden">
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-24 h-24 bg-secondary/10 rounded-full blur-xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-40 left-1/4 w-20 h-20 bg-accent/10 rounded-full blur-xl"
          animate={{
            x: [0, 60, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
          >
            {/* Logo section */}
            <motion.div
              className="mb-8 md:mb-12"
              variants={itemVariants}
              whileHover={{
                rotate: [0, 10, -10, 5, 0],
                transition: { duration: 0.8 },
              }}
            >
              <motion.div
                className="relative inline-block"
                variants={floatingVariants}
                animate="animate"
              >
                <div className="relative">
                  <img
                    src="/dlair.svg"
                    alt="Doualair Logo"
                    className="w-20 h-20 md:w-28 md:h-28 mx-auto drop-shadow-2xl"
                  />
                  <motion.div
                    className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8"
              variants={itemVariants}
            >
              <span className="block text-base-content">Bienvenue sur </span>
              <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Doualair Blog
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-lg md:text-xl lg:text-2xl opacity-80 max-w-3xl mx-auto mb-8 md:mb-12 leading-relaxed"
              variants={itemVariants}
            >
              Découvrez nos articles et actualités sur l'aéronautique et bien
              plus encore. Votre source d'informations sur les innovations
              technologiques du secteur aérien.
            </motion.p>

            {/* CTA Buttons - Masqués si l'utilisateur est connecté */}
            {!user && (
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12 md:mb-16"
                variants={itemVariants}
              >
                <Link to="/sign-in">
                  <motion.button
                    className="btn btn-primary btn-lg w-full sm:w-auto group"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaPlane className="mr-2 group-hover:rotate-12 transition-transform" />
                    Se connecter
                    <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
                <Link to="/sign-up">
                  <motion.button
                    className="btn btn-outline btn-lg w-full sm:w-auto group"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaRocket className="mr-2 group-hover:rotate-12 transition-transform" />
                    S'inscrire
                    <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
              </motion.div>
            )}

            {/* Features Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
              variants={itemVariants}
            >
              {[
                {
                  icon: <FaPlane className="text-4xl md:text-5xl" />,
                  title: "Aéronautique",
                  description: "Actualités et innovations du secteur aérien",
                  color: "text-primary",
                  bgColor: "bg-primary/10",
                },
                {
                  icon: <FaRocket className="text-4xl md:text-5xl" />,
                  title: "Technologies",
                  description: "Les dernières avancées technologiques",
                  color: "text-secondary",
                  bgColor: "bg-secondary/10",
                },
                {
                  icon: <FaNewspaper className="text-4xl md:text-5xl" />,
                  title: "Actualités",
                  description: "Informations et analyses du secteur",
                  color: "text-accent",
                  bgColor: "bg-accent/10",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="card bg-base-100/80 backdrop-blur-sm shadow-xl border border-base-300/50 hover:shadow-2xl transition-all duration-300"
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 300 },
                  }}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      delay: 0.8 + index * 0.1,
                      duration: 0.6,
                    },
                  }}
                >
                  <div className="card-body text-center p-6 md:p-8">
                    <motion.div
                      className={`inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full ${feature.bgColor} ${feature.color} mb-4`}
                      whileHover={{
                        rotate: 360,
                        scale: 1.1,
                        transition: { duration: 0.6 },
                      }}
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="card-title justify-center text-xl md:text-2xl font-bold mb-3">
                      {feature.title}
                    </h3>
                    <p className="opacity-80 text-sm md:text-base leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.6 }}
            >
              <motion.div
                className="w-6 h-10 border-2 border-base-content/30 rounded-full flex justify-center"
                animate={{
                  y: [0, 10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <motion.div
                  className="w-1 h-3 bg-base-content/60 rounded-full mt-2"
                  animate={{
                    y: [0, 12, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Section Articles Récents */}
      <div className="py-20 bg-base-200">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Articles Récents
            </h2>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              Découvrez nos dernières publications sur l'aéronautique et les
              innovations technologiques
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article, index) => (
                <motion.div
                  key={article._id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  {article.featuredImage && (
                    <figure>
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-full h-48 object-cover"
                      />
                    </figure>
                  )}
                  <div className="card-body">
                    <h3 className="card-title text-lg">{article.title}</h3>
                    <p className="text-base-content/70 line-clamp-3">
                      {article.excerpt ||
                        article.content.substring(0, 150) + "..."}
                    </p>
                    <div className="card-actions justify-between items-center mt-4">
                      <span className="text-sm text-base-content/60">
                        {new Date(article.createdAt).toLocaleDateString(
                          "fr-FR"
                        )}
                      </span>
                      <Link
                        to={`/article/${article.slug || article._id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Lire plus
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaNewspaper className="text-6xl text-base-content/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Aucun article publié
              </h3>
              <p className="text-base-content/60">
                Les articles publiés apparaîtront ici automatiquement.
              </p>
            </div>
          )}

          {articles.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Link to="/articles" className="btn btn-outline btn-lg">
                Voir tous les articles
                <FaArrowRight className="ml-2" />
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
