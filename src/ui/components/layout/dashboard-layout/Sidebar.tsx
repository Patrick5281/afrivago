import React from "react";
import { SIDEBAR_LINKS } from "./sidebarLinks";
import { Logo } from "@/ui/design-system/logo/logo";
import {
  Home,
  FileText,
  PlusCircle,
  CreditCard,
  FileCheck2,
  User,
  File,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Calendar,
  Heart,
  Bell,
  Star,
  MessageCircle,
  Activity,
  BookOpen,
  Users,
} from "lucide-react";
import Link from "next/link";
import { CallsToActionSideBarGroup } from "@/ui/components/call-to-action/call-to-action-sidebar-contribution";
import { useAuth } from "@/Context/AuthUserContext";
import { useRoleContext } from "@/Context/RoleContext";
import { toast } from 'react-toastify';

interface SidebarProps {
  role: string;
  activeSection: string;
  onSectionChange: (key: string) => void;
}

const iconMap: { [key: string]: JSX.Element } = {
  dashboard: <Home size={20} />,
  "mes-biens": <FileText size={20} />,
  "ajouter-bien": <PlusCircle size={20} />,
  paiements: <CreditCard size={20} />,
  contrats: <FileCheck2 size={20} />,
  documents: <File size={20} />,
  parametres: <Settings size={20} />,
  "support-admin": <HelpCircle size={20} />,
  recherche: <Search size={20} />,
  calendrier: <Calendar size={20} />,
  favoris: <Heart size={20} />,
  notifications: <Bell size={20} />,
  "mes-reservations": <BookOpen size={20} />,
  reservations: <BookOpen size={20} />,
  "aide-faq": <HelpCircle size={20} />,
  recommandations: <Star size={20} />,
  nouveautes: <Star size={20} />,
  message: <MessageCircle size={20} />,
  activity: <Activity size={20} />,
  profile: <User size={20} />,
  users: <Users size={20} />,
  "mes-locataires": <Users size={20} />,
};

export const Sidebar: React.FC<SidebarProps> = ({ role, activeSection, onSectionChange }) => {
  // Déterminer la clé de rôle (proprietaire/locataire)
  const roleKey = role?.toLowerCase().includes("proprietaire")
    ? "proprietaire"
    : role?.toLowerCase().includes("locataire")
    ? "locataire"
    : null;

  const sidebarLinks = roleKey ? SIDEBAR_LINKS[roleKey] : [];

  const { signOut } = useAuth();
  const { activeRole, setActiveRole, userRoles } = useRoleContext();

  // Fonction pour changer de mode (switch role)
  const handleSwitchRole = () => {
    if (userRoles.length > 1) {
      const nextRole = userRoles.find(r => r.id !== activeRole?.id);
      if (nextRole) setActiveRole(nextRole);
    }
  };

  // Fonction pour déconnexion
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Déconnexion réussie.');
    } catch (e) {
      toast.warn('Déconnexion locale : serveur injoignable.');
    } finally {
      signOut();
      window.location.href = "/connexion";
    }
  };

  return (
    <aside className="w-1/5 min-w-[220px] max-w-[400px] bg-white h-full flex flex-col shadow-lg">
      {/* Logo centré, cliquable, avec plus de marge */}
      <div className="flex items-center justify-center">
        <Link href="/">
          <span className="cursor-pointer block">
            <Logo size="large" />
          </span>
        </Link>
      </div>
      {/* Navigation + Call to Action scrollables */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6">
        <nav className="space-y-1">
          {sidebarLinks.map((section) =>
            section.links.map((link) => (
              <button
                key={link.key}
                onClick={() => onSectionChange(link.key)}
                className={`flex items-center gap-3 px-3 py-2 rounded font-medium transition w-full text-left mb-1
                  ${activeSection === link.key ? "bg-indigo-600 text-white shadow-lg" : "text-gray-700 hover:bg-primary-100"}
                `}
              >
                <span className="text-lg">
                  {iconMap[link.key] || <FileText size={20} />}
                </span>
                <span>{link.label}</span>
                {activeSection === link.key && (
                  <span className="ml-auto w-2 h-2 bg-white rounded-full opacity-80"></span>
                )}
              </button>
            ))
          )}
        </nav>
        
      </div>
      {/* Section fixe en bas, avec plus de marge en bas */}
      <div className="px-4 pb-8 flex flex-col gap-2 sticky bottom-0 mb-20 z-10">
        <button
          onClick={handleSwitchRole}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 border border-indigo-100"
        >
          <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2 animate-pulse"></span>
          Mode {roleKey === "proprietaire" ? "Propriétaire" : "Locataire"}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg border border-transparent hover:border-red-100"
        >
          <LogOut size={18} className="mr-2" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}; 