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
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OAuth from "../components/OAuth"; // Import the OAuth component
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../redux/user/userSlice";

interface FormData {
  email: string;
  password: string;
}

interface ValidationState {
  email: boolean;
  password: boolean;
}

const SignIn = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const particlesRef = useRef<HTMLDivElement>(null);
  const [isValid, setIsValid] = useState<ValidationState>({
    email: false,
    password: false,
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Fonction pour calculer la force du mot de passe (identique à SignUp)
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

    const emailValid = emailRegex.test(formData.email.trim());
    const passwordValid = formData.password.trim().length >= 1;

    setIsValid({
      email: emailValid,
      password: passwordValid,
    });

    // Debug: afficher l'état de validation
    console.log("SignIn Validation state:", {
      email: emailValid,
      password: passwordValid,
      allValid: emailValid && passwordValid,
      emailValue: formData.email,
      passwordValue: formData.password,
    });
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value.startsWith(" ")) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid.email || !isValid.password) return;

    setIsSubmitting(true);
    try {
      dispatch(signInStart());
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:3000/api";

      // Fonction pour rediriger selon le rôle
      const redirectBasedOnRole = (userData: any) => {
        if (userData.role === "admin") {
          navigate("/dashboard");
          toast.success("Bienvenue dans l'interface d'administration !", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else {
          navigate("/profile");
          toast.success("Connexion réussie !", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      };

      // Une seule requête API - Le serveur détermine le rôle
      const response = await fetch(`${apiUrl}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("[SignIn] API response:", data);

      if (response.ok) {
        const user = data.user || data.data?.user;

        // Si c'est un admin, stocker aussi en localStorage pour compatibilité
        if (user.role === "admin" && data.token) {
          localStorage.setItem("auth_token", data.token);
          localStorage.setItem("user", JSON.stringify(user));
        }

        // Mettre à jour Redux
        dispatch(signInSuccess(user));

        // Redirection selon le rôle
        setTimeout(() => redirectBasedOnRole(user), 1500);
      } else {
        dispatch(signInFailure(data.message || "Erreur de connexion"));
        toast.error(data.message || "Identifiants incorrects", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur lors de la connexion";
      dispatch(signInFailure(errorMessage));
      toast.error("Erreur lors de la connexion", {
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
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 flex items-center justify-center p-4">
      {/* Arrière-plan animé */}
      <div
        ref={particlesRef}
        className="absolute inset-0 pointer-events-none"
      />
      {floatingBubbles}

      {/* Conteneur principal avec effet glassmorphism */}
      <motion.div
        className="card w-full max-w-5xl bg-base-100/95 backdrop-blur-xl shadow-2xl border border-base-300/50 z-10 overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="card-body p-0 flex flex-col lg:flex-row">
          {/* Partie gauche - Formulaire */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12">
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Titre et description */}
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  Se connecter
                </h1>
                <p className="text-base-content/70">
                  Accédez à votre compte Doualair
                </p>
              </motion.div>
              {/* Champ Email */}
              <motion.div
                className="form-control"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
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
                transition={{ delay: 0.4 }}
              >
                <label className="label">
                  <span className="label-text font-medium">Mot de passe</span>
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
                                  shouldFill ? strength.color : "bg-base-300"
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
                              getPasswordStrength(formData.password).textColor
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

              {/* Options de connexion */}
              <motion.div
                className="flex items-center justify-between"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="label cursor-pointer">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text ml-2">Se souvenir de moi</span>
                </label>
                <div className="text-sm">
                  <a href="#" className="link link-primary">
                    Mot de passe oublié ?
                  </a>
                </div>
              </motion.div>

              {/* Bouton de connexion */}
              <motion.button
                type="submit"
                className={`btn w-full h-12 text-lg font-medium shadow-lg ${
                  isSubmitting || !(isValid.email && isValid.password)
                    ? "btn-disabled opacity-50"
                    : "btn-primary"
                }`}
                disabled={isSubmitting || !(isValid.email && isValid.password)}
                whileHover={
                  !isSubmitting && isValid.email && isValid.password
                    ? { scale: 1.02, y: -2 }
                    : {}
                }
                whileTap={
                  !isSubmitting && isValid.email && isValid.password
                    ? { scale: 0.98 }
                    : {}
                }
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: isValid.email && isValid.password ? 1 : 0.7,
                  y: 0,
                }}
                transition={{ delay: 0.6 }}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <span className="loading loading-spinner loading-sm"></span>
                    <span className="ml-2">Connexion en cours...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center">
                    <span>Se connecter</span>
                    <motion.span
                      className="ml-2"
                      animate={
                        isValid.email && isValid.password
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
                className="divider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Ou continuez avec
              </motion.div>

              {/* Google OAuth button */}
              <OAuth />

              {/* Lien d'inscription */}
              <motion.div
                className="text-center space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <p className="text-base-content/70">
                  Vous n'avez pas de compte ?{" "}
                  <Link to="/sign-up" className="link link-primary">
                    Créez-en un
                  </Link>
                </p>

                <div className="alert alert-info">
                  <FiUser className="w-4 h-4" />
                  <span className="text-xs">
                    Administrateurs et utilisateurs utilisent la même page de
                    connexion
                  </span>
                </div>
              </motion.div>
            </motion.form>
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
                Bienvenue de retour
              </h2>

              <p className="text-lg opacity-80 leading-relaxed max-w-md">
                Connectez-vous à votre compte pour accéder à toutes les
                fonctionnalités de Doualair et retrouver vos contenus
                personnalisés.
              </p>

              {/* Avantages */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="opacity-80">
                    Accès à vos articles favoris
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="opacity-80">Historique de navigation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="opacity-80">Paramètres personnalisés</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Toast Container */}
      <ToastContainer />

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

export default SignIn;
