import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import {
  FiEye,
  FiEyeOff,
  FiUser,
  FiArrowLeft,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface FormData {
  username: string;
  email: string;
  password: string;
}

interface ValidationState {
  username: boolean;
  email: boolean;
  password: boolean;
}

const SignUp = () => {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const particlesRef = useRef<HTMLDivElement>(null);
  const [isValid, setIsValid] = useState<ValidationState>({
    username: false,
    email: false,
    password: false,
  });
  const controls = useAnimation();

  // Validation en temps réel
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    setIsValid({
      username: formData.username.trim().length >= 3,
      email: emailRegex.test(formData.email.trim()),
      password: passwordRegex.test(formData.password.trim()),
    });
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Prevent leading whitespace
    if (value.startsWith(" ")) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid.username || !isValid.email || !isValid.password) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Compte créé avec succès !", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setStep(1);
      } else {
        toast.error(data.message || "Une erreur est survenue", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch {
      toast.error("Erreur lors de la création du compte", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Particle effect (unchanged)
  useEffect(() => {
    const currentParticles = particlesRef.current;
    if (!currentParticles) return;

    const particles = currentParticles;
    particles.innerHTML = "";

    const particleCount = 30;
    const colors = ["#60a5fa", "#38bdf8", "#22d3ee", "#818cf8", "#a78bfa"];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "absolute rounded-full pointer-events-none";

      const size = Math.random() * 20 + 5;
      const color = colors[Math.floor(Math.random() * colors.length)];

      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = color;
      particle.style.opacity = `${Math.random() * 0.4 + 0.1}`;

      const startX = Math.random() * window.innerWidth;
      const startY = Math.random() * window.innerHeight;

      particle.style.left = `${startX}px`;
      particle.style.top = `${startY}px`;

      const duration = Math.random() * 15 + 10;
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 200 + 100;

      particle.animate(
        [
          {
            transform: `translate(0, 0)`,
            opacity: particle.style.opacity,
          },
          {
            transform: `translate(${Math.cos(angle) * distance}px, ${
              Math.sin(angle) * distance
            }px)`,
            opacity: 0,
          },
        ],
        {
          duration: duration * 1000,
          easing: "ease-out",
          iterations: Infinity,
        }
      );

      particles.appendChild(particle);
    }

    return () => {
      if (particles) {
        particles.innerHTML = "";
      }
    };
  }, []);

  // Floating bubbles (unchanged)
  const floatingBubbles = Array(8)
    .fill(0)
    .map((_, i) => {
      const size = Math.random() * 120 + 30;
      const color = `rgba(96, 165, 250, ${Math.random() * 0.2 + 0.05})`;
      const delay = Math.random() * 5;
      const duration = Math.random() * 10 + 15;
      const x = Math.random() * 100;

      return (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: color,
            left: `${x}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, -200, -300],
            opacity: [0.1, 0.3, 0.2, 0],
            scale: [1, 1.2, 1.5, 2],
          }}
          transition={{
            duration,
            delay,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      );
    });

  // Animation au chargement
  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    });
  }, [controls]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-gray-900 dark:to-blue-900 overflow-hidden relative p-4">
      {/* Arrière-plan animé */}
      <div
        ref={particlesRef}
        className="absolute inset-0 pointer-events-none"
      />
      {floatingBubbles}

      {/* Conteneur principal */}
      <motion.div
        className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg rounded-xl shadow-2xl w-full max-w-4xl z-10 overflow-hidden border border-white/20 flex"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        }}
      >
        {/* Partie gauche - Formulaire */}
        <div className="w-1/2 p-8">
          <AnimatePresence mode="wait">
            {step === 0 ? (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Champ Username */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full pl-4 pr-10 py-3 rounded-lg border-2 ${
                      formData.username
                        ? isValid.username
                          ? "border-emerald-400"
                          : "border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                    } bg-white/20 dark:bg-gray-700/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm text-white placeholder:text-gray-300`}
                    placeholder="Nom d'utilisateur"
                  />
                  {formData.username && (
                    <motion.div
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      {isValid.username ? (
                        <FiCheck className="text-emerald-500" />
                      ) : (
                        <FiX className="text-red-500" />
                      )}
                    </motion.div>
                  )}
                  {formData.username && !isValid.username && (
                    <motion.p
                      className="mt-1 text-xs text-red-400"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      Le nom d'utilisateur doit contenir au moins 3 caractères
                    </motion.p>
                  )}
                </motion.div>

                {/* Champ Email */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-4 pr-10 py-3 rounded-lg border-2 ${
                      formData.email
                        ? isValid.email
                          ? "border-emerald-400"
                          : "border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                    } bg-white/20 dark:bg-gray-700/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm text-white placeholder:text-gray-300`}
                    placeholder="Adresse email"
                  />
                  {formData.email && (
                    <motion.div
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      {isValid.email ? (
                        <FiCheck className="text-emerald-500" />
                      ) : (
                        <FiX className="text-red-500" />
                      )}
                    </motion.div>
                  )}
                  {formData.email && !isValid.email && (
                    <motion.p
                      className="mt-1 text-xs text-red-400"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      Veuillez entrer une adresse email valide
                    </motion.p>
                  )}
                </motion.div>

                {/* Champ Password */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-4 pr-12 py-3 rounded-lg border-2 ${
                      formData.password
                        ? isValid.password
                          ? "border-emerald-400"
                          : "border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                    } bg-white/20 dark:bg-gray-700/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm text-white placeholder:text-gray-300`}
                    placeholder="Mot de passe"
                  />
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    {formData.password && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={
                          isValid.password ? "text-emerald-500" : "text-red-500"
                        }
                      >
                        {isValid.password ? <FiCheck /> : <FiX />}
                      </motion.div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-300 hover:text-blue-400 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-5 h-5" />
                    ) : (
                      <FiEye className="w-5 h-5" />
                    )}
                  </button>
                  {formData.password && !isValid.password && (
                    <motion.p
                      className="mt-1 text-xs text-red-400"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      Le mot de passe doit contenir au moins 8 caractères, dont
                      une lettre et un chiffre
                    </motion.p>
                  )}
                  {formData.password && isValid.password && (
                    <motion.div
                      className="mt-2"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="w-full bg-gray-200/20 rounded-full h-1.5">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                      <p className="text-xs text-emerald-400 mt-1">
                        Mot de passe sécurisé
                      </p>
                    </motion.div>
                  )}
                </motion.div>

                {/* Bouton d'inscription */}
                <motion.button
                  type="submit"
                  className={`w-full py-4 px-6 rounded-lg text-white font-bold shadow-lg transform transition-all duration-300 ${
                    isSubmitting ||
                    !(isValid.username && isValid.email && isValid.password)
                      ? "bg-blue-400/50 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 hover:shadow-xl"
                  }`}
                  disabled={
                    isSubmitting ||
                    !(isValid.username && isValid.email && isValid.password)
                  }
                  whileHover={
                    !isSubmitting &&
                    isValid.username &&
                    isValid.email &&
                    isValid.password
                      ? {
                          scale: 1.02,
                          boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)",
                        }
                      : {}
                  }
                  whileTap={
                    !isSubmitting &&
                    isValid.username &&
                    isValid.email &&
                    isValid.password
                      ? {
                          scale: 0.98,
                        }
                      : {}
                  }
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    opacity:
                      isValid.username && isValid.email && isValid.password
                        ? 1
                        : 0.7,
                  }}
                  transition={{ delay: 0.6 }}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                      <span className="ml-2">Création du compte...</span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center">
                      <span>Créer mon compte</span>
                      <motion.span
                        className="ml-2"
                        animate={
                          isValid.username && isValid.email && isValid.password
                            ? {
                                x: [0, 5, 0],
                                transition: { repeat: Infinity, duration: 1.5 },
                              }
                            : {}
                        }
                      >
                        →
                      </motion.span>
                    </span>
                  )}
                </motion.button>

                {/* Séparateur */}
                <motion.div
                  className="flex items-center my-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex-grow border-t border-gray-300/30"></div>
                  <span className="mx-4 text-gray-300 text-sm">
                    Ou continuez avec
                  </span>
                  <div className="flex-grow border-t border-gray-300/30"></div>
                </motion.div>

                {/* Bouton Google */}
                <motion.button
                  type="button"
                  className="w-full flex items-center justify-center py-3.5 px-6 rounded-lg border-2 border-gray-200/20 bg-white/10 text-gray-300 font-medium hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{
                    y: -2,
                    boxShadow: "0 4px 20px -5px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <FcGoogle className="w-5 h-5 mr-3" />
                  <span>Continuer avec Google</span>
                </motion.button>

                {/* Lien de connexion */}
                <motion.div
                  className="mt-6 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <p className="text-gray-300">
                    Vous avez déjà un compte ?{" "}
                    <a
                      href="/sign-in"
                      className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                    >
                      Connectez-vous
                    </a>
                  </p>
                </motion.div>
              </motion.form>
            ) : (
              <motion.div
                key="success-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                    delay: 0.2,
                  }}
                >
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                      <FiUser className="text-white text-2xl" />
                    </div>
                  </div>
                </motion.div>

                <motion.h2
                  className="text-2xl font-bold mb-4 text-white"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Bienvenue, {formData.username}!
                </motion.h2>

                <motion.p
                  className="text-gray-300 mb-8"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Votre compte a été créé avec succès. Un email de confirmation
                  a été envoyé à {formData.email}.
                </motion.p>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <button
                    onClick={() => {
                      setStep(0);
                      setFormData({ username: "", email: "", password: "" });
                    }}
                    className="flex items-center justify-center mx-auto text-cyan-400 font-medium hover:text-cyan-300 transition-colors"
                  >
                    <FiArrowLeft className="mr-2" />
                    Retour à l'inscription
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Partie droite - Favicon et texte */}
        <motion.div
          className="w-1/2 bg-gradient-to-b from-blue-600/30 to-cyan-500/30 p-8 flex flex-col items-center justify-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <motion.div
            className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6"
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <FiUser className="text-3xl text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Bienvenue sur Doualair
          </h2>
          <p className="text-gray-200 text-center">
            Rejoignez notre communauté pour découvrir une expérience unique et
            connectez-vous avec des passionnés du monde entier.
          </p>
        </motion.div>
      </motion.div>

      {/* Toast Container */}
      <ToastContainer />

      {/* Éléments décoratifs flottants (unchanged) */}
      <motion.div
        className="absolute top-1/4 -left-20 w-48 h-48 bg-blue-400 rounded-full opacity-10 dark:opacity-20"
        animate={{
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-1/4 -right-20 w-64 h-64 bg-cyan-300 rounded-full opacity-10 dark:opacity-20"
        animate={{
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </div>
  );
};

export default SignUp;
