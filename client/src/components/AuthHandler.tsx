import { useEffect } from "react";
import { getRedirectResult, getAuth } from "firebase/auth";
import { app } from "../firebase";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AuthHandler() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("[AuthHandler] mounted");
    const handleRedirectResult = async () => {
      try {
        const auth = getAuth(app);
        const result = await getRedirectResult(auth);
        console.log("[AuthHandler] Redirect result:", result);

        if (result) {
          // Send user information to your backend for authentication
          const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
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
            dispatch(signInSuccess(data.user || data));
            console.log("[AuthHandler] User signed in:", data);
            toast.success("Connexion Google réussie !", {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            navigate("/dashboard");
          } else {
            console.error("[AuthHandler] Backend error:", data);
            toast.error(data.message || "Erreur lors de la connexion Google", {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }
        } else {
          console.log(
            "[AuthHandler] Aucun résultat de redirection Firebase trouvé."
          );
        }
      } catch (error) {
        console.error("[AuthHandler] Error handling redirect result:", error);
        toast.error("Erreur lors de la connexion Google", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    };

    handleRedirectResult();
  }, [dispatch, navigate]);

  return null; // Ce composant ne rend rien
}
