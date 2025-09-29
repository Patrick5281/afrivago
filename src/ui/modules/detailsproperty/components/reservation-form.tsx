import React, { useState } from 'react';
import { Calendar, MapPin, Users, Clock, AlertCircle, Check } from 'lucide-react';
import { Select } from '@/ui/design-system/forms/select';
import { Button } from '@/ui/design-system/button/button';
import { Input } from '@/ui/design-system/forms/input';
import { Typography } from '@/ui/design-system/typography/typography';
import { useAuth } from '@/Context/AuthUserContext';

interface ReservationFormProps {
  propertyId?: string;
  rentalUnitId?: string;
  propertyType: 'entire' | 'unit';
  monthlyRent: number;
  propertyName: string;
  location: string;
  maxGuests?: number;
  unavailableDates?: string[];
  onClose?: () => void;
}

interface ReservationData {
  startDate: string;
  endDate: string;
  guests?: number;
}

const ReservationForm: React.FC<ReservationFormProps> = ({
  propertyId,
  rentalUnitId,
  propertyType,
  monthlyRent,
  propertyName,
  location,
  maxGuests = 4,
  unavailableDates = [],
  onClose
}) => {
  const [formData, setFormData] = useState<ReservationData>({
    startDate: '',
    endDate: '',
    guests: 1
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [reservationInfo, setReservationInfo] = useState<any>(null);
  const { authUser } = useAuth();
  const userId = authUser?.id;

  // Calculer le nombre de mois et le coût total
  const calculateStay = () => {
    if (!formData.startDate || !formData.endDate) return { days: 0, months: 0, totalCost: 0 };
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = end.getTime() - start.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = days > 0 ? Math.ceil(days / 30) : 0;
    const totalCost = months * monthlyRent;
    return { days, months, totalCost };
  };

  const { days, months, totalCost } = calculateStay();
  const cautionAmount = monthlyRent * 2; // Caution = 2 mois de loyer

  // Validation des dates
  const validateDates = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.startDate) {
      newErrors.startDate = "La date d'arrivée est requise";
    }
    if (!formData.endDate) {
      newErrors.endDate = "La date de départ est requise";
    }
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start >= end) {
        newErrors.endDate = "La date de départ doit être après la date d'arrivée";
      }
      if (start < new Date()) {
        newErrors.startDate = "La date d'arrivée ne peut pas être dans le passé";
      }
      // Vérification durée minimum 30 jours
      const diffTime = end.getTime() - start.getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (days < 30) {
        newErrors.endDate = "La durée minimum de réservation est d'un mois (30 jours)";
      }
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateDates();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (!userId) {
      setErrors({ submit: 'Vous devez être connecté pour réserver.' });
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const reservationData = {
        propertyId: propertyType === 'entire' ? propertyId : undefined,
        rentalUnitId: propertyType === 'unit' ? rentalUnitId : undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        guests: formData.guests
      };
      
      const response = await fetch('/api/reservation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId,
        },
        body: JSON.stringify(reservationData),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la réservation');
      }
      
      const result = await response.json();
      setReservationInfo(result);
      setSuccess(true);
      
    } catch (error) {
      setErrors({ submit: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ReservationData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (success && reservationInfo) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <Typography variant="h3" className="font-bold mb-2 text-green-700">
            Réservation enregistrée !
          </Typography>
          <Typography variant="body-base" className="text-gray-700 mb-2">
            Voici le récapitulatif de votre réservation :
          </Typography>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 mb-6">
          <Typography variant="body-base">Bien : <span className="font-semibold">{propertyName}</span></Typography>
          <Typography variant="body-base">Lieu : <span className="font-semibold">{location}</span></Typography>
          <Typography variant="body-base">Arrivée : <span className="font-semibold">{reservationInfo.startDate || formData.startDate}</span></Typography>
          <Typography variant="body-base">Départ : <span className="font-semibold">{reservationInfo.endDate || formData.endDate}</span></Typography>
          <Typography variant="body-base">Durée : <span className="font-semibold">{months} {months === 1 ? 'mois' : 'mois'}</span></Typography>
          <Typography variant="body-base">Prix mensuel : <span className="font-semibold">{monthlyRent.toLocaleString()} FCFA</span></Typography>
          <Typography variant="body-base">Total : <span className="font-semibold">{totalCost.toLocaleString()} FCFA</span></Typography>
        </div>
        <Button
          className="w-full py-4 px-6 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 active:scale-95 mb-2"
          action={() => window.location.href = `/mon-espace`}
        >
          Commencer la deuxième étape
        </Button>
        <Typography variant="body-sm" className="text-gray-500 mt-2">
          Vous pourrez payer la caution et compléter votre dossier à l'étape suivante.
        </Typography>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
     
      {/* En-tête */}
      <div className="flex items-center justify-between bg-secondary p-6 ">
        <Typography variant='lead' className="font-bold mb-2">Réserver maintenant</Typography>
           {/* Bouton fermer si onClose fourni */}
      {onClose && (
        <Button
          type="button"
          action={onClose}
          className="flex justify-end  z-10"
          aria-label="Fermer"
        >
          Fermer
        </Button>
      )}
      </div>
      {/* Corps du formulaire */}
      <form onSubmit={handleSubmit} className="p-6 space-y-10">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray mb-2">
              Arrivée
            </label>
            <div className="relative">
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.startDate ? 'border-red-500' : 'border-gray'
                }`}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray mb-2">
              Départ
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* Résumé des coûts */}
        {months > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <Typography variant='body-base'className="font-semibold">Résumé de la réservation</Typography>
            <div className="flex justify-between text-sm">
              <Typography  variant='body-base'>
                {months} {months === 1 ? 'mois' : 'mois'} x {monthlyRent.toLocaleString()} FCFA/mois
              </Typography>
              <Typography variant='body-base' className="font-medium">{totalCost.toLocaleString()} FCFA</Typography>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold">
                <Typography variant='body-base'>Total</Typography>
                <Typography variant='body-base'>{totalCost.toLocaleString()} FCFA</Typography>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-xs text-gray">
                  <Typography variant='body-sm' className="font-medium">Caution requise au 2ème niveau</Typography>
                  <Typography variant='body-sm'>Montant: {cautionAmount.toLocaleString()} FCFA (2 mois de loyer)</Typography>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Erreur générale */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex">
              <AlertCircle className="h-4 w-4 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Bouton de soumission */}
        <div className='flex justify-center'>
          <Button
          type="submit"
          disabled={isLoading || months === 0 || !userId}
          className={`py-4 px-6 rounded transition-all transform ${
            isLoading || months === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 active:scale-95'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Réservation en cours...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Clock className="h-5 w-5 mr-2" />
              Réserver maintenant
            </div>
          )}
        </Button>
        </div>
      
        {/* Note informative */}
        <div className="text-center">
          <Typography variant='body-sm' theme='primary' >Première étape de réservation - Aucun paiement requis maintenant</Typography>
          <Typography variant='body-sm' theme='primary'>La caution sera demandée dans votre tableau de bord</Typography>
        </div>
      </form>
    </div>
  );
};

export default ReservationForm;