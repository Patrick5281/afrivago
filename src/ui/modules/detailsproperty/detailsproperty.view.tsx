import { Layout } from '@/ui/components/layout/layout';
import { Typography } from '@/ui/design-system/typography/typography';
import { Button } from '@/ui/design-system/button/button';
import { MapPin, Star, Heart, Share2, ArrowLeft, Wifi, Car, Utensils, Tv, Bath, Bed, Calendar } from 'lucide-react';
import Image from 'next/image';
import { FaBed, FaCouch, FaBriefcase, FaTv, FaWifi, FaCar, FaUtensils, FaShareAlt, FaEye, FaBoxOpen } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Container } from '@/ui/components/container/container';
import { Chat } from './components/chat'; 
import { MessageForm } from './components/msg';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import ReservationForm from './components/reservation-form';
import { useRouter } from 'next/router';
import { GalleryModal } from './components/galerie-modal';
import { Modal } from '@/ui/components/modal/Modal';
import { RoomOrUnitDetails } from './components/RoomOrUnitDetails';

interface Room {
  id: string;
  name: string;
  room_type_id: string;
  surface: number;
  description?: string;
  photos: string[];
  room_equipments?: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

interface NonHabitableRoom {
  id: string;
  room_type: {
    id: string;
    name: string;
  };
  surface: number;
  quantity: number;
}

interface RentalUnit {
  id: string;
  name: string;
  description: string;
  price: number;
  rooms: Array<{
    id: string;
    name: string;
    room_type_id: string;
    surface: number;
    description?: string;
    room_equipments: any[];
    room_photos: Array<{ url: string }>;
  }>;
}

interface PropertyDetails {
  id: string;
  title: string;
  description: string;
  property_type: {
    id: string;
    name: string;
  };
  status: string;
  city: string;
  country: string;
  address: string;
  property_images: Array<{ url: string }>;
  property_pricing: {
    amount: number;
    currency: string;
  };
  property_terms: {
    animals_allowed: boolean;
    parties_allowed: boolean;
    smoking_allowed: boolean;
    subletting_allowed: boolean;
  };
  rooms: Room[];
  nonHabitableRooms: NonHabitableRoom[];
  video?: {
    url: string;
  };
  rentalUnits: RentalUnit[];
  latitude?: number;
  longitude?: number;
}

interface Props {
  property: PropertyDetails;
  rooms: Room[];
  nonHabitableRooms: NonHabitableRoom[];
  propertyVideo?: { url: string };
  rentalUnits: RentalUnit[];
}

interface Caracteristiques {
  chambre: number;
  salon: number;
  bureau: number;
}

// Interface pour les données du formulaire
interface MessageFormData {
  fullName: string;
  phone?: string;
  email: string;
  message: string;
}

interface FormsType {
  onSubmit: (data: MessageFormData) => Promise<void>;
  handleSubmit: any;
  register: any;
  errors: any;
  isLoading: boolean;
}

interface ReservationFormProps {
  propertyId: string;
  monthlyPrice: number;
  onClose?: () => void;
}

const TERMS_LABELS: Record<string, string> = {
  animals_allowed: 'Animaux autorisés',
  parties_allowed: 'Fêtes autorisées',
  smoking_allowed: 'Fumer autorisé',
  subletting_allowed: 'Sous-location autorisée',
};

const amenities = [
  { icon: <Wifi size={20} />, label: 'Wifi gratuit' },
  { icon: <Car size={20} />, label: 'Parking gratuit' },
  { icon: <Utensils size={20} />, label: 'Cuisine équipée' },
  { icon: <Tv size={20} />, label: 'Télévision' },
  { icon: <Bath size={20} />, label: 'Salle de bain privée' },
  { icon: <Bed size={20} />, label: 'Linge de maison' },
];

const caracteristiqueIcons = [
  { key: 'chambre', icon: <FaBed className="text-gray-600" />, label: 'Chambre' },
  { key: 'salon', icon: <FaCouch className="text-gray-600" />, label: 'Salon' },
  { key: 'bureau', icon: <FaBriefcase className="text-gray-600" />, label: 'Bureau' },
];

// Mapping des icônes équipements
const nonHabitableIcons: Record<string, JSX.Element> = {
  'Garage': <FaCar className="text-green-700 text-xl" />,
  'Cuisine': <FaUtensils className="text-green-700 text-xl" />,
  'Salon': <FaCouch className="text-green-700 text-xl" />,
  'Salle de bain': <FaBed className="text-green-700 text-xl" />,
  'Télévision': <FaTv className="text-green-700 text-xl" />,
  'Connexion internet': <FaWifi className="text-green-700 text-xl" />,
};

export const DetailsPropertyView = ({ property, rooms, nonHabitableRooms = [], propertyVideo, rentalUnits = [] }: Props) => {
  // Carousel state
  const [imgIdx, setImgIdx] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  
  // Hook useForm pour gérer le formulaire
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<MessageFormData>();

  const images = property.property_images?.length ? property.property_images : [{ url: '/placeholder.jpg' }];

  // Auto défilement du slider
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setImgIdx((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [images.length]);

  const nextImg = () => setImgIdx((prev) => (prev + 1) % images.length);
  const prevImg = () => setImgIdx((prev) => (prev - 1 + images.length) % images.length);
  const galleryImages = [
    ...(property.property_images || []),
    ...rooms.flatMap(room => (room.photos || []).map(url => ({ url })))
  ];

  // Fonction pour obtenir l'index de l'image précédente
  const getPrevIndex = () => (imgIdx - 1 + images.length) % images.length;
  // Fonction pour obtenir l'index de l'image suivante
  const getNextIndex = () => (imgIdx + 1) % images.length;

  // Fonction pour gérer la soumission du formulaire
  const onSubmit = async (data: MessageFormData) => {
    try {
      console.log('Données du formulaire:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      reset();
      alert('Message envoyé avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      alert('Erreur lors de l\'envoi du message. Veuillez réessayer.');
    }
  };

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [selectedRoomOrUnit, setSelectedRoomOrUnit] = useState<any | null>(null);

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const router = useRouter();

  return (
    <div>
      {/* Section Image Carousel avec sidebar */}
      <div className="relative w-full h-[400px] bg-gray overflow-hidden">
        {/* Images du carousel */}
        <div className="flex h-full">
          {/* Image précédente (gauche) - 30% avec opacité */}
          <div className="relative w-[30%] h-full opacity-30">
            <Image
              src={images[getPrevIndex()]?.url || '/placeholder.jpg'}
              alt="Image précédente"
              fill
              className="object-cover"
            />
          </div>
          
          {/* Bouton de navigation gauche */}
          {images.length > 1 && (
            <button 
              onClick={prevImg} 
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg z-20 transition-all"
            >
              ◀
            </button>
          )}
          
          {/* Séparateur gauche */}
          <div className="w-4 bg-white"></div>
          
          {/* Image principale (centre) - 100% */}
          <div className="relative flex-1 h-full">
            <Image
              src={images[imgIdx]?.url || '/placeholder.jpg'}
              alt={property.title}
              fill
              className="object-cover"
              priority
            />
            
            {/* Compteur d'images */}
            <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded">
              {imgIdx + 1} / {images.length}
            </div>
          </div>
          
          {/* Séparateur droit */}
          <div className="w-4 bg-white"></div>
          
          {/* Image suivante (droite) - 30% avec opacité */}
          <div className="relative w-[30%] h-full opacity-30">
            <Image
              src={images[getNextIndex()]?.url || '/placeholder.jpg'}
              alt="Image suivante"
              fill
              className="object-cover"
            />
          </div>

          {/* Bouton de navigation droit */}
          {images.length > 1 && (
            <button 
              onClick={nextImg} 
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg z-20 transition-all"
            >
              ▶
            </button>
          )}
        </div>
      </div>

      {/* Section Info Property avec chevauchement */}
      <div className="relative -mt-20 z-30">
        <div className="bg-white mx-52 rounded shadow-lg pt-6 px-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant='lead' className="font-bold">
                {property.title}
              </Typography>
              <Typography variant="body-lg" className="font-semibold">
                {property.property_type.name}
              </Typography>
            </div>
            
            <div className="text-right inline-flex items-center space-x-2">
              <Typography variant='lead' className="text-primary">
                {property.property_pricing?.amount?.toLocaleString()} <span className="text-lg"> {/*property.property_pricing?.currency*/} FCFA / mois</span>
              </Typography>
              
            </div>
            <div className="">
            <Button
            variant='secondary'
              action={() => setShowReservationForm(true)}

            >
              Réserver maintenant
            </Button>
          </div>
          </div>
          <hr className="my-6" />
          
        </div>
      </div>

      {/* Reste du contenu */}
      <div className="min-h-screen bg-gray-50">
        <Container className="py-8">
          
          <div className='pb-14'>
            {/* LIGNE 1 : Caractéristiques + Localisation */}
            <div className="flex flex-row justify-between items-center px-12 pt-6 pb-2">
              <div className="flex flex-row gap-8 items-center">
                <span className="font-bold text-lg text-gray-800">Caractéristiques:</span>
                <div className="flex flex-row gap-6 items-center">
                  <FaBed className="text-green-700 text-xl" />
                  <span className="font-medium text-gray-700">2 Lits</span>
                  <FaTv className="text-green-700 text-xl ml-4" />
                  <span className="font-medium text-gray-700">1 Télévision</span>
                  <FaWifi className="text-green-700 text-xl ml-4" />
                  <span className="font-medium text-gray-700">1 Connexion internet</span>
                </div>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <MapPin className="text-green-700" size={20} />
                <span className="font-medium text-gray-700">{property.city}, {property.country}</span>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <button className="bg-white border border-gray-300 rounded p-2 hover:bg-gray-100">
                  <FaShareAlt className="text-gray-700" size={18} />
                </button>
                <button className="bg-white border border-gray-300 rounded p-2 hover:bg-gray-100">
                  <FaEye className="text-gray-700" size={18} />
                </button>
                <button className="bg-white border border-gray-300 rounded p-2 hover:bg-gray-100">
                  <Heart className="text-gray-700" size={18} />
                </button>
              </div>
            </div>
          </div>
          

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* DESCRIPTION */}
              <div className="px-12 py-4">
                <span className="font-bold text-lg text-gray-800 block mb-1">Description</span>
                <span className="text-gray-700 text-base leading-relaxed">{property.description}</span>
              </div>

              <hr className="my-6" />

              {/* EQUIPEMENTS */}
              <div className="px-12 py-4">
                <span className="font-bold text-lg text-gray-800 block mb-2">Quelques équipements</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {nonHabitableRooms.length > 0 ? nonHabitableRooms.map((room: any) => (
                    <div key={room.id} className="flex items-center gap-2 bg-gray-50 rounded p-2">
                      {nonHabitableIcons[room.room_type?.name] || <FaBoxOpen className="text-green-700 text-xl" />} 
                      <span className="font-semibold text-gray-800">{room.room_type?.name}</span>
                      {room.quantity && <span className="ml-1 text-gray-600">{room.quantity > 1 ? `x${room.quantity}` : ''}</span>}
                    </div>
                  )) : <span className="text-gray-500">Aucun équipement renseigné</span>}
                </div>
              </div>

              <hr className="my-6" />

              {/* SECTION PIECES ET UNITES LOCATIVES */}
              <div className="px-12 space-y-4 py-2">
                <Typography variant='lead'>Pièces et unités locatives </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoomOrUnit(room)}
                      className="group rounded border border-gray-600 shadow-lg hover:shadow-green-400 hover:bg-gray-400 transition-all cursor-pointer p-4 flex flex-col items-center relative max-w-xs w-full"
                    >
                      {/* Badge Pièce 
                                             <span className="absolute top-4 left-4 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">Pièce</span>

                      */}

                      {/* Image principale */}
                      {room.photos && room.photos.length > 0 && (
                        <div className="w-20 h-20 mb-3 rounded overflow-hidden shadow-sm">
                              <Image
                            src={room.photos[0]}
                            alt={room.name}
                            width={80}
                            height={80}
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      {/* Nom et surface */}
                      <div className="w-full text-center">
                        <Typography variant='lead'>{room.name}</Typography>
                        <Typography variant='body-base' className="text-sm text-gray-500 mb-1">Surface : {room.surface} m²</Typography>
                        {room.description && (
                          <Typography variant='body-base' className="text-xs text-gray-600 mb-2 line-clamp-2">{room.description}</Typography>
                        )}
                      </div>
                      {/* Miniatures */}
                      {room.photos && room.photos.length > 1 && (
                        <div className="flex gap-1 mt-2">
                          {room.photos.slice(1, 4).map((url, idx) => (
                            <div key={idx} className="w-8 h-8 rounded overflow-hidden border">
                              <Image src={url} alt={`Miniature ${idx + 2}`} width={32} height={32} className="object-cover" />
                            </div>
                          ))}
                          {room.photos.length > 4 && (
                            <span className="text-xs text-gray-400 ml-1">+{room.photos.length - 4}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {rentalUnits.map((unit) => (
                    <div
                      key={unit.id}
                      onClick={() => setSelectedRoomOrUnit(unit)}
                      className="group rounded border border-gray-600 shadow-lg hover:shadow-blue-400 hover:bg-gray-400 transition-all cursor-pointer p-4 flex flex-col items-center relative max-w-xs w-full"
                    >
                      {/* Badge Unité */}
                      <span className="absolute top-4 left-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">Unité</span>
                      {/* Image principale de la première pièce de l'unité */}
                      {unit.rooms && unit.rooms.length > 0 && unit.rooms[0].room_photos && unit.rooms[0].room_photos.length > 0 && (
                        <div className="w-20 h-20 mb-3 rounded overflow-hidden shadow-sm">
                          <Image
                            src={unit.rooms[0].room_photos[0].url}
                            alt={unit.name}
                            width={80}
                            height={80}
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      {/* Nom et surface */}
                      <div className="w-full text-center">
                        <div className="font-bold text-lg text-gray-900 mb-1">{unit.name}</div>
                        <div className="text-sm text-gray-500 mb-1">Surface : {unit.rooms && unit.rooms.length > 0 && unit.rooms[0].surface ? unit.rooms[0].surface + ' m²' : 'N/A'}</div>
                        {unit.rooms && unit.rooms.length > 0 && unit.rooms[0].description && (
                          <div className="text-xs text-gray-600 mb-2 line-clamp-2">{unit.rooms[0].description}</div>
                        )}
                      </div>
                      {/* Miniatures des pièces de l'unité */}
                      {unit.rooms && unit.rooms.length > 1 && (
                        <div className="flex gap-1 mt-2">
                          {unit.rooms.slice(1, 4).map((r, idx) => (
                            r.room_photos && r.room_photos[0] && (
                              <div key={r.id} className="w-8 h-8 rounded overflow-hidden border">
                                <Image src={r.room_photos[0].url} alt={`Miniature ${idx + 2}`} width={32} height={32} className="object-cover" />
                              </div>
                            )
                          ))}
                          {unit.rooms.length > 4 && (
                            <span className="text-xs text-gray-400 ml-1">+{unit.rooms.length - 4}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {rooms.length === 0 && rentalUnits.length === 0 && (
                    <div className="text-gray-500">Aucune pièce ou unité locative renseignée</div>
                  )}
                </div>
              </div>

              <hr className="my-6" />

              {/* VIDEO */}
              <div className="px-12 py-4 space-y-4">
                <Typography variant='lead'> Vidéo de présentation</Typography>
                {propertyVideo && propertyVideo.url ? (
                  <video src={propertyVideo.url} controls className="rounded w-full max-w-xl" />
                ) : (
                  <Typography variant='lead'>Aucune vidéo disponible</Typography>
                )}
              </div>

              {/* Reviews */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  <Typography variant="h2" className="text-xl font-semibold">
                    4.8 • 12 commentaires
                  </Typography>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Sample reviews */}
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-semibold">P</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">Prosper</span>
                          <span className="text-sm text-gray-500">Mars 2024</span>
                        </div>
                        <div className="flex gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <Typography variant="body-sm" className="text-gray-700">
                          Séjour chez Raphaël, très bien accueilli dans sa maison où règne une bonne ambiance.
                        </Typography>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-semibold">G</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">Gabin</span>
                          <span className="text-sm text-gray-500">Mars 2024</span>
                        </div>
                        <div className="flex gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <Typography variant="body-sm" className="text-gray-700">
                          Raphaël est une personne sérieuse. Il est dans l'échange et la bienveillance.
                        </Typography>
                      </div>
                    </div>
                  </div>
                   {/* Sample reviews */}
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-semibold">P</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">Prosper</span>
                          <span className="text-sm text-gray-500">Mars 2024</span>
                        </div>
                        <div className="flex gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <Typography variant="body-sm" className="text-gray-700">
                          Séjour chez Raphaël, très bien accueilli dans sa maison où règne une bonne ambiance.
                        </Typography>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-semibold">G</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">Gabin</span>
                          <span className="text-sm text-gray-500">Mars 2024</span>
                        </div>
                        <div className="flex gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <Typography variant="body-sm" className="text-gray-700">
                          Raphaël est une personne sérieuse. Il est dans l'échange et la bienveillance.
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>

                <Button variant='accent' size='small'>
                  Afficher plus de commentaires
                </Button>
              </div>
                            {/* SECTION MAPS LOCALISATION */}
              <div className="px-12 py-8">
                <Typography variant="lead" className="mb-2">Localisation du bien</Typography>
                <div className="w-full h-72 rounded-lg overflow-hidden shadow">
                  {isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={{ lat: property.latitude ?? 6.3703, lng: property.longitude ?? 2.3912 }}
                      zoom={15}
                    >
                      <Marker position={{ lat: property.latitude ?? 6.3703, lng: property.longitude ?? 2.3912 }} />
                    </GoogleMap>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Localisation non disponible
                    </div>
                  )}
                </div>
              </div>
            </div>

            

            {/* Sidebar avec le formulaire de message */}
            <div className="lg:col-span-1 flex flex-col gap-8">
           
              <MessageForm
                register={register}
                errors={errors}
                isLoading={isSubmitting}
                onSubmit={onSubmit}
                handleSubmit={handleSubmit}
              />

              {/* Galerie des photos améliorée */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
                <Typography variant='body-lg' >
                  Galerie des photos
                </Typography>
                
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-2 h-[280px]">
                    {/* Image principale - occupant les 2/3 gauche */}
                    <div className="col-span-2 row-span-2 relative group">
                      <div 
                        className="w-full h-full rounded-lg overflow-hidden cursor-pointer bg-gray-100"
                        onClick={() => { setGalleryIndex(0); setGalleryOpen(true); }}
                      >
                        <Image
                          src={galleryImages[0]?.url || '/placeholder.jpg'}
                          alt="Image principale"
                          fill
                          className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        />
                      </div>
                    </div>
                    
                    {/* Colonne droite avec 4 images plus petites */}
                    <div className="flex flex-col gap-2 h-full">
                      {galleryImages.slice(1, 5).map((img, idx) => (
                        <div
                          key={idx + 1}
                          className="relative flex-1 group"
                        >
                          <div
                            className="w-full h-full rounded-lg overflow-hidden cursor-pointer bg-gray-100"
                            onClick={() => { setGalleryIndex(idx + 1); setGalleryOpen(true); }}
                          >
                            <Image
                              src={img.url}
                              alt={`Photo ${idx + 2}`}
                              fill
                              className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                            />
                            
                            {/* Overlay +N sur la dernière image visible */}
                            {idx === 3 && galleryImages.length > 5 && (
                              <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
                                <span className="text-white text-xl font-semibold">
                                  +{galleryImages.length - 5}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Modale galerie d'images */}
                <GalleryModal
                  isOpen={galleryOpen}
                  onClose={() => setGalleryOpen(false)}
                  images={galleryImages}
                  initialIndex={galleryIndex}
                />
              </div>
            </div>
          </div>
        </Container>

        {/* Chat Component */}
        <Chat hostName="Raphaël" />
      </div>

      {/* Modal */}
      {selectedRoom && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <RoomOrUnitDetails data={selectedRoom} onClose={() => setIsModalOpen(false)} />
        </Modal>
      )}

      

      {/* Modal de réservation */}
      {showReservationForm && (
        <Modal isOpen={showReservationForm} onClose={() => setShowReservationForm(false)}>
            <ReservationForm
              propertyId={property.id}
            propertyType={property.property_type?.name === 'Unité' ? 'unit' : 'entire'}
            monthlyRent={property.property_pricing?.amount || 0}
            propertyName={property.title}
            location={property.city + ', ' + property.country}
            maxGuests={4}
              onClose={() => setShowReservationForm(false)}
            />
        </Modal>
      )}
      {selectedRoomOrUnit && (
        <Modal isOpen={!!selectedRoomOrUnit} onClose={() => setSelectedRoomOrUnit(null)}>
          <RoomOrUnitDetails data={selectedRoomOrUnit} onClose={() => setSelectedRoomOrUnit(null)} />
        </Modal>
      )}
    </div>
  );
};