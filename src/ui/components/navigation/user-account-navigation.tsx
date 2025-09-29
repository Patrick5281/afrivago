import { Button } from "@/ui/design-system/button/button";
import { Typography } from "@/ui/design-system/typography/typography";
import { Box } from "@/ui/design-system/box/box";
import { Role } from "@/types/roles";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Home,
  Building2,
  Calendar,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  User,
  BarChart,
  Search,
  Heart,
  Bell,
  PlusCircle,
  EyeOff,
  FileCheck2,
  CreditCard,
  Star,
  Sparkles,
  ChevronDown,
  ChevronRight
} from "lucide-react";

const iconMap: { [key: string]: JSX.Element } = {
  dashboard: <Home size={20} />,
  "mes-biens": <Building2 size={20} />,
  reservations: <Calendar size={20} />,
  "mes-reservations": <Calendar size={20} />,
  "support-admin": <HelpCircle size={20} />,
  "ajouter-bien": <PlusCircle size={20} />,
  "publier-masquer": <EyeOff size={20} />,
  paiements: <CreditCard size={20} />,
  "paiement-anticipe": <CreditCard size={20} />,
  contrats: <FileCheck2 size={20} />,
  statistiques: <BarChart size={20} />,
  profil: <User size={20} />,
  documents: <FileText size={20} />,
  parametres: <Settings size={20} />,
  "aide-faq": <HelpCircle size={20} />,
  accueil: <Home size={20} />,
  recherche: <Search size={20} />,
  calendrier: <Calendar size={20} />,
  notifications: <Bell size={20} />,
  favoris: <Heart size={20} />,
  recommandations: <Star size={20} />,
  nouveautes: <Sparkles size={20} />,
};

interface SidebarSection {
  section: string;
  links: { key: string; label: string }[];
}

interface UserAccountNavigationProps {
  activeRole: Role | null;
  sidebarLinks: SidebarSection[];
  onLogout: () => void;
  onSwitchRole: () => void;
  switchButtonText: string;
  onSectionChange?: (section: string) => void;
}

export const UserAccountNavigation = ({
  activeRole,
  sidebarLinks,
  onLogout,
  onSwitchRole,
  switchButtonText,
  onSectionChange,
}: UserAccountNavigationProps) => {
  const router = useRouter();
  const { signOut } = useAuth();
  const [activeLink, setActiveLink] = useState<string>("dashboard");

  const handleLogoutUser = async () => {
    try {
      await signOut();
      toast.success("À bientôt");
      router.replace("/connexion");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la déconnexion");
    }
  };

  const handleLinkClick = (key: string) => {
    setActiveLink(key);
    if (onSectionChange) {
      onSectionChange(key);
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header avec titre du rôle - Optionnel */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <User size={16} className="text-indigo-600" />
          </div>
          <div>
            <Typography 
              variant="caption-medium" 
              className="text-gray-900 font-semibold"
            >
              {activeRole?.nom || "Espace Utilisateur"}
            </Typography>
          </div>
        </div>
      </div>

      {/* Navigation Links - Partie défilable */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        {sidebarLinks.map((section) => 
          section.links.map((link) => (
            <button
              key={link.key}
              onClick={() => handleLinkClick(link.key)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group hover:shadow-sm ${
                activeLink === link.key
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg transform scale-[1.02]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1"
              }`}
            >
              <span className={`mr-3 transition-colors duration-200 ${
                activeLink === link.key 
                  ? "text-white" 
                  : "text-gray-400 group-hover:text-indigo-500"
              }`}>
                {iconMap[link.key]}
              </span>
              <span className="truncate">{link.label}</span>
              {activeLink === link.key && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full opacity-80"></div>
              )}
            </button>
          ))
        )}
      </div>

      {/* Bottom Actions - Partie fixe */}
      <div className="flex-shrink-0 px-3 py-4 border-t border-gray-100 bg-gray-50/50 space-y-3">
        {switchButtonText && (
          <button
            onClick={onSwitchRole}
            className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 hover:shadow-sm transition-all duration-200 border border-indigo-100 hover:border-indigo-200"
          >
            <div className="flex items-center">
              <div className="w-2 h-2 bg-indigo-400 rounded-full mr-2 animate-pulse"></div>
              {switchButtonText}
            </div>
          </button>
        )}
        
        <button
          onClick={handleLogoutUser}
          className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 border border-transparent hover:border-red-100 hover:shadow-sm"
        >
          <LogOut size={16} className="mr-2" />
          Déconnexion
        </button>
      </div>
    </div>
  );
};