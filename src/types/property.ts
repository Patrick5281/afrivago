export interface PropertyType {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  continent: string;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  title: string;
  property_type_id: string;
  country_id: string;
  city: string;
  district: string;
  postal_code?: string;
  full_address: string;
  surface: number;
  year_built?: number;
  description: string;
  latitude?: number;
  longitude?: number;
  status: 'draft' | 'published' | 'archived';
  created_by: string;
  created_at: string;
  updated_at: string;
  property_types?: { name: string };
  countries?: { name: string };
}

export interface PropertyFormData {
  title: string;
  propertyType: string;
  country: string;
  city: string;
  district: string;
  postalCode?: string;
  fullAddress: string;
  surface: number;
  yearBuilt?: number;
  description: string;
  latitude?: number;
  longitude?: number;
}

export interface PropertyError {
  field: keyof PropertyFormData;
  message: string;
} 

export interface GeneralEquipment {
  id: string;         // ou uuid selon ta DB
  name: string;
  description?: string;
  icon?: string;      // si tu veux une icône plus tard
}


export interface NonHabitableRoomType {
  id: string;
  name: string;
}