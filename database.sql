-- Table: public.contrats_locatifs

-- DROP TABLE IF EXISTS public.contrats_locatifs;

CREATE TABLE IF NOT EXISTS public.contrats_locatifs
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    reservation_id uuid NOT NULL,
    paiement_id uuid NOT NULL,
    locataire_id uuid NOT NULL,
    locataire_nom character varying COLLATE pg_catalog."default" NOT NULL,
    locataire_prenom character varying COLLATE pg_catalog."default" NOT NULL,
    locataire_email character varying COLLATE pg_catalog."default" NOT NULL,
    logement_id uuid NOT NULL,
    logement_nom character varying COLLATE pg_catalog."default" NOT NULL,
    logement_adresse text COLLATE pg_catalog."default" NOT NULL,
    logement_type character varying COLLATE pg_catalog."default" NOT NULL,
    superficie numeric,
    equipements text COLLATE pg_catalog."default",
    clauses text COLLATE pg_catalog."default",
    date_arrivee date NOT NULL,
    date_depart date NOT NULL,
    caution numeric NOT NULL,
    caution_payee numeric NOT NULL,
    loyer_mensuel numeric NOT NULL,
    statut character varying COLLATE pg_catalog."default" NOT NULL DEFAULT 'généré'::character varying,
    pdf_url text COLLATE pg_catalog."default",
    date_generation timestamp with time zone DEFAULT now(),
    date_signature timestamp with time zone,
    CONSTRAINT contrats_locatifs_pkey PRIMARY KEY (id),
    CONSTRAINT contrats_locatifs_locataire_id_fkey FOREIGN KEY (locataire_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT contrats_locatifs_logement_id_fkey FOREIGN KEY (logement_id)
        REFERENCES public.properties (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT contrats_locatifs_paiement_id_fkey FOREIGN KEY (paiement_id)
        REFERENCES public.paiements (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT contrats_locatifs_reservation_id_fkey FOREIGN KEY (reservation_id)
        REFERENCES public.reservations (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.contrats_locatifs
    OWNER to postgres;

-- Table: public.general_equipments

-- DROP TABLE IF EXISTS public.general_equipments;

CREATE TABLE IF NOT EXISTS public.general_equipments
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT general_equipments_pkey PRIMARY KEY (id),
    CONSTRAINT general_equipments_name_key UNIQUE (name)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.general_equipments
    OWNER to postgres;

-- Table: public.paiements

-- DROP TABLE IF EXISTS public.paiements;

CREATE TABLE IF NOT EXISTS public.paiements
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    reservation_id uuid NOT NULL,
    type character varying COLLATE pg_catalog."default" NOT NULL,
    amount numeric NOT NULL,
    status character varying COLLATE pg_catalog."default" NOT NULL DEFAULT 'pending'::character varying,
    kkiapay_transaction_id character varying COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    payment_method_id integer,
    payer_phone character varying COLLATE pg_catalog."default",
    payer_email character varying COLLATE pg_catalog."default",
    period date,
    CONSTRAINT payments_pkey PRIMARY KEY (id),
    CONSTRAINT payments_payment_method_id_fkey FOREIGN KEY (payment_method_id)
        REFERENCES public.payment_methods (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT payments_reservation_id_fkey FOREIGN KEY (reservation_id)
        REFERENCES public.reservations (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT payments_type_check CHECK (type::text = ANY (ARRAY['caution'::character varying::text, 'monthly'::character varying::text])),
    CONSTRAINT payments_status_check CHECK (status::text = ANY (ARRAY['pending'::character varying::text, 'completed'::character varying::text, 'failed'::character varying::text, 'refunded'::character varying::text]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.paiements
    OWNER to postgres;

-- Table: public.payment_methods

-- DROP TABLE IF EXISTS public.payment_methods;

CREATE TABLE IF NOT EXISTS public.payment_methods
(
    id integer NOT NULL DEFAULT nextval('payment_methods_id_seq'::regclass),
    label character varying COLLATE pg_catalog."default" NOT NULL,
    is_active boolean DEFAULT true,
    CONSTRAINT payment_methods_pkey PRIMARY KEY (id),
    CONSTRAINT payment_methods_label_key UNIQUE (label)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.payment_methods
    OWNER to postgres;

-- Table: public.payment_methods

-- DROP TABLE IF EXISTS public.payment_methods;

CREATE TABLE IF NOT EXISTS public.payment_methods
(
    id integer NOT NULL DEFAULT nextval('payment_methods_id_seq'::regclass),
    label character varying COLLATE pg_catalog."default" NOT NULL,
    is_active boolean DEFAULT true,
    CONSTRAINT payment_methods_pkey PRIMARY KEY (id),
    CONSTRAINT payment_methods_label_key UNIQUE (label)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.payment_methods
    OWNER to postgres;

-- Table: public.properties

-- DROP TABLE IF EXISTS public.properties;

CREATE TABLE IF NOT EXISTS public.properties
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    title character varying COLLATE pg_catalog."default" NOT NULL,
    property_type_id uuid,
    country_id uuid,
    city character varying COLLATE pg_catalog."default" NOT NULL,
    district character varying COLLATE pg_catalog."default",
    postal_code character varying COLLATE pg_catalog."default",
    full_address text COLLATE pg_catalog."default" NOT NULL,
    surface numeric NOT NULL,
    year_built integer,
    description text COLLATE pg_catalog."default",
    latitude numeric,
    longitude numeric,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    rental_type character varying COLLATE pg_catalog."default" DEFAULT 'entire'::character varying,
    statut character varying COLLATE pg_catalog."default" DEFAULT 'draft'::character varying,
    terms_accepted boolean DEFAULT false,
    terms_accepted_at timestamp with time zone,
    CONSTRAINT properties_pkey PRIMARY KEY (id),
    CONSTRAINT properties_country_id_fkey FOREIGN KEY (country_id)
        REFERENCES public.countries (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT properties_created_by_fkey FOREIGN KEY (created_by)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT properties_property_type_id_fkey FOREIGN KEY (property_type_id)
        REFERENCES public.property_types (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT properties_rental_type_check CHECK (rental_type::text = ANY (ARRAY['entire'::character varying::text, 'unit'::character varying::text])),
    CONSTRAINT properties_statut_check CHECK (statut::text = ANY (ARRAY['draft'::character varying::text, 'publie'::character varying::text, 'en_attente'::character varying::text]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.properties
    OWNER to postgres;

-- Table: public.property_general_equipments

-- DROP TABLE IF EXISTS public.property_general_equipments;

CREATE TABLE IF NOT EXISTS public.property_general_equipments
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    property_id uuid NOT NULL,
    equipment_id uuid NOT NULL,
    CONSTRAINT property_general_equipments_pkey PRIMARY KEY (id),
    CONSTRAINT property_general_equipments_equipment_id_fkey FOREIGN KEY (equipment_id)
        REFERENCES public.general_equipments (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT property_general_equipments_property_id_fkey FOREIGN KEY (property_id)
        REFERENCES public.properties (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.property_general_equipments
    OWNER to postgres;

-- Table: public.property_images

-- DROP TABLE IF EXISTS public.property_images;

CREATE TABLE IF NOT EXISTS public.property_images
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    property_id uuid,
    url text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT property_images_pkey PRIMARY KEY (id),
    CONSTRAINT property_images_property_id_fkey FOREIGN KEY (property_id)
        REFERENCES public.properties (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.property_images
    OWNER to postgres;

-- Table: public.property_non_habitable_rooms

-- DROP TABLE IF EXISTS public.property_non_habitable_rooms;

CREATE TABLE IF NOT EXISTS public.property_non_habitable_rooms
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    property_id uuid NOT NULL,
    room_type_id uuid NOT NULL,
    surface numeric NOT NULL,
    quantity integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT property_non_habitable_rooms_pkey PRIMARY KEY (id),
    CONSTRAINT fk_property FOREIGN KEY (property_id)
        REFERENCES public.properties (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_room_type FOREIGN KEY (room_type_id)
        REFERENCES public.non_habitable_room_types (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.property_non_habitable_rooms
    OWNER to postgres;

-- Table: public.property_pricing

-- DROP TABLE IF EXISTS public.property_pricing;

CREATE TABLE IF NOT EXISTS public.property_pricing
(
    property_id uuid NOT NULL,
    amount numeric NOT NULL,
    currency character varying COLLATE pg_catalog."default",
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT property_pricing_pkey PRIMARY KEY (property_id),
    CONSTRAINT property_pricing_currency_fkey FOREIGN KEY (currency)
        REFERENCES public.currencies (code) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT property_pricing_property_id_fkey FOREIGN KEY (property_id)
        REFERENCES public.properties (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.property_pricing
    OWNER to postgres;

-- Table: public.property_terms

-- DROP TABLE IF EXISTS public.property_terms;

CREATE TABLE IF NOT EXISTS public.property_terms
(
    property_id uuid NOT NULL,
    animals_allowed boolean DEFAULT false,
    parties_allowed boolean DEFAULT false,
    smoking_allowed boolean DEFAULT false,
    subletting_allowed boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT property_terms_pkey PRIMARY KEY (property_id),
    CONSTRAINT property_terms_property_id_fkey FOREIGN KEY (property_id)
        REFERENCES public.properties (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.property_terms
    OWNER to postgres;

-- Table: public.property_types

-- DROP TABLE IF EXISTS public.property_types;

CREATE TABLE IF NOT EXISTS public.property_types
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name character varying COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT property_types_pkey PRIMARY KEY (id),
    CONSTRAINT property_types_name_key UNIQUE (name)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.property_types
    OWNER to postgres;

-- Table: public.property_videos

-- DROP TABLE IF EXISTS public.property_videos;

CREATE TABLE IF NOT EXISTS public.property_videos
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    property_id uuid,
    url text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT property_videos_pkey PRIMARY KEY (id),
    CONSTRAINT property_videos_property_id_fkey FOREIGN KEY (property_id)
        REFERENCES public.properties (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.property_videos
    OWNER to postgres;

-- Table: public.rental_units

-- DROP TABLE IF EXISTS public.rental_units;

CREATE TABLE IF NOT EXISTS public.rental_units
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    property_id uuid NOT NULL,
    name character varying COLLATE pg_catalog."default" NOT NULL,
    price_per_month numeric NOT NULL,
    description text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT rental_units_pkey PRIMARY KEY (id),
    CONSTRAINT rental_units_property_id_fkey FOREIGN KEY (property_id)
        REFERENCES public.properties (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.rental_units
    OWNER to postgres;

-- Table: public.reservations

-- DROP TABLE IF EXISTS public.reservations;

CREATE TABLE IF NOT EXISTS public.reservations
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    property_id uuid,
    rental_unit_id uuid,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status character varying COLLATE pg_catalog."default" NOT NULL DEFAULT 'pending'::character varying,
    caution_paid boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT reservations_pkey PRIMARY KEY (id),
    CONSTRAINT reservations_property_id_fkey FOREIGN KEY (property_id)
        REFERENCES public.properties (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT reservations_rental_unit_id_fkey FOREIGN KEY (rental_unit_id)
        REFERENCES public.rental_units (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT reservations_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT reservations_status_check CHECK (status::text = ANY (ARRAY['pending'::character varying::text, 'validated'::character varying::text, 'cancelled'::character varying::text, 'expired'::character varying::text])),
    CONSTRAINT uniq_user_reservation_period EXCLUDE USING gist (
        user_id WITH =,
        COALESCE(rental_unit_id, property_id) WITH =,
        daterange(start_date, end_date, '[]'::text) WITH &&)

)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.reservations
    OWNER to postgres;
-- Index: idx_reservations_user_dates

-- DROP INDEX IF EXISTS public.idx_reservations_user_dates;

CREATE INDEX IF NOT EXISTS idx_reservations_user_dates
    ON public.reservations USING gist
    (user_id, daterange(start_date, end_date, '[]'::text))
    TABLESPACE pg_default;

-- Table: public.roles

-- DROP TABLE IF EXISTS public.roles;

CREATE TABLE IF NOT EXISTS public.roles
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    nom character varying COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT roles_pkey PRIMARY KEY (id),
    CONSTRAINT roles_nom_key UNIQUE (nom)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.roles
    OWNER to postgres;

-- Table: public.room_equipments

-- DROP TABLE IF EXISTS public.room_equipments;

CREATE TABLE IF NOT EXISTS public.room_equipments
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    room_id uuid,
    equipment_type_id uuid,
    quantity integer NOT NULL DEFAULT 1,
    custom_name character varying COLLATE pg_catalog."default",
    CONSTRAINT room_equipments_pkey PRIMARY KEY (id),
    CONSTRAINT room_equipments_equipment_type_id_fkey FOREIGN KEY (equipment_type_id)
        REFERENCES public.equipment_types (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT room_equipments_room_id_fkey FOREIGN KEY (room_id)
        REFERENCES public.rooms (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.room_equipments
    OWNER to postgres;

-- Table: public.room_photos

-- DROP TABLE IF EXISTS public.room_photos;

CREATE TABLE IF NOT EXISTS public.room_photos
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    room_id uuid,
    url text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT room_photos_pkey PRIMARY KEY (id),
    CONSTRAINT room_photos_room_id_fkey FOREIGN KEY (room_id)
        REFERENCES public.rooms (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.room_photos
    OWNER to postgres;

-- Table: public.room_type_equipments

-- DROP TABLE IF EXISTS public.room_type_equipments;

CREATE TABLE IF NOT EXISTS public.room_type_equipments
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    room_type_id uuid,
    equipment_type_id uuid,
    is_required boolean DEFAULT false,
    CONSTRAINT room_type_equipments_pkey PRIMARY KEY (id),
    CONSTRAINT room_type_equipments_equipment_type_id_fkey FOREIGN KEY (equipment_type_id)
        REFERENCES public.equipment_types (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT room_type_equipments_room_type_id_fkey FOREIGN KEY (room_type_id)
        REFERENCES public.room_types (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.room_type_equipments
    OWNER to postgres;

-- Table: public.room_types

-- DROP TABLE IF EXISTS public.room_types;

CREATE TABLE IF NOT EXISTS public.room_types
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT room_types_pkey PRIMARY KEY (id),
    CONSTRAINT room_types_name_key UNIQUE (name)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.room_types
    OWNER to postgres;

-- Table: public.rooms

-- DROP TABLE IF EXISTS public.rooms;

CREATE TABLE IF NOT EXISTS public.rooms
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    property_id uuid,
    room_type_id uuid,
    name character varying COLLATE pg_catalog."default" NOT NULL,
    surface numeric,
    description text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    rental_unit_id uuid,
    CONSTRAINT rooms_pkey PRIMARY KEY (id),
    CONSTRAINT rooms_property_id_fkey FOREIGN KEY (property_id)
        REFERENCES public.properties (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT rooms_rental_unit_id_fkey FOREIGN KEY (rental_unit_id)
        REFERENCES public.rental_units (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT rooms_room_type_id_fkey FOREIGN KEY (room_type_id)
        REFERENCES public.room_types (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.rooms
    OWNER to postgres;

-- Table: public.terms

-- DROP TABLE IF EXISTS public.terms;

CREATE TABLE IF NOT EXISTS public.terms
(
    id integer NOT NULL DEFAULT nextval('terms_id_seq'::regclass),
    label text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT terms_pkey PRIMARY KEY (id),
    CONSTRAINT terms_label_key UNIQUE (label)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.terms
    OWNER to postgres;

-- Table: public.typepiece

-- DROP TABLE IF EXISTS public.typepiece;

CREATE TABLE IF NOT EXISTS public.typepiece
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    labelle text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT typepiece_pkey PRIMARY KEY (id),
    CONSTRAINT typepiece_libelle_key UNIQUE (labelle)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.typepiece
    OWNER to postgres;

-- Table: public.piecesjustificatifs

-- DROP TABLE IF EXISTS public.piecesjustificatifs;

CREATE TABLE IF NOT EXISTS public.piecesjustificatifs
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid,
    type_piece_id uuid,
    numero_piece text COLLATE pg_catalog."default" NOT NULL,
    fichier_piece text COLLATE pg_catalog."default",
    titre_foncier text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT piecesjustificatifs_pkey PRIMARY KEY (id),
    CONSTRAINT piecesjustificatifs_type_piece_id_fkey FOREIGN KEY (type_piece_id)
        REFERENCES public.typepiece (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT piecesjustificatifs_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.piecesjustificatifs
    OWNER to postgres;

-- Table: public.user_roles

-- DROP TABLE IF EXISTS public.user_roles;

CREATE TABLE IF NOT EXISTS public.user_roles
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_roles_pkey PRIMARY KEY (id),
    CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id)
        REFERENCES public.roles (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.user_roles
    OWNER to postgres;

-- Table: public.notifications

CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL, -- destinataire
    type varchar(50) NOT NULL, -- ex: paiement, reservation, alerte, suggestion
    title varchar(255) NOT NULL, -- titre court
    message text NOT NULL, -- texte détaillé
    data jsonb, -- infos contextuelles (id du bien, montant, etc.)
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE CASCADE
);

-- Index pour retrouver rapidement les notifications d'un utilisateur
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- Table: public.users

-- DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    email text COLLATE pg_catalog."default",
    uid uuid DEFAULT uuid_generate_v4(),
    creation_date timestamp with time zone NOT NULL DEFAULT now(),
    name text COLLATE pg_catalog."default",
    surname text COLLATE pg_catalog."default",
    onboardingiscompleted boolean DEFAULT false,
    photourl text COLLATE pg_catalog."default",
    updated_at timestamp with time zone DEFAULT now(),
    password character varying(255) COLLATE pg_catalog."default" NOT NULL DEFAULT 'changeme'::character varying,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    email_verified boolean NOT NULL DEFAULT false,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;

-- ========================================
-- SYSTÈME DE PRÉFÉRENCES UTILISATEUR
-- ========================================

-- Table: public.preferences (table de référence)

CREATE TABLE IF NOT EXISTS public.preferences (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    label varchar(100) NOT NULL,
    category varchar(50) NOT NULL, -- 'status', 'zone', 'property_type', 'budget'
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT preferences_pkey PRIMARY KEY (id),
    CONSTRAINT preferences_label_key UNIQUE (label),
    CONSTRAINT preferences_category_check CHECK (
        category IN ('status', 'zone', 'property_type', 'budget')
    )
);

ALTER TABLE IF EXISTS public.preferences OWNER to postgres;

-- Table: public.user_preferences (table de liaison N vers N)

CREATE TABLE IF NOT EXISTS public.user_preferences (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    preference_id uuid NOT NULL,
    preference_weight integer DEFAULT 1, -- importance de la préférence (1-5)
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_preferences_pkey PRIMARY KEY (id),
    CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE CASCADE,
    CONSTRAINT user_preferences_preference_id_fkey FOREIGN KEY (preference_id)
        REFERENCES public.preferences (id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE CASCADE,
    CONSTRAINT user_preferences_unique UNIQUE (user_id, preference_id)
);

ALTER TABLE IF EXISTS public.user_preferences OWNER to postgres;

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_preference_id ON public.user_preferences(preference_id);
CREATE INDEX IF NOT EXISTS idx_preferences_category ON public.preferences(category);
CREATE INDEX IF NOT EXISTS idx_preferences_active ON public.preferences(is_active) WHERE is_active = true;

-- Insertion des données de référence pour les préférences

-- Préférences de statut
INSERT INTO public.preferences (label, category, description) VALUES
('student', 'status', 'Étudiant'),
('professional', 'status', 'Professionnel'),
('family', 'status', 'Famille'),
('others', 'status', 'Autres')
ON CONFLICT (label) DO NOTHING;

-- Préférences de zone (villes du Bénin)
INSERT INTO public.preferences (label, category, description) VALUES
('Cotonou', 'zone', 'Cotonou'),
('Porto-Novo', 'zone', 'Porto-Novo'),
('Lokossa', 'zone', 'Lokossa'),
('Parakou', 'zone', 'Parakou'),
('Abomey', 'zone', 'Abomey'),
('Natitingou', 'zone', 'Natitingou'),
('Ouidah', 'zone', 'Ouidah'),
('Bohicon', 'zone', 'Bohicon'),
('Calavi', 'zone', 'Calavi'),
('Djougou', 'zone', 'Djougou'),
('Kandi', 'zone', 'Kandi'),
('Malanville', 'zone', 'Malanville'),
('Sakété', 'zone', 'Sakété'),
('Comé', 'zone', 'Comé'),
('Grand-Popo', 'zone', 'Grand-Popo'),
('Allada', 'zone', 'Allada'),
('Aplahoué', 'zone', 'Aplahoué'),
('Bassila', 'zone', 'Bassila'),
('Covè', 'zone', 'Covè'),
('Dassa-Zoumè', 'zone', 'Dassa-Zoumè')
ON CONFLICT (label) DO NOTHING;

-- Préférences de type de logement
INSERT INTO public.preferences (label, category, description) VALUES
('studio', 'property_type', 'Studio'),
('apartment', 'property_type', 'Appartement'),
('house', 'property_type', 'Maison'),
('villa', 'property_type', 'Villa')
ON CONFLICT (label) DO NOTHING;

-- Préférences de budget (avec tranche initiale 10000-15000)
INSERT INTO public.preferences (label, category, description) VALUES
('10000-15000', 'budget', '10 000 - 15 000 FCFA'),
('15000-25000', 'budget', '15 000 - 25 000 FCFA'),
('25000-50000', 'budget', '25 000 - 50 000 FCFA'),
('50000-100000', 'budget', '50 000 - 100 000 FCFA'),
('100000-200000', 'budget', '100 000 - 200 000 FCFA'),
('200000-350000', 'budget', '200 000 - 350 000 FCFA'),
('350000-500000', 'budget', '350 000 - 500 000 FCFA'),
('500000+', 'budget', 'Plus de 500 000 FCFA')
ON CONFLICT (label) DO NOTHING;