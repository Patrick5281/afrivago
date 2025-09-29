export interface FormsType {
    control?: any;
    onSubmit: any; 
    errors: any;
    register: any
    isLoading: boolean;
    handleSubmit: any;
    getValues?: any;
    setValue?: any;
    watch?: any;
};
export interface RegisterFormFielsType {
    email: string;
    password: string;
    roleId: string; // Nouveau champ pour le rôle
};
export interface LoginFormFielsType {
    email: string;
    password: string;
};
export interface ForgetPasswordFormFielsType {
    email: string;
    password: string;
};


export interface OnboardingProfilStepFormFieldsType {
    name: string;
    surname: string;
    telephone: string;
    type_piece_id: string;
    numero_piece: string;
    fichier_piece: File[];
    titre_foncier?: File[];
};

export interface UserProfilStepFormFieldsType {
    name: string;
    surname: string;
    // Préférences utilisateur
    statut?: string;
    type_logement?: string;
    zone?: string;
    budget?: string;
};

export interface OnboardingGeneralInfosStepFormFieldsType {
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
}