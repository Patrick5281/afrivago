import { ReservationWithDetails } from "@/api/reservations";
import { Container } from "@/ui/components/container/container";
import { Typography } from "@/ui/design-system/typography/typography";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/ui/design-system/button/button";
import { MethodOfPaidModal } from "./components/method-of-paid";
import { useAuth } from "@/Context/AuthUserContext";
import dynamic from 'next/dynamic';
import Lottie from "lottie-react";
import noDataAnimation from "public/assets/svg/No Data Animation.json";

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'validated': return 'bg-yellow-200 text-green-700';
    case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
    case 'expired': return 'bg-gray-100 text-gray-700 border-gray-200';
    default: return 'bg-gray-100 text-gray-700 ';
  }
};

const getReservationStatus = (status: string) => {
  switch (status) {
    case 'pending': return 'En attente';
    case 'validated': return 'Validée';
    case 'cancelled': return 'Annulée';
    case 'expired': return 'Expirée';
    default: return 'Inconnu';
  }
};

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
};

interface Props {
  reservations: ReservationWithDetails[];
}

export const MesReservationsView = ({ reservations: initialReservations }: Props) => {
  const [reservations, setReservations] = useState(initialReservations);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const router = useRouter();
  const { authUser } = useAuth();

  const KKIAPAY_METHOD_ID = 1;

  const handlePayCaution = (reservationId: string) => {
    setSelectedReservationId(reservationId);
    setModalOpen(true);
  };

  const handleKkiapay = () => {
    setModalOpen(false);
  };

  const selectedReservation = reservations.find(r => r.id === selectedReservationId);
  let cautionAmount = 0;
  if (selectedReservation) {
    const monthlyPrice = selectedReservation.property_monthly_price || selectedReservation.unit_price_per_month || 0;
    const start = new Date(selectedReservation.start_date);
    const end = new Date(selectedReservation.end_date);
    const diffTime = end.getTime() - start.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = days > 0 ? Math.ceil(days / 30) : 0;
    if (months === 1) {
      cautionAmount = monthlyPrice;
    } else if (months >= 2) {
      cautionAmount = monthlyPrice * 2;
    }
  }

  const handleKkiapaySuccess = async (response: any) => {
    try {
      setIsLoading(selectedReservationId!);
      const res = await fetch("/api/reservation/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: selectedReservationId,
          transactionId: response.transactionId,
          payment_method_id: KKIAPAY_METHOD_ID,
          payer_email: authUser?.userDocument?.email || "",
          payer_name: authUser?.userDocument?.name || "",
          payer_surname: authUser?.userDocument?.surname || "",
          amount: cautionAmount
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Erreur lors de la validation du paiement");
      }
      const validatedReservation = await res.json();
      setReservations(prev => prev.map(r => r.id === selectedReservationId ? validatedReservation : r));
      toast.success("Caution payée et réservation validée !");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(null);
      setModalOpen(false);
    }
  };

  const handleKkiapayFailure = (error: any) => {
    toast.error("Le paiement a échoué ou a été annulé.");
    setModalOpen(false);
  };

  console.log('userDocument:', authUser?.userDocument);
// No found data
  if (reservations.length === 0) {
    return (
      <Container className="py-16">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Lottie
              animationData={noDataAnimation}
              loop
              style={{ width: 220, height: 220 }}
            />
          </div>
          <Typography variant="lead" >
            Vous n'avez pas encore de réservations
          </Typography>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            Découvrir les logements
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h4" component="h1" className="text-2xl font-bold text-gray-900">
        Mes réservations
      </Typography>
            <Typography variant="body-base" className="text-gray mt-1">
              Gérez vos réservations et paiements
            </Typography>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray">Toutes les réservations</span>
              <span className="bg-gray-100 text-black px-2 py-1 rounded-md text-xs font-medium">
                {reservations.length}
              </span>
            </div>
            <Button variant="secondary">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nouvelle réservation
              </div>
            </Button>

          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-300">
              <tr>
                <th className="px-3 py-2 text-center">
                  <Typography variant="body-base" weight="medium" className="font-bold">
                     Nº
                  </Typography>
                </th>
                <th className="px-3 py-2 text-center">
                  <Typography variant="body-base" weight="medium" className="font-bold" >
                    Logement
                  </Typography>   
                </th>
                <th className="px-3 py-2 text-center">
                  <Typography variant="body-base" weight="medium" className="font-bold">
                      Date début
                  </Typography>
                </th>
                 <th className="px-3 py-2 text-center">
                  <Typography variant="body-base" weight="medium" className="font-bold">
                      Date fin
                  </Typography>
                </th>
                 <th className="px-3 py-2 text-center">
                  <Typography variant="body-base" weight="medium" className="font-bold">
                     Montant caution
                  </Typography>
                </th>
                 <th className="px-3 py-2 text-center">
                  <Typography variant="body-base" weight="medium" className="font-bold">
                      Status
                  </Typography>
                </th>
                 <th className="px-3 py-2 text-center">
                  <Typography variant="body-base" weight="medium" className="font-bold">
                       Action
                  </Typography>
                </th> 
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-300">
              {reservations.map((reservation, index) => {
            const monthlyPrice = reservation.property_monthly_price || reservation.unit_price_per_month || 0;
            const start = new Date(reservation.start_date);
            const end = new Date(reservation.end_date);
            const diffTime = end.getTime() - start.getTime();
            const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const months = days > 0 ? Math.ceil(days / 30) : 0;
            let cautionAmount = 0;
            if (months === 1) {
              cautionAmount = monthlyPrice;
            } else if (months >= 2) {
              cautionAmount = monthlyPrice * 2;
            }
            const isPending = reservation.status === 'pending';
                const isValidated = reservation.status === 'validated';
            
            return (
                  <tr key={reservation.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Typography variant="body-base">
                        {reservation.id.slice(-8).toUpperCase()}
                  </Typography>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <Typography variant="body-base">
                    {reservation.property_title || reservation.unit_name}
                  </Typography>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <Typography variant="body-base">
                        {formatDate(reservation.start_date)}
                    </Typography>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                       <Typography variant="body-base">
                         {formatDate(reservation.end_date)}
                    </Typography>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <Typography variant="body-base">
                        {cautionAmount.toLocaleString()} FCFA
                    </Typography>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                      {getReservationStatus(reservation.status)}
                    </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                    {isPending ? (
                          <Button size="small" className="bg-blue-200 text-blue"
                          action={() => handlePayCaution(reservation.id)}
                          disabled={isLoading === reservation.id}
                          >
                            {isLoading === reservation.id ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Traitement...
                      </>
                    ) : (
                              'Payer'
                            )}
                          </Button>
                        ) : isValidated ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-secondary-300 text-green">
                            ✓ Payé
                          </span>
                        ) : null}
                        
                  </div>
                    </td>
                  </tr>
            );
          })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white px-6 py-3 border-t border-gray-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray">
              <Typography variant="body-base">Affichage 1 à {reservations.length} sur {reservations.length} entrées</Typography>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                ‹
              </button>
              <button className="px-3 py-1 bg-green-600 text-white rounded-md text-sm font-medium">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                2
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                3
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      <MethodOfPaidModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        amount={cautionAmount}
        email={authUser?.email || ""}
        phone={authUser?.userDocument?.phone || ""}
        onSuccess={handleKkiapaySuccess}
        onFailure={handleKkiapayFailure}
      />
    </Container>
  );
}; 