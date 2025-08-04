import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import type { RootState } from "../redux/store";
import { AccessDenied } from "./AccessDenied";

type PrivateRouteProps = {
  children: React.ReactNode;
  showAccessDenied?: boolean;
};

export const PrivateRoute = ({
  children,
  showAccessDenied = false,
}: PrivateRouteProps) => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const location = useLocation();

  // Si l'utilisateur n'est pas connecté
  if (!currentUser) {
    // Si showAccessDenied est true, afficher la page d'accès refusé
    if (showAccessDenied) {
      return <AccessDenied />;
    }

    // Sinon, rediriger vers la page de connexion
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Si l'utilisateur est connecté, afficher le contenu protégé
  return <>{children}</>;
};
