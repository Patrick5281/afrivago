import React, { createContext, useContext, useState } from 'react';

interface PropertyOnboardingContextType {
  propertyType: string | null;
  setPropertyType: (type: string | null) => void;
  rentalType: string | null;
  setRentalType: (type: string | null) => void;
  resetContext: () => void;
}

const PropertyOnboardingContext = createContext<PropertyOnboardingContextType | undefined>(undefined);

export const PropertyOnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [propertyType, setPropertyType] = useState<string | null>(null);
  const [rentalType, setRentalType] = useState<string | null>(null);

  const resetContext = () => {
    setPropertyType(null);
    setRentalType(null);
  };

  return (
    <PropertyOnboardingContext.Provider value={{ 
      propertyType, 
      setPropertyType,
      rentalType,
      setRentalType,
      resetContext
    }}>
      {children}
    </PropertyOnboardingContext.Provider>
  );
};

export const usePropertyOnboarding = () => {
  const context = useContext(PropertyOnboardingContext);
  if (!context) {
    throw new Error('usePropertyOnboarding must be used within a PropertyOnboardingProvider');
  }
  return context;
}; 