import { XMarkIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion as m } from "framer-motion";
import { LogOut, Palette, ShieldCheck, User as UserIcon } from "lucide-react";
import { useRef } from "react";
import type { User } from "./types";

type MobileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  activeTab: string;
  onNavigateToSection: (section: string) => void;
  onSignOut: () => void;
};

export const MobileSidebar = ({
  isOpen,
  onClose,
  currentUser,
  activeTab,
  onNavigateToSection,
  onSignOut,
}: MobileSidebarProps) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuItems = [
    { id: "profile", name: "Profil", icon: UserIcon, url: "profile" },
    { id: "security", name: "Sécurité", icon: ShieldCheck, url: "security" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
            onClick={onClose}
          />
          <m.div
            ref={sidebarRef}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 h-full w-64 bg-base-100 shadow-xl z-50 lg:hidden flex flex-col"
          >
            <div className="navbar bg-base-100 border-b border-base-300">
              <div className="flex-1">
                <div className="flex items-center gap-3 p-4">
                  <Palette className="w-6 h-6 text-primary" />
                  <h1 className="text-xl font-bold">Dashboard</h1>
                </div>
              </div>
              <div className="flex-none">
                <button onClick={onClose} className="btn btn-ghost btn-square">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              <ul className="menu menu-lg bg-base-100 w-full">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onNavigateToSection(item.url);
                        onClose();
                      }}
                      className={`${
                        activeTab === item.id ? "bg-base-200" : ""
                      } rounded-lg`}
                    >
                      <item.icon className="w-5 h-5" />
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
              </ul>
            </div>

            <div className="p-4 border-t border-base-300">
              <button onClick={onSignOut} className="btn btn-outline w-full">
                <LogOut className="w-5 h-5" />
                Se déconnecter
              </button>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
};
