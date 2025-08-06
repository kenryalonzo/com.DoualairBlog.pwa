import { motion as m } from "framer-motion";
import { LogOut, Palette, ShieldCheck, User as UserIcon } from "lucide-react";
import type { User } from "./types";

type MenuItem = {
  id: string;
  name: string;
  url: string;
  icon: string;
  admin?: boolean;
};

type DashboardSidebarProps = {
  currentUser: User;
  activeTab: string;
  menuItems: MenuItem[];
  onNavigateToSection: (section: string) => void;
  onSignOut: () => void;
};

export const DashboardSidebar = ({
  currentUser,
  activeTab,
  menuItems,
  onNavigateToSection,
  onSignOut,
}: DashboardSidebarProps) => {
  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      "👤": UserIcon,
      "🔒": ShieldCheck,
    };
    return icons[iconName] || UserIcon;
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-base-100 shadow-xl border-r border-base-300 flex flex-col z-50">
      {/* Logo */}
      <div className="navbar bg-base-100 border-b border-base-300">
        <div className="flex-1">
          <div className="flex items-center gap-3 p-4">
            <Palette className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Mon Dashboard</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 overflow-y-auto">
        <ul className="menu menu-lg bg-base-100 w-full space-y-2">
          {/* Sections utilisateur */}
          {menuItems
            .filter((item) => !item.admin)
            .map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onNavigateToSection(item.url)}
                  className={`${
                    activeTab === item.id ? "bg-base-200" : ""
                  } rounded-lg`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.name}
                  {item.id === "profile" && currentUser?.role && (
                    <m.span
                      initial={{ scale: 0.7, opacity: 0, x: 10 }}
                      animate={{ scale: 1, opacity: 1, x: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                      }}
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                        currentUser.role === "admin"
                          ? "bg-gradient-to-r from-red-500 to-pink-500"
                          : "bg-gradient-to-r from-blue-500 to-cyan-400"
                      } text-white`}
                    >
                      {currentUser.role === "admin"
                        ? "ADMIN"
                        : currentUser.role.toUpperCase()}
                    </m.span>
                  )}
                </button>
              </li>
            ))}

          {/* Sections admin */}
          {menuItems.some((item) => item.admin) && (
            <>
              <li className="menu-title">
                <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                  Administration
                </span>
              </li>
              {menuItems
                .filter((item) => item.admin)
                .map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => onNavigateToSection(item.url)}
                      className={`${
                        activeTab === item.id ? "bg-base-200" : ""
                      } rounded-lg`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      {item.name}
                    </button>
                  </li>
                ))}
            </>
          )}
        </ul>
      </div>

      {/* Section Déconnexion */}
      <div className="p-4 border-t border-base-300">
        <button onClick={onSignOut} className="btn btn-outline w-full">
          <LogOut className="w-5 h-5" />
          Se déconnecter
        </button>
      </div>
    </div>
  );
};
