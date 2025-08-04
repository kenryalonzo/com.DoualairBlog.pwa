import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaPlane,
  FaUsers,
  FaEnvelope,
  FaRocket,
  FaGlobe,
  FaLightbulb,
} from "react-icons/fa";

const About = () => {
  const teamMembers = [
    {
      name: "Jean Dupont",
      role: "Rédacteur en chef",
      bio: "Pilote professionnel avec plus de 15 ans d'expérience dans l'industrie aéronautique.",
      icon: <FaPlane className="text-2xl" />,
    },
    {
      name: "Marie Martin",
      role: "Journaliste aéronautique",
      bio: "Spécialiste des questions techniques et de la sécurité aérienne.",
      icon: <FaRocket className="text-2xl" />,
    },
    {
      name: "Thomas Leroy",
      role: "Photographe aérien",
      bio: "Passionné par la photographie aérienne et les reportages en vol.",
      icon: <FaGlobe className="text-2xl" />,
    },
  ];

  const features = [
    {
      icon: <FaPlane className="text-3xl" />,
      title: "Actualités Aéronautiques",
      description: "Les dernières nouvelles du secteur aérien mondial",
    },
    {
      icon: <FaRocket className="text-3xl" />,
      title: "Innovations Technologiques",
      description: "Découvrez les avancées technologiques en aviation",
    },
    {
      icon: <FaUsers className="text-3xl" />,
      title: "Communauté Passionnée",
      description: "Rejoignez des passionnés d'aviation du monde entier",
    },
    {
      icon: <FaLightbulb className="text-3xl" />,
      title: "Analyses Expertes",
      description: "Des analyses approfondies par des experts du secteur",
    },
  ];

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
            <motion.div
              className="mb-8"
              whileHover={{
                rotate: [0, 10, -10, 5, 0],
                transition: { duration: 0.8 },
              }}
            >
              <img
                src="/dlair.svg"
                alt="Doualair Logo"
                className="w-20 h-20 mx-auto mb-4"
              />
            </motion.div>
            <h1 className="text-5xl font-bold mb-6">
              À propos de{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Doualair Blog
              </span>
            </h1>
            <p className="text-lg opacity-70 mb-8">
              Votre source d'informations sur l'aéronautique, les innovations
              technologiques et les actualités du secteur aérien.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Notre Histoire */}
        <motion.div
          className="card bg-base-100 shadow-xl mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">
              <FaPlane className="text-primary mr-2" />
              Notre Histoire
            </h2>
            <p className="opacity-70">
              Doualair Blog a été fondé en 2023 avec une passion commune pour
              l'aéronautique et le partage de connaissances. Notre équipe
              d'experts et d'enthousiastes s'engage à fournir des articles de
              qualité sur l'actualité aéronautique, les technologies émergentes
              et les innovations dans le domaine de l'aviation.
            </p>
          </div>
        </motion.div>

        {/* Notre Mission */}
        <motion.div
          className="card bg-base-100 shadow-xl mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">
              <FaRocket className="text-secondary mr-2" />
              Notre Mission
            </h2>
            <p className="opacity-70">
              Notre mission est de créer une communauté dynamique autour de
              l'aéronautique en partageant des informations précises, des
              analyses approfondies et des récits captivants. Nous croyons en la
              puissance de l'information pour inspirer et éduquer les passionnés
              d'aviation du monde entier.
            </p>
          </div>
        </motion.div>

        {/* Fonctionnalités */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-center mb-8">
            Ce que nous offrons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="card bg-base-100 shadow-xl"
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="card-body text-center">
                  <div className="text-primary mb-4">{feature.icon}</div>
                  <h3 className="card-title justify-center">{feature.title}</h3>
                  <p className="opacity-70">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Notre Équipe */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-center mb-8">Notre Équipe</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                className="card bg-base-100 shadow-xl"
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="card-body text-center">
                  <div className="avatar placeholder mb-4">
                    <div className="bg-primary text-primary-content rounded-full w-16">
                      {member.icon}
                    </div>
                  </div>
                  <h3 className="card-title justify-center">{member.name}</h3>
                  <p className="text-primary font-medium">{member.role}</p>
                  <p className="opacity-70">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Rejoignez Notre Communauté */}
        <motion.div
          className="card bg-gradient-to-r from-primary/10 to-secondary/10 shadow-xl mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          <div className="card-body text-center">
            <h2 className="card-title text-2xl justify-center mb-4">
              <FaUsers className="text-primary mr-2" />
              Rejoignez Notre Communauté
            </h2>
            <p className="opacity-70 mb-6">
              Que vous soyez un passionné d'aviation, un professionnel du
              secteur ou simplement curieux, nous vous invitons à nous rejoindre
              et à participer à notre communauté en pleine croissance.
            </p>
            <div className="card-actions justify-center">
              <Link to="/sign-up">
                <motion.button
                  className="btn btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Créer un compte
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Contactez-nous */}
        <motion.div
          className="card bg-base-100 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <div className="card-body text-center">
            <h2 className="card-title text-2xl justify-center mb-4">
              <FaEnvelope className="text-primary mr-2" />
              Contactez-nous
            </h2>
            <p className="opacity-70 mb-4">
              Vous avez des questions ou des suggestions ? N'hésitez pas à nous
              contacter à l'adresse suivante :
            </p>
            <p className="text-primary font-medium">
              contact@doualair-blog.com
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default About;
