import { Bars3Icon } from "@heroicons/react/24/outline";

type DashboardHeaderProps = {
  activeTab: string;
  onOpenSidebar: () => void;
};

export const DashboardHeader = ({
  activeTab,
  onOpenSidebar,
}: DashboardHeaderProps) => {
  const menuItems = [
    { id: "profile", name: "Profil" },
    { id: "security", name: "Sécurité" },
  ];

  const currentSectionName = menuItems.find(
    (item) => item.id === activeTab
  )?.name;

  return (
    <div className="lg:hidden navbar bg-base-100 shadow-lg sticky top-0 z-40">
      <div className="navbar-start">
        <button onClick={onOpenSidebar} className="btn btn-ghost btn-square">
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>
      <div className="navbar-center">
        <h1 className="text-lg font-semibold">{currentSectionName}</h1>
      </div>
      <div className="navbar-end">
        <div className="w-8"></div>
      </div>
    </div>
  );
};
