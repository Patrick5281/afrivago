import React from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface DashboardLayoutProps {
  role: string;
  activeSection: string;
  onSectionChange: (key: string) => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role, activeSection, onSectionChange, children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar latérale gauche */}
      <Sidebar role={role} activeSection={activeSection} onSectionChange={onSectionChange} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar horizontale */}
        <Topbar activeRole={role} onSectionChange={onSectionChange} />
        {/* Contenu principal */}
        <main className="flex-1 overflow-y-auto bg-gray-300">
          {children}
        </main>
      </div>
    </div>
  );
}; 