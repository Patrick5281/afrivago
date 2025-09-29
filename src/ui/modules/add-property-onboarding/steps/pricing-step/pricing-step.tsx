import { BaseComponentProps } from "@/types/onboarding-steps-List";
import { OnboardingTabs } from "../../components/tabs/onboarding-tabs";
import { OnboardingFooter } from "../../components/footer/onboarding-footer";
import { Container } from "@/ui/components/container/container";
import { Typography } from "@/ui/design-system/typography/typography";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { usePropertyOnboardingStore } from "../../context/propertyOnboarding.store";
import { toast } from "react-toastify";
import Image from "next/image";
import { useCurrencyStore } from '@/store/currencyStore';

interface PricingFormData {
  amount: number;
  currency: string;
}

interface PlatformCommission {
  id: string;
  percentage: number;
  is_active: boolean;
}

interface Currency {
  code: string;
  name: string;
}

export const PricingStep = ({
  prev,
  next,
  isFirstStep,
  isFinalStep,
  stepsList,
  getCurrentStep,
}: BaseComponentProps) => {
  const { propertyId, rentalType } = usePropertyOnboardingStore();
  const setPropertyId = usePropertyOnboardingStore(state => state.setPropertyId);
  const [loading, setLoading] = useState(false);
  const [commission, setCommission] = useState<PlatformCommission | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [unitTotal, setUnitTotal] = useState<number | null>(null);
  const [unitCurrency, setUnitCurrency] = useState<string>('EUR');
  const { currency: globalCurrency } = useCurrencyStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PricingFormData>({
    defaultValues: {
      currency: 'EUR' // Devise par défaut
    }
  });

  const amount = watch('amount');
  const selectedCurrency = watch('currency');

  // Charger les devises disponibles
  useEffect(() => {
    const loadCurrencies = async () => {
      const res = await fetch('/api/property/pricing?type=currencies');
      const data = await res.json();
      console.log('Currencies API response:', data);
      setCurrencies(Array.isArray(data) ? data : []);
    };
    loadCurrencies();
  }, []);

  // Charger la commission active
  useEffect(() => {
    const loadCommission = async () => {
      const res = await fetch('/api/property/pricing?type=commission');
      const data = await res.json();
      setCommission(data);
    };
    loadCommission();
  }, []);

  // Charger le prix existant ou le total des unités si rentalType === 'unit'
  useEffect(() => {
    const loadPricing = async () => {
      if (!propertyId) return;
      if (rentalType === 'unit') {
        // Fetch all rental units and sum their price_per_month (déjà net)
        const res = await fetch(`/api/property/rental-units?propertyId=${propertyId}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const total = data.reduce((sum, unit) => sum + Number(unit.price_per_month || 0), 0);
          setUnitTotal(total);
          setUnitCurrency(data[0].currency || 'EUR');
          setValue('amount', undefined); // Champ vide
          setValue('currency', data[0].currency || 'EUR');
          console.log('[DEBUG][pricing-step] units:', data, 'total:', total);
        } else {
          setUnitTotal(0);
          setUnitCurrency('EUR');
          setValue('amount', undefined);
          setValue('currency', 'EUR');
        }
      } else {
        // Cas normal (entire)
        const res = await fetch(`/api/property/pricing?type=pricing&propertyId=${propertyId}`);
        const data = await res.json();
        if (data) {
          setValue('amount', data.amount);
          setValue('currency', data.currency || 'EUR');
        }
      }
    };
    loadPricing();
  }, [propertyId, setValue, rentalType]);

  useEffect(() => {
    if (!propertyId) {
      const storedId = localStorage.getItem('onboarding_property_id');
      if (storedId) {
        setPropertyId(storedId);
      }
    }
  }, [propertyId, setPropertyId]);

  const calculateNetPrice = (price: number) => {
    if (!commission) return price;
    return price - (price * commission.percentage / 100);
  };

  const getCommissionAmount = (price: number) => {
    if (!commission) return 0;
    return price * commission.percentage / 100;
  };

  const getCurrencySymbol = (currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode);
    // Mapper les codes de devise vers leurs symboles
    const symbols: { [key: string]: string } = {
      'EUR': '€',
      'USD': '$',
      'GBP': '£',
      'JPY': '¥',
      'CHF': 'CHF',
      'CAD': 'C$',
      'AUD': 'A$',
      'XOF': 'CFA', // Franc CFA (couramment utilisé au Bénin)
    };
    return symbols[currencyCode] || currencyCode;
  };

  const onSubmit = async (data: PricingFormData) => {
    if (!propertyId) return;
    setLoading(true);
    try {
      let amountToSave = data.amount;
      let currencyToSave = data.currency;
      if (rentalType === 'unit') {
        amountToSave = unitTotal || 0;
        currencyToSave = globalCurrency || 'XOF';
      }
      await fetch('/api/property/pricing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, amount: amountToSave, currency: currencyToSave })
      });
      toast.success('Prix enregistré avec succès');
      next();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde du prix');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen bg-gray-50">
      <div className="h-full overflow-auto">
        <Container className="grid h-full grid-cols-12 gap-10 px-6 py-1 items-center">
          {/* Formulaire côté gauche */}
          <div className="col-span-12 lg:col-span-6 space-y-5">
            <div className="space-y-3">
              <Typography variant="h1">Loyer mensuel</Typography>
              <Typography variant="body-lg">
                La plateforme appliquera une commission de {commission?.percentage ?? 0}%, déduite automatiquement du montant que vous définissez ici.
              </Typography>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Typography variant="body-sm" weight="regular">
                  Loyer mensuel
                </Typography>
                <div className="flex overflow-hidden rounded border border-gray-400 focus-within:ring-2 focus-within:ring-primary">
                  <input
                    step="0.01"
                    placeholder="0.00"
                    {...register("amount", {
                      required: rentalType !== 'unit' ? "Le prix mensuel est requis" : false,
                      min: { value: 0, message: "Le prix doit être positif" },
                      valueAsNumber: true,
                    })}
                    className="flex-1 px-4 py-2 bg-gray-400 focus:outline-none"
                    disabled={rentalType === 'unit'}
                    readOnly={rentalType === 'unit'}
                    value={rentalType === 'unit' ? '' : amount || ''}
                  />
                  <select
                    {...register("currency", {
                      required: "La devise est requise",
                    })}
                    className="bg-primary/10 border-l px-3 text-sm focus:outline-none"
                    disabled={rentalType === 'unit'}
                  >
                    {Array.isArray(currencies) && currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.amount && (
                  <Typography className="text-sm text-red-600 mt-1">{errors.amount.message}</Typography>
                )}
                {errors.currency && (
                  <Typography className="text-sm text-red-600 mt-1">{errors.currency.message}</Typography>
                )}
              </div>
            </form>

            {/* Montant net en direct */}
            <div className="space-y-4">
              <div className="rounded bg-primary/10 shadow-md p-6 text-center">
                <Typography variant="body-lg">Votre solde mensuel</Typography>
                <Typography variant="h4">
                  {rentalType === 'unit'
                    ? ((typeof unitTotal === 'number' && !isNaN(unitTotal) ? unitTotal : 0).toFixed(0) + ' ' + getCurrencySymbol(globalCurrency || 'CFA'))
                    : ((typeof amount === 'number' && !isNaN(amount) ? calculateNetPrice(amount) : 0).toFixed(0) + ' ' + getCurrencySymbol(globalCurrency || 'CFA'))}
                </Typography>
              </div>
            </div>


          </div>

          {/* Illustration à droite */}
          <div className="col-span-12 lg:col-span-6 flex items-center justify-center">
            <Image
              src="/assets/svg/pig.svg"
              alt="Illustration tirelire"
              width={350}
              height={350}
              className="drop-shadow-lg"
            />
          </div>
        </Container>

        {/* Footer */}
        <OnboardingFooter
          prev={prev}
          next={handleSubmit(onSubmit)}
          isFirstStep={isFirstStep}
          isFinalStep={isFinalStep}
          isLoading={loading}
        />
      </div>
    </div>
  );
};