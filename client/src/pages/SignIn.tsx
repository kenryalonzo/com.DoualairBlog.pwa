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
  FiAlertCircle,
} from "react-icons/fi";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { signInWithRedirect, getRedirectResult, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../redux/user/userSlice";
import { authService } from "../services/api";

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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const particlesRef = useRef<HTMLDivElement>(null);
  const [isValid, setIsValid] = useState<ValidationState>({
    email: false,
    password: false,
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
    const emailValid = emailRegex.test(formData.email.trim());
    const passwordValid = formData.password.length >= 6;

    setIsValid({
      email: emailValid,
      password: passwordValid,
    });
  }, [formData]);

  // Vérifier le résultat de la redirection Google au chargement
  useEffect(() => {
    const handleGoogleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          setIsGoogleLoading(true);
          await handleGoogleAuthSuccess(result);
        }
      } catch (error) {
        console.error("Erreur lors de la redirection Google:", error);
        toast.error("Erreur lors de l'authentification Google");
      } finally {
        setIsGoogleLoading(false);
      }
    };

    handleGoogleRedirectResult();
  }, []);

  // Fonction pour gérer le succès de l'authentification Google
  const handleGoogleAuthSuccess = async (result: any) => {
    try {
      const idToken = await result.user.getIdToken();
      const response = await authService.googleAuth(idToken);

      if (response.success && response.user) {
        dispatch(signInSuccess(response.user));
        redirectBasedOnRole(response.user);
      } else {
        throw new Error(response.message || "Erreur d'authentification");
      }
    } catch (error: any) {
      console.error("Erreur Google Auth:", error);
      dispatch(signInFailure(error.message));
      toast.error(error.message || "Erreur lors de l'authentification Google");
    }
  };

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

  // Gestion des changements de formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Empêcher les espaces au début
    if (value.startsWith(" ")) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Soumission du formulaire de connexion classique
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid.email || !isValid.password) return;

    setIsSubmitting(true);
    try {
      dispatch(signInStart());

      const response = await authService.login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response.success && response.user) {
        dispatch(signInSuccess(response.user));
        redirectBasedOnRole(response.user);
      } else {
        throw new Error(response.message || "Erreur de connexion");
      }
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      dispatch(signInFailure(error.message));
      
      // Messages d'erreur spécifiques
      let errorMessage = "Une erreur est survenue lors de la connexion";
      if (error.message.includes("Invalid credentials") || error.message.includes("incorrect")) {
        errorMessage = "Email ou mot de passe incorrect";
      } else if (error.message.includes("not found")) {
        errorMessage = "Aucun compte trouvé avec cet email";
      } else if (error.message.includes("blocked") || error.message.includes("suspended")) {
        errorMessage = "Votre compte a été suspendu. Contactez l'administrateur.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Authentification Google avec redirection
  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) return;

    try {
      setIsGoogleLoading(true);
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      // Utiliser signInWithRedirect au lieu de signInWithPopup
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error("Erreur lors du processus Google Sign-In:", error);
      setIsGoogleLoading(false);
      
      let errorMessage = "Erreur lors de l'authentification Google";
      if (error.code === 'auth/popup-blocked') {
        errorMessage = "Les popups sont bloquées. Veuillez autoriser les popups pour ce site.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = "Connexion annulée";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // Animation des particules
  useEffect(() => {
    const particles = particlesRef.current;
    if (!particles) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = particles.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      particles.style.background = `radial-gradient(600px at ${x}px ${y}px, rgba(29, 78, 216, 0.15), transparent 80%)`;
    };

    particles.addEventListener("mousemove", handleMouseMove);
    return () => particles.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-base-100 to-secondary/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Particules animées */}
      <div
        ref={particlesRef}
        className="absolute inset-0 transition-all duration-300"
      />

      {/* Formulaire de connexion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="card bg-base-100 shadow-2xl">
          <div className="card-body">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <FiUser className="text-2xl text-primary-content" />
              </motion.div>
              <h1 className="text-3xl font-bold text-base-content">
                Connexion
              </h1>
              <p className="text-base-content/70 mt-2">
                Accédez à votre espace personnel
              </p>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    className={`input input-bordered w-full pl-12 ${
                      formData.email
                        ? isValid.email
                          ? "input-success"
                          : "input-error"
                        : ""
                    }`}
                    required
                  />
                  <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                  {formData.email && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      {isValid.email ? (
                        <FiCheck className="text-success" />
                      ) : (
                        <FiX className="text-error" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Mot de passe */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Mot de passe</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`input input-bordered w-full pl-12 pr-12 ${
                      formData.password
                        ? isValid.password
                          ? "input-success"
                          : "input-error"
                        : ""
                    }`}
                    required
                  />
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-base-content/50 hover:text-base-content"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                {/* Indicateur de force du mot de passe */}
                <AnimatePresence>
                  {formData.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex-1 bg-base-300 rounded-full h-1">
                          <div
                            className={`h-1 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                            style={{
                              width: `${(passwordStrength.level / 4) * 100}%`,
                            }}
                          />
                        </div>
                        <span className={`text-xs ${passwordStrength.textColor}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bouton de connexion */}
              <button
                type="submit"
                disabled={!isValid.email || !isValid.password || isSubmitting}
                className={`btn btn-primary w-full ${
                  isSubmitting ? "loading" : ""
                }`}
              >
                {isSubmitting ? "Connexion..." : "Se connecter"}
              </button>
            </form>

            {/* Divider */}
            <div className="divider">OU</div>

            {/* Bouton Google */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className={`btn btn-outline w-full ${
                isGoogleLoading ? "loading" : ""
              }`}
            >
              {isGoogleLoading ? (
                "Connexion en cours..."
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continuer avec Google
                </>
              )}
            </button>

            {/* Liens */}
            <div className="text-center mt-6 space-y-2">
              <p className="text-sm text-base-content/70">
                Pas encore de compte ?{" "}
                <Link
                  to="/sign-up"
                  className="text-primary hover:text-primary-focus font-medium"
                >
                  S'inscrire
                </Link>
              </p>
              <Link
                to="/forgot-password"
                className="text-sm text-base-content/70 hover:text-base-content"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Note admin */}
            <div className="mt-4 p-3 bg-info/10 rounded-lg border border-info/20">
              <div className="flex items-start gap-2">
                <FiAlertCircle className="text-info mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-info font-medium">Information</p>
                  <p className="text-base-content/70">
                    Les administrateurs utilisent la même interface de connexion.
                    Vous serez automatiquement redirigé selon vos permissions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default SignIn;
