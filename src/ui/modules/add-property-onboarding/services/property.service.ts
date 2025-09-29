export interface PropertyDraft {
  id?: string;
  title: string;
  property_type_id: string;
  country_id: string;
  city: string;
  district: string;
  postal_code: string;
  full_address: string;
  surface: number;
  year_built?: number;
  description: string;
  latitude?: number;
  longitude?: number;
  rental_type?: string;
  status: 'draft' | 'published';
  data?: Record<string, any>;
}

export const PropertyService = {
  async createDraft(): Promise<{ data: PropertyDraft | null; error: any }> {
    try {
      const response = await fetch('/api/properties/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'draft' }),
      });
      const result = await response.json();
      if (!response.ok) return { data: null, error: result.error };
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateDraft(propertyId: string, data: Partial<PropertyDraft>): Promise<{ error: any }> {
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) return { error: result.error };
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  async getDraft(propertyId: string): Promise<{ data: PropertyDraft | null; error: any }> {
    try {
      const response = await fetch(`/api/properties/${propertyId}`);
      const result = await response.json();
      if (!response.ok) return { data: null, error: result.error };
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async saveStepData(propertyId: string, stepData: any): Promise<{ error: any }> {
    try {
      const response = await fetch(`/api/properties/${propertyId}/step-data`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: stepData }),
      });
      const result = await response.json();
      if (!response.ok) return { error: result.error };
      return { error: null };
    } catch (error) {
      return { error };
    }
  }
};

