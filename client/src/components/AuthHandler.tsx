import { getAuth, getRedirectResult } from "firebase/auth";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToastContext } from "../contexts/ToastContext";
import { app } from "../firebase";
import { signInSuccess } from "../redux/user/userSlice";

export default function AuthHandler() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToastContext();

  useEffect(() => {
    console.log("[AuthHandler] mounted");
    const handleRedirectResult = async () => {
      try {
        const auth = getAuth(app);
        const result = await getRedirectResult(auth);
        console.log("[AuthHandler] Redirect result:", result);

        if (result) {
          // Send user information to your backend for authentication
          const apiUrl =
            import.meta.env.VITE_API_URL || "http://localhost:3000/api";
          const res = await fetch(`${apiUrl}/auth/google`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Important pour les cookies
            body: JSON.stringify({
              name: result.user.displayName,
              email: result.user.email,
              photo: result.user.photoURL,
            }),
          });

          const data = await res.json();
          console.log("[AuthHandler] Backend response:", data);

          if (res.ok) {
            const userData = data.user || data;
            console.log("[AuthHandler] Full backend response:", data);
            console.log("[AuthHandler] User data to dispatch:", userData);
            console.log(
              "[AuthHandler] User data keys:",
              userData ? Object.keys(userData) : "null"
            );
            console.log("[AuthHandler] User email:", userData.email);
            console.log("[AuthHandler] User firstName:", userData.firstName);
            console.log("[AuthHandler] User lastName:", userData.lastName);
            console.log("[AuthHandler] User username:", userData.username);
            dispatch(signInSuccess(userData));
            console.log("[AuthHandler] User signed in:", data);
            toast.success("Connexion Google réussie !");
            navigate("/");
          } else {
            console.error("[AuthHandler] Backend error:", data);
            toast.error(data.message || "Erreur lors de la connexion Google");
          }
        } else {
          console.log(
            "[AuthHandler] Aucun résultat de redirection Firebase trouvé."
          );
        }
      } catch (error) {
        console.error("[AuthHandler] Error handling redirect result:", error);
        toast.error("Erreur lors de la connexion Google");
      }
    };

    handleRedirectResult();
  }, [dispatch, navigate]);

  return null; // Ce composant ne rend rien
}
