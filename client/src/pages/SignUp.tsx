import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  FiCheck,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiUser,
  FiX,
} from "react-icons/fi";
import OAuth from "../components/OAuth";
import { useToastContext } from "../contexts/ToastContext";

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
  const { toast } = useToastContext();
  const [isValid, setIsValid] = useState<ValidationState>({
    username: false,
    email: false,
    password: false,
  });
  const particlesRef = useRef<HTMLDivElement>(null);

  // Fonction pour calculer la force du mot de passe
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) {
      return {
        level: 0,
        color: "bg-base-300",
        label: "",
        textColor: "text-base-content",
      };
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) {
      return {
        level: 1,
        color: "bg-error",
        label: "Faible",
        textColor: "text-error",
      };
    } else if (score <= 3) {
      return {
        level: 2,
        color: "bg-warning",
        label: "Moyen",
        textColor: "text-warning",
      };
    } else if (score <= 4) {
      return {
        level: 3,
        color: "bg-info",
        label: "Bon",
        textColor: "text-info",
      };
    } else {
      return {
        level: 4,
        color: "bg-success",
        label: "Fort",
        textColor: "text-success",
      };
    }
  };

  // Validation en temps réel
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Regex plus simple pour le mot de passe : au moins 8 caractères avec lettres et chiffres
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

    const usernameValid = formData.username.trim().length >= 3;
    const emailValid = emailRegex.test(formData.email.trim());
    const passwordValid = passwordRegex.test(formData.password.trim());

    setIsValid({
      username: usernameValid,
      email: emailValid,
      password: passwordValid,
    });

    // Debug: afficher l'état de validation
    console.log("Validation state:", {
      username: usernameValid,
      email: emailValid,
      password: passwordValid,
      allValid: usernameValid && emailValid && passwordValid,
      passwordValue: formData.password,
      passwordLength: formData.password.length,
      hasLetters: /[A-Za-z]/.test(formData.password),
      hasNumbers: /\d/.test(formData.password),
    });
  }, [formData]);

  // Redirection automatique quand step === 1
  useEffect(() => {
    if (step === 1) {
      const timer = setTimeout(() => {
        window.location.href = "/sign-in";
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value.startsWith(" ")) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid.username || !isValid.email || !isValid.password) return;

    setIsSubmitting(true);
    try {
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const res = await fetch(`${apiUrl}/auth/signup`, {
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
        });
        setStep(1);
      } else {
        toast.error(data.message || "Une erreur est survenue", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch {
      toast.error("Erreur lors de la création du compte", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Particle effect
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

  // Floating bubbles
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 flex items-center justify-center p-4 overflow-x-hidden">
      {/* Arrière-plan animé */}
      <div
        ref={particlesRef}
        className="absolute inset-0 pointer-events-none"
      />
      {floatingBubbles}

      {/* Conteneur principal avec effet glassmorphism */}
      <motion.div
        className="card w-full max-w-3xl bg-base-100/95 backdrop-blur-xl shadow-2xl border border-base-300/50 z-10 overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="card-body p-0 flex flex-col lg:flex-row">
          {/* Partie gauche - Formulaire */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12">
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
                  {/* Titre et description */}
                  <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                      Créer un compte
                    </h1>
                    <p className="text-base-content/70">
                      Rejoignez la communauté Doualair
                    </p>
                  </motion.div>

                  {/* Champ Username */}
                  <motion.div
                    className="form-control"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="label">
                      <span className="label-text font-medium">
                        Nom d'utilisateur
                      </span>
                    </label>
                    <div className="relative group">
                      <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        value={formData.username}
                        onChange={handleChange}
                        className={`input input-bordered w-full pl-12 pr-12 transition-all duration-300 group-hover:input-primary ${
                          formData.username
                            ? isValid.username
                              ? "input-success"
                              : "input-error"
                            : ""
                        }`}
                        placeholder="Entrez votre nom d'utilisateur"
                      />
                      <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-base-content/50 group-hover:text-primary transition-colors" />

                      {/* Animation de validation */}
                      <AnimatePresence>
                        {formData.username && (
                          <motion.div
                            className="absolute right-4 top-1/2 transform -translate-y-1/2"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                            }}
                          >
                            {isValid.username ? (
                              <motion.div
                                className="w-6 h-6 bg-success rounded-full flex items-center justify-center"
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <FiCheck className="text-success-content text-sm" />
                              </motion.div>
                            ) : (
                              <motion.div
                                className="w-6 h-6 bg-error rounded-full flex items-center justify-center"
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <FiX className="text-error-content text-sm" />
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Barre de progression animée */}
                    <AnimatePresence>
                      {formData.username && (
                        <motion.div
                          className="mt-2"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <div className="w-full bg-base-300 rounded-full h-2">
                            <motion.div
                              className="h-2 rounded-full transition-all duration-500"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${Math.min(
                                  (formData.username.length / 3) * 100,
                                  100
                                )}%`,
                                backgroundColor: isValid.username
                                  ? "#10b981"
                                  : "#ef4444",
                              }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Champ Email */}
                  <motion.div
                    className="form-control"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="label">
                      <span className="label-text font-medium">Email</span>
                    </label>
                    <div className="relative group">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className={`input input-bordered w-full pl-12 pr-12 transition-all duration-300 group-hover:input-primary ${
                          formData.email
                            ? isValid.email
                              ? "input-success"
                              : "input-error"
                            : ""
                        }`}
                        placeholder="Entrez votre adresse email"
                      />
                      <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-base-content/50 group-hover:text-primary transition-colors" />

                      {/* Animation de validation */}
                      <AnimatePresence>
                        {formData.email && (
                          <motion.div
                            className="absolute right-4 top-1/2 transform -translate-y-1/2"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                            }}
                          >
                            {isValid.email ? (
                              <motion.div
                                className="w-6 h-6 bg-success rounded-full flex items-center justify-center"
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <FiCheck className="text-success-content text-sm" />
                              </motion.div>
                            ) : (
                              <motion.div
                                className="w-6 h-6 bg-error rounded-full flex items-center justify-center"
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <FiX className="text-error-content text-sm" />
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Animation de validation email */}
                    <AnimatePresence>
                      {formData.email && (
                        <motion.div
                          className="mt-2"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <div className="flex items-center space-x-2">
                            <motion.div
                              className={`w-3 h-3 rounded-full ${
                                isValid.email ? "bg-success" : "bg-error"
                              }`}
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            />
                            <span className="text-xs opacity-70">
                              {isValid.email
                                ? "Format email valide"
                                : "Format email invalide"}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Champ Password */}
                  <motion.div
                    className="form-control"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="label">
                      <span className="label-text font-medium">
                        Mot de passe
                      </span>
                    </label>
                    <div className="relative group">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className={`input input-bordered w-full pl-12 pr-16 transition-all duration-300 group-hover:input-primary ${
                          formData.password
                            ? isValid.password
                              ? "input-success"
                              : "input-error"
                            : ""
                        }`}
                        placeholder="Entrez votre mot de passe"
                      />
                      <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-base-content/50 group-hover:text-primary transition-colors" />

                      {/* Bouton toggle password */}
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-base-content/50 hover:text-primary transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {showPassword ? (
                            <FiEyeOff className="w-5 h-5" />
                          ) : (
                            <FiEye className="w-5 h-5" />
                          )}
                        </motion.div>
                      </button>

                      {/* Animation de validation */}
                      <AnimatePresence>
                        {formData.password && (
                          <motion.div
                            className="absolute right-12 top-1/2 transform -translate-y-1/2"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                            }}
                          >
                            {isValid.password ? (
                              <motion.div
                                className="w-6 h-6 bg-success rounded-full flex items-center justify-center"
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <FiCheck className="text-success-content text-sm" />
                              </motion.div>
                            ) : (
                              <motion.div
                                className="w-6 h-6 bg-error rounded-full flex items-center justify-center"
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <FiX className="text-error-content text-sm" />
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Indicateur de force du mot de passe */}
                    <AnimatePresence>
                      {formData.password && (
                        <motion.div
                          className="mt-2"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <div className="space-y-2">
                            <div className="flex space-x-1">
                              {[...Array(4)].map((_, i) => {
                                const strength = getPasswordStrength(
                                  formData.password
                                );
                                const shouldFill = i < strength.level;

                                return (
                                  <motion.div
                                    key={i}
                                    className={`h-2 rounded-full flex-1 ${
                                      shouldFill
                                        ? strength.color
                                        : "bg-base-300"
                                    }`}
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                  />
                                );
                              })}
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="opacity-70">
                                Force du mot de passe
                              </span>
                              <span
                                className={`font-medium ${
                                  getPasswordStrength(formData.password)
                                    .textColor
                                }`}
                              >
                                {getPasswordStrength(formData.password).label}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Bouton de soumission */}
                  <motion.button
                    type="submit"
                    className={`btn w-full h-12 text-lg font-medium shadow-lg ${
                      isSubmitting ||
                      !(isValid.username && isValid.email && isValid.password)
                        ? "btn-disabled opacity-50"
                        : "btn-primary"
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
                        ? { scale: 1.02, y: -2 }
                        : {}
                    }
                    whileTap={
                      !isSubmitting &&
                      isValid.username &&
                      isValid.email &&
                      isValid.password
                        ? { scale: 0.98 }
                        : {}
                    }
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity:
                        isValid.username && isValid.email && isValid.password
                          ? 1
                          : 0.7,
                      y: 0,
                    }}
                    transition={{ delay: 0.6 }}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <span className="loading loading-spinner loading-sm"></span>
                        <span className="ml-2">Création en cours...</span>
                      </div>
                    ) : (
                      <span className="flex items-center justify-center">
                        <span>Créer mon compte</span>
                        <motion.span
                          className="ml-2"
                          animate={
                            isValid.username &&
                            isValid.email &&
                            isValid.password
                              ? {
                                  x: [0, 5, 0],
                                  transition: {
                                    repeat: Infinity,
                                    duration: 1.5,
                                  },
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
                    className="divider"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    Ou continuez avec
                  </motion.div>

                  {/* Google OAuth button */}
                  <OAuth />

                  {/* Lien de connexion */}
                  <motion.div
                    className="text-center mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    <p className="text-base-content/70">
                      Vous avez déjà un compte ?{" "}
                      <a
                        href="/sign-in"
                        className="link link-primary font-medium hover:underline"
                      >
                        Connectez-vous
                      </a>
                    </p>
                  </motion.div>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-center space-y-8"
                >
                  <motion.div
                    className="flex justify-center"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.2,
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                  >
                    <div className="relative">
                      <div className="w-32 h-32 bg-gradient-to-br from-success to-success/80 rounded-full flex items-center justify-center shadow-2xl">
                        <FiCheck className="text-5xl text-success-content" />
                      </div>
                      {/* Effet de lueur */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-success/20"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.2, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                  >
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-success to-success/80 bg-clip-text text-transparent">
                      Compte créé avec succès !
                    </h2>
                    <p className="text-lg opacity-70 leading-relaxed max-w-md mx-auto">
                      Votre compte a été créé avec succès. Vous pouvez
                      maintenant vous connecter et accéder à toutes les
                      fonctionnalités de Doualair.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-4"
                  >
                    <motion.button
                      className="btn btn-primary btn-lg shadow-lg"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        window.location.href = "/sign-in";
                      }}
                    >
                      <span className="flex items-center">
                        Se connecter
                        <motion.span
                          className="ml-2"
                          animate={{
                            x: [0, 5, 0],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          →
                        </motion.span>
                      </span>
                    </motion.button>

                    <div className="text-sm opacity-60">
                      Redirection automatique dans 3 secondes...
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Partie droite - Design moderne */}
          <motion.div
            className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 p-12 flex-col items-center justify-center relative overflow-hidden"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            {/* Effet de fond animé */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 animate-pulse"></div>

            {/* Logo et contenu */}
            <motion.div
              className="relative z-10 text-center"
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="avatar placeholder mb-8">
                <div className="bg-gradient-to-br from-primary to-secondary text-primary-content rounded-full w-32 h-32 flex items-center justify-center shadow-2xl relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FiUser className="text-5xl" />
                  </div>
                </div>
              </div>

              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Rejoignez Doualair
              </h2>

              <p className="text-lg opacity-80 leading-relaxed max-w-md">
                Créez votre compte pour accéder à toutes les fonctionnalités de
                Doualair et rejoindre notre communauté passionnée
                d'aéronautique.
              </p>

              {/* Avantages */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="opacity-80">Accès à tous les articles</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="opacity-80">
                    Notifications personnalisées
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="opacity-80">Contenu exclusif</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Éléments décoratifs flottants */}
      <motion.div
        className="absolute top-1/4 -left-20 w-48 h-48 bg-primary/20 rounded-full"
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
        className="absolute bottom-1/4 -right-20 w-64 h-64 bg-secondary/20 rounded-full"
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
