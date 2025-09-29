import React, { useState, useEffect } from 'react';
import { MesLocatairesView } from './mes-locataires.view';

export const MesLocatairesContainer = () => {
  const [locataires, setLocataires] = useState<any[]>([]);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [paiements, setPaiements] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard/owner-tenants')
      .then(res => res.json())
      .then(data => setLocataires(data));
  }, []);

  const handleShowDetails = async (reservationId: string) => {
    setSelectedReservationId(reservationId);
    setShowDetails(true);
    const res = await fetch(`/api/dashboard/owner-tenants/${reservationId}/paiements`);
    const data = await res.json();
    setPaiements(data);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setPaiements([]);
    setSelectedReservationId(null);
  };

  return (
    <MesLocatairesView
      locataires={locataires}
      onShowDetails={handleShowDetails}
      showDetails={showDetails}
      paiements={paiements}
      onCloseDetails={handleCloseDetails}
    />
  );
};

export default MesLocatairesContainer; 