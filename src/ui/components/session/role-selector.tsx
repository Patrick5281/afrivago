import React from 'react';
import { Role } from '@/types/roles';
import { useRouter } from 'next/router';
// import { handleRoleSelection } from '@/services/roleServices';

interface RoleSelectorProps {
  roles: Role[];
  onSelect: (role: Role) => void;
}

const RoleSelectorModal: React.FC<RoleSelectorProps> = ({
  roles,
  onSelect,
}) => {
  // const router = useRouter();

  return (
    // Overlay modal
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Sélectionnez votre rôle</h2>
          <p className="text-gray-600 mt-2">
            Vous avez plusieurs rôles. Veuillez sélectionner le rôle avec lequel vous souhaitez vous connecter.
          </p>
        </div>

        <div className="space-y-3">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => onSelect(role)}
              className="w-full p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors flex flex-col items-start"
            >
              <span className="font-medium text-lg text-gray-800">{role.nom}</span>
              {role.description && (
                <span className="text-sm text-gray-600 mt-1">{role.description}</span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          Vous ne pourrez pas accéder à votre espace sans avoir sélectionné un rôle.
        </div>
      </div>
    </div>
  );
};

export default RoleSelectorModal;