import { useEffect, useState } from 'react';
import { Typography } from '@/ui/design-system/typography/typography';
import { toast } from 'react-toastify';
import { OnboardingFooter } from './onboarding-footer';
import { Currency } from '@/api/unit';

export default function Step3Pricing({ propertyId: propPropertyId, unitId, goPrev, currentStep, totalSteps, store, onFinish }: any) {
  const storePropertyId = store.propertyId;
  const propertyId = propPropertyId || storePropertyId;
  const [form, setForm] = useState({ price_per_month: '', currency: 'EUR' });
  const [commission, setCommission] = useState(0);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger la commission et les devises
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/unit/pricing');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error);
        }
        
        setCommission(data.commission.percentage);
        setCurrencies(data.currencies);
      } catch (error: any) {
        console.error('Erreur chargement données:', error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Pré-remplissage depuis le store
  useEffect(() => {
    setForm({
      price_per_month: store.draftData?.unit_step3_price_per_month || '',
      currency: store.draftData?.unit_step3_currency || 'EUR',
    });
  }, [store.draftData]);

  const netPrice = form.price_per_month ? Number(form.price_per_month) - (Number(form.price_per_month) * commission / 100) : 0;

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    store.updateDraftData({ [`unit_step3_${field}`]: value });
  };

  const handleNext = async () => {
    if (!form.price_per_month) {
      toast.error('Le prix mensuel est requis');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/unit/pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unitId,
          propertyId,
          price_per_month: Number(form.price_per_month),
          currency: form.currency,
          commission
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success('Prix enregistré');
      if (onFinish) onFinish();
    } catch (error: any) {
      console.error('Erreur enregistrement prix:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  console.log('[DEBUG][Step3Pricing] goPrev:', typeof goPrev, goPrev);
  console.log('[DEBUG][Step3Pricing] currentStep:', currentStep, 'totalSteps:', totalSteps);

  return (
    <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleNext(); }}>
      <Typography variant="lead">Définir le prix mensuel</Typography>
      <div>
        <label>Prix mensuel (avant commission)</label>
        <input 
          className="w-full border rounded p-2" 
          type="number" 
          value={form.price_per_month} 
          onChange={e => handleChange('price_per_month', e.target.value)} 
          required 
        />
      </div>
      
      <div className="text-red">
        Net perçu : <Typography variant='body-base' className='inline-block bg-secondary rounded px-2 py-1'>{isNaN(netPrice) ? 0 : netPrice.toFixed(2)} {form.currency}</Typography>
      </div>
      <OnboardingFooter
        next={handleNext}
        prev={goPrev}
        isFirstStep={() => currentStep === 1}
        isFinalStep={() => currentStep === totalSteps}
        isLoading={loading}
      />
    </form>
  );
} 