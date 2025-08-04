import { motion } from "framer-motion";
import { Camera, User as UserIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import type { ProfileUpdateData, User } from "./types";
import { getDefaultAvatar, getUserProfilePicture } from "./utils";

type ProfileSettingsProps = {
  currentUser: User;
  onUpdateProfile: (data: ProfileUpdateData) => void;
};

export const ProfileSettings = ({
  currentUser,
  onUpdateProfile,
}: ProfileSettingsProps) => {
  const filePickerRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    profilePicture: getUserProfilePicture(currentUser),
  });
  const [isLoading, setIsLoading] = useState(false);

  // Mettre à jour le formulaire quand les données utilisateur changent
  useEffect(() => {
    setFormData({
      username: currentUser?.username || "",
      email: currentUser?.email || "",
      profilePicture: getUserProfilePicture(currentUser),
    });
  }, [currentUser]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData((prev) => ({ ...prev, profilePicture: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!formData.username.trim() || !formData.email.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);
    try {
      await onUpdateProfile(formData);
      toast.success("Profil mis à jour avec succès !");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
      console.error("Erreur lors de la mise à jour du profil:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Carte pour la photo de profil */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">
            <Camera className="w-5 h-5" />
            Photo de profil
          </h3>
          <p className="text-base-content/70">
            Mettez à jour votre photo de profil.
          </p>

          <div className="flex flex-col md:flex-row items-center gap-6 mt-4">
            <div className="avatar">
              <div className="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img
                  src={
                    formData.profilePicture ||
                    getUserProfilePicture(currentUser) ||
                    getDefaultAvatar(currentUser?.username)
                  }
                  alt="Photo de profil"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = getDefaultAvatar(currentUser?.username);
                  }}
                />
              </div>
            </div>

            <input
              type="file"
              ref={filePickerRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
            <button
              onClick={() => filePickerRef.current?.click()}
              className="btn btn-outline w-full md:w-auto"
            >
              Changer la photo
            </button>
          </div>
        </div>
      </div>

      {/* Carte pour les informations personnelles */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">
            <UserIcon className="w-5 h-5" />
            Informations personnelles
          </h3>
          <p className="text-base-content/70">
            Modifiez votre nom d'utilisateur et votre adresse e-mail.
          </p>

          <div className="form-control w-full mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text">Nom d'utilisateur</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Adresse e-mail</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>
            </div>

            <div className="card-actions justify-end mt-6">
              <button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer les modifications"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
