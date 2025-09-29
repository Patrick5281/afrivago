export interface DatabaseUserPreferences {
    id: string;
    user_id: string;
    full_name: string | null;
    destination: string;
    budget: string;
    housing_type: string;
    amenities: {
        internet: boolean;
        air_conditioning: boolean;
        pool: boolean;
        kitchen: boolean;
        office: boolean;
        fan: boolean;
        mixer: boolean;
        reception_room: boolean;
    };
    created_at: string;
    updated_at: string;
} 