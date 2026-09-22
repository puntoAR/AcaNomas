export type CategoryId =
  | 'plomero'
  | 'electricista'
  | 'gasista'
  | 'podador'
  | 'pintor'
  | 'cerrajero'
  | 'albanil'
  | 'tecnico-refrigeracion'
  | 'otro';

export interface Category {
  id: string;
  name: string;
  icon: string;
  isPopular?: boolean;
}

export interface Provider {
  id: string;
  name: string;             // Nombre público (o nombre de fantasía/pila en modo protegido)
  realName?: string;         // Nombre real legal (privado si es protegido)
  category: string;         // Rubro principal
  customCategory?: string;   // Si eligió 'otro'
  isProtected: boolean;      // true = Perfil Protegido (oculta rostro y apellido real al público)
  avatar: string;            // URL de foto real o avatar genérico
  phone: string;             // WhatsApp para contacto
  zoneName: string;          // Barrio o zona de referencia en Balcarce
  location: {
    lat: number;
    lng: number;
  };
  coverageRadiusKm: number;  // Radio de cobertura en km
  isVerified: boolean;       // Identidad verificada con DNI por la plataforma
  dniStatus: 'verified' | 'pending' | 'rejected' | 'none';
  dniDocumentUrl?: string;
  isMatriculado: boolean;    // Para gasistas y electricistas matriculados
  matriculaNumber?: string;
  matriculaStatus: 'verified' | 'pending' | 'rejected' | 'none';
  matriculaDocumentUrl?: string;
  isPremium: boolean;        // Escudo Premium (5 estrellas / alta puntualidad / suscriptor)
  rating: number;            // Promedio de estrellas (ej. 4.9)
  reviewCount: number;
  punctualityScore: number;  // Porcentaje de puntualidad calculado (ej. 98%)
  servicesCompleted: number;
  bio: string;
  experienceYears: number;
  featuredWorkPhotos?: string[];
  createdAt: string;
}

export type ServiceStatus =
  | 'pendiente'
  | 'confirmado'
  | 'en_camino'
  | 'llegado'
  | 'finalizado'
  | 'cancelado'
  | 'reprogramado';

export type PunctualityStatus =
  | 'a_tiempo'
  | 'retraso_moderado'
  | 'incumplimiento'
  | 'reprogramado'
  | 'pendiente';

export interface ServiceRequest {
  id: string;
  providerId: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;     // Dirección en Balcarce (ej. "Calle 19 entre 22 y 24")
  clientCoords: {
    lat: number;
    lng: number;
  };
  serviceCategory: string;
  description: string;
  agreedDate: string;        // YYYY-MM-DD
  agreedTime: string;        // HH:MM (ej. "16:00")
  status: ServiceStatus;
  enRouteAt?: string;        // ISO Date
  arrivedAt?: string;        // ISO Date
  punctualityResult?: PunctualityStatus;
  minutesDiff?: number;      // Diferencia en minutos (positivo = tarde, negativo = temprano)
  providerCurrentLocation?: {
    lat: number;
    lng: number;
  };
  estimatedArrivalMinutes?: number;
  clientRated?: boolean;
  notes?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  providerId: string;
  clientName: string;
  punctualityRating: number; // 1-5 estrellas
  qualityRating: number;     // 1-5 estrellas
  priceRating: number;       // 1-5 estrellas
  averageRating: number;     // Calculado
  comment: string;
  punctualityTag?: PunctualityStatus;
  createdAt: string;
}

export type UserRole = 'admin' | 'prestador' | 'cliente';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  phone?: string;
  email?: string;
  providerId?: string; // Id de prestador vinculado si su rol es 'prestador'
}
