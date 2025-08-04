import { User } from "./types";
import { getUserProfilePicture, hasProfilePicture } from "./utils";

type UserDataDebugProps = {
  user: User;
};

export const UserDataDebug = ({ user }: UserDataDebugProps) => {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="card bg-warning/10 border-warning/20 shadow-xl mb-4">
      <div className="card-body">
        <h3 className="card-title text-warning">
          🔍 Debug - Données Utilisateur
        </h3>
        <div className="text-sm space-y-2">
          <p>
            <strong>Username:</strong> {user?.username || "Non défini"}
          </p>
          <p>
            <strong>Email:</strong> {user?.email || "Non défini"}
          </p>
          <p>
            <strong>Photo:</strong> {user?.photo || "Non défini"}
          </p>
          <p>
            <strong>Profile Picture:</strong>{" "}
            {user?.profilePicture || "Non défini"}
          </p>
          <p>
            <strong>Photo récupérée:</strong>{" "}
            {getUserProfilePicture(user) || "Non définie"}
          </p>
          <p>
            <strong>A une photo:</strong>{" "}
            {hasProfilePicture(user) ? "Oui" : "Non"}
          </p>
          <p>
            <strong>Role:</strong> {user?.role || "Non défini"}
          </p>
        </div>
      </div>
    </div>
  );
};
