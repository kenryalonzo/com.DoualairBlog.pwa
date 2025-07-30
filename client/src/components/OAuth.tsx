import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { app } from "../firebase";
import { toast } from "react-toastify";
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from "react-redux";
import {
  signInSuccess,
  signInStart,
  signInFailure,
} from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/api";

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    try {
      console.log("[OAuth] Starting Google sign in...");
      dispatch(signInStart());

      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      // Use popup instead of redirect due to network issues
      console.log("[OAuth] Initiating popup...");
      const result = await signInWithPopup(auth, provider);
      console.log("[OAuth] Popup successful:", result.user.email);

      // Send user information to your backend for authentication
      const data = await authService.googleAuth({
        name: result.user.displayName || "Utilisateur Google",
        email: result.user.email || "",
        photo: result.user.photoURL || undefined,
      });

      console.log("[OAuth] Backend response:", data);

      // Dispatch to Redux store with correct data structure
      dispatch(signInSuccess(data.user || data));
      toast.success("Connexion Google réussie !", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      // Use navigate instead of window.location.href
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      console.error("Could not initiate Google sign in", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de l'initialisation de la connexion Google";
      dispatch(signInFailure(errorMessage));

      // Fallback: Test authentication with mock data
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "auth/network-request-failed"
      ) {
        console.log("[OAuth] Network error detected, trying fallback...");
        await handleFallbackAuth();
      } else {
        toast.error("Erreur lors de l'initialisation de la connexion Google", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  const handleFallbackAuth = async () => {
    try {
      console.log("[OAuth] Using fallback authentication...");

      // Mock Google user data for testing
      const mockUserData = {
        name: "Test User",
        email: "test@example.com",
        photo: "https://via.placeholder.com/150",
      };

      const data = await authService.googleAuth(mockUserData);
      console.log("[OAuth] Fallback backend response:", data);

      dispatch(signInSuccess(data.user || data));
      toast.success("Connexion de test réussie !", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      console.error("[OAuth] Fallback error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la connexion de test";
      dispatch(signInFailure(errorMessage));
      toast.error("Erreur lors de la connexion de test");
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        className="w-full flex items-center justify-center py-3.5 px-6 rounded-lg border-2 border-gray-200/20 bg-white/10 text-gray-300 font-medium hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
        onClick={handleGoogleClick}
      >
        <FcGoogle className="w-5 h-5 mr-3" />
        <span>Continuer avec Google</span>
      </button>

      {/* Test button for network issues */}
      <button
        type="button"
        className="w-full flex items-center justify-center py-2 px-4 rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-300 text-sm font-medium hover:bg-orange-500/20 transition-all duration-200"
        onClick={handleFallbackAuth}
      >
        🔧 Test (si problème réseau)
      </button>
    </div>
  );
}
