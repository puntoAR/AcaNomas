import { Provider, ServiceRequest, Review, Category, ServiceStatus } from '@/types';
import { evaluatePunctuality } from './punctuality';

export const BALCARCE_CENTER = {
  lat: -37.8483,
  lng: -58.2553,
  name: 'Plaza Libertad, Balcarce'
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'todos', name: 'Todos los oficios', icon: 'Sparkles', isPopular: true },
  { id: 'plomero', name: 'Plomero', icon: 'Wrench', isPopular: true },
  { id: 'electricista', name: 'Electricista', icon: 'Zap', isPopular: true },
  { id: 'gasista', name: 'Gasista', icon: 'Flame', isPopular: true },
  { id: 'podador', name: 'Podador / Jardinería', icon: 'Scissors', isPopular: true },
  { id: 'pintor', name: 'Pintor', icon: 'Paintbrush', isPopular: true },
  { id: 'cerrajero', name: 'Cerrajero', icon: 'KeyRound', isPopular: true },
  { id: 'albanil', name: 'Albañil', icon: 'Hammer', isPopular: false },
  { id: 'tecnico-refrigeracion', name: 'Refrigeración / AA', icon: 'Snowflake', isPopular: false },
  { id: 'otro', name: 'Otro oficio', icon: 'PlusCircle', isPopular: false },
];

export const INITIAL_PROVIDERS: Provider[] = [
  {
    id: 'prov-roberto-gomez',
    name: 'Roberto Gómez',
    realName: 'Roberto Gómez',
    category: 'gasista',
    isProtected: false,
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
    phone: '5492266551122',
    zoneName: 'Zona Centro / Plaza Libertad',
    location: { lat: -37.8475, lng: -58.2560 },
    coverageRadiusKm: 8,
    isVerified: true,
    dniStatus: 'verified',
    dniDocumentUrl: '/docs/dni-mock.jpg',
    isMatriculado: true,
    matriculaNumber: 'Camuzzi Mat. N° 48219 (Gasista de 1ª)',
    matriculaStatus: 'verified',
    matriculaDocumentUrl: '/docs/matricula-gas-mock.jpg',
    isPremium: true,
    rating: 5.0,
    reviewCount: 43,
    punctualityScore: 99,
    servicesCompleted: 58,
    bio: 'Gasista matriculado de primera categoría en Balcarce. 22 años de oficio. Habilitaciones Camuzzi, detección de fugas, instalaciones completas y service de calefactores tiro balanceado.',
    experienceYears: 22,
    createdAt: '2024-01-15'
  },
  {
    id: 'prov-marisa-lopez',
    name: 'Marisa López',
    realName: 'Marisa López',
    category: 'electricista',
    isProtected: false,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    phone: '5492266442233',
    zoneName: 'Barrio Pueblo Nuevo / Av. San Martín',
    location: { lat: -37.8425, lng: -58.2615 },
    coverageRadiusKm: 6,
    isVerified: true,
    dniStatus: 'verified',
    dniDocumentUrl: '/docs/dni-mock.jpg',
    isMatriculado: true,
    matriculaNumber: 'Col. Técnicos Pcia. BsAs N° 12480',
    matriculaStatus: 'verified',
    matriculaDocumentUrl: '/docs/matricula-elec-mock.jpg',
    isPremium: true,
    rating: 4.9,
    reviewCount: 31,
    punctualityScore: 97,
    servicesCompleted: 39,
    bio: 'Electricista matriculada en Balcarce. Tableros generales, disyuntores, recableados, iluminación LED y certificados de instalación eléctrica segura.',
    experienceYears: 9,
    createdAt: '2024-03-10'
  },
  {
    id: 'prov-carlos-plomero',
    name: 'Carlos M. (Plomería Balcarce)',
    realName: 'Carlos Marcelo Giménez',
    category: 'plomero',
    isProtected: true, // PERFIL PROTEGIDO: No muestra rostro ni apellido legal al público
    avatar: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop&q=80',
    phone: '5492266338877',
    zoneName: 'Zona Hospital / Calle 19 y 30',
    location: { lat: -37.8545, lng: -58.2630 },
    coverageRadiusKm: 7,
    isVerified: true, // VALIDADO POR LA PLATAFORMA (Estrella de confianza)
    dniStatus: 'verified',
    dniDocumentUrl: '/docs/dni-carlos.jpg',
    isMatriculado: false,
    matriculaStatus: 'none',
    isPremium: false,
    rating: 4.8,
    reviewCount: 26,
    punctualityScore: 94,
    servicesCompleted: 34,
    bio: 'Plomero de confianza con identidad verificada por la plataforma. Destapes de cañerías con máquina, termofusión, recambio de canillas, mochilas y bombas presurizadoras.',
    experienceYears: 14,
    createdAt: '2024-04-02'
  },
  {
    id: 'prov-lucas-peralta',
    name: 'Lucas Peralta',
    realName: 'Lucas Peralta',
    category: 'podador',
    isProtected: false,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    phone: '5492266994411',
    zoneName: 'Zona Cerro El Triunfo / Av. Kelly',
    location: { lat: -37.8570, lng: -58.2460 },
    coverageRadiusKm: 12,
    isVerified: true,
    dniStatus: 'verified',
    isMatriculado: false,
    matriculaStatus: 'none',
    isPremium: false,
    rating: 4.9,
    reviewCount: 21,
    punctualityScore: 96,
    servicesCompleted: 27,
    bio: 'Poda de altura, mantenimiento de parques, volteo de árboles de riesgo con soga y arnés. Retiro de ramas en Balcarce y zona de quintas.',
    experienceYears: 8,
    createdAt: '2024-05-18'
  },
  {
    id: 'prov-miguel-pintor',
    name: 'Miguel Ángel Suárez',
    realName: 'Miguel Ángel Suárez',
    category: 'pintor',
    isProtected: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    phone: '5492266775533',
    zoneName: 'Zona Av. Del Valle y 12',
    location: { lat: -37.8415, lng: -58.2475 },
    coverageRadiusKm: 6,
    isVerified: true,
    dniStatus: 'verified',
    isMatriculado: false,
    matriculaStatus: 'none',
    isPremium: false,
    rating: 4.7,
    reviewCount: 16,
    punctualityScore: 91,
    servicesCompleted: 22,
    bio: 'Pintura de interiores, frentes, impermeabilizaciones, cielorrasos y tratamiento de humedad. Trabajos prolijos y limpios con referencias comprobables.',
    experienceYears: 16,
    createdAt: '2024-06-01'
  },
  {
    id: 'prov-jorge-refrig',
    name: 'Jorge Videla (Refrigeración)',
    realName: 'Jorge Eduardo Videla',
    category: 'tecnico-refrigeracion',
    isProtected: false,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    phone: '5492266123456',
    zoneName: 'Zona Av. Gonzáles Chaves',
    location: { lat: -37.8510, lng: -58.2520 },
    coverageRadiusKm: 8,
    isVerified: false,
    dniStatus: 'pending', // PENDIENTE DE REVISIÓN EN ADMIN
    dniDocumentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80',
    isMatriculado: true,
    matriculaNumber: 'Matrícula Cámara Aire y Calefacción 9912',
    matriculaStatus: 'pending', // PENDIENTE DE REVISIÓN EN ADMIN
    matriculaDocumentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
    isPremium: false,
    rating: 4.6,
    reviewCount: 8,
    punctualityScore: 90,
    servicesCompleted: 10,
    bio: 'Instalación y carga de gas para aires acondicionados split e inverter. Limpieza de filtros y service integral.',
    experienceYears: 6,
    createdAt: '2024-09-01'
  }
];

export const INITIAL_REQUESTS: ServiceRequest[] = [
  {
    id: 'req-demo-101',
    providerId: 'prov-roberto-gomez',
    clientName: 'Esteban Di Meglio',
    clientPhone: '5492266887766',
    clientAddress: 'Calle 16 N° 452 (entre 11 y 13), Balcarce',
    clientCoords: { lat: -37.8465, lng: -58.2510 },
    serviceCategory: 'gasista',
    description: 'Revisión anual y encendido de 3 calefactores antes del invierno. Se apaga la llama piloto de uno.',
    agreedDate: '2026-09-22',
    agreedTime: '15:30',
    status: 'en_camino', // EN CAMINO (Para probar el mapa estilo Uber)
    enRouteAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(), // Salió hace 7 minutos
    providerCurrentLocation: { lat: -37.8471, lng: -58.2540 },
    estimatedArrivalMinutes: 8,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
  },
  {
    id: 'req-demo-102',
    providerId: 'prov-marisa-lopez',
    clientName: 'Carla San Martín',
    clientPhone: '5492266334455',
    clientAddress: 'Calle 28 y 21, Balcarce',
    clientCoords: { lat: -37.8520, lng: -58.2580 },
    serviceCategory: 'electricista',
    description: 'Salta la térmica al encender el lavarropas. Necesito verificar tablero.',
    agreedDate: '2026-09-22',
    agreedTime: '17:00',
    status: 'confirmado',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    id: 'req-demo-103',
    providerId: 'prov-carlos-plomero',
    clientName: 'Horacio Valenzuela',
    clientPhone: '5492266221199',
    clientAddress: 'Calle 23 N° 890, Balcarce',
    clientCoords: { lat: -37.8490, lng: -58.2600 },
    serviceCategory: 'plomero',
    description: 'Pérdida en codo de bajo mesada y canilla monocomando floja.',
    agreedDate: '2026-09-22',
    agreedTime: '11:00',
    status: 'llegado',
    enRouteAt: '2026-09-22T10:45:00.000Z',
    arrivedAt: '2026-09-22T10:55:00.000Z', // Llegó 5 min antes
    punctualityResult: 'a_tiempo',
    minutesDiff: -5,
    clientRated: false,
    createdAt: '2026-09-22T08:00:00.000Z'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    orderId: 'req-prev-001',
    providerId: 'prov-roberto-gomez',
    clientName: 'Mariana P.',
    punctualityRating: 5,
    qualityRating: 5,
    priceRating: 5,
    averageRating: 5.0,
    comment: 'Impecable Roberto. Llegó exactamente en la hora acordada, revisó todo con manómetro y dejó todo certificado y funcionando.',
    punctualityTag: 'a_tiempo',
    createdAt: '2026-09-18'
  },
  {
    id: 'rev-2',
    orderId: 'req-prev-002',
    providerId: 'prov-carlos-plomero',
    clientName: 'Fernando B.',
    punctualityRating: 5,
    qualityRating: 5,
    priceRating: 4,
    averageRating: 4.7,
    comment: 'Muy buena atención de Carlos. Destapó la cañería del patio en 20 minutos con su máquina. Muy prolijo y respetuoso.',
    punctualityTag: 'a_tiempo',
    createdAt: '2026-09-15'
  }
];

// Helper functions with localStorage persistence
const PROVIDERS_KEY = 'acanomas_providers_v1';
const REQUESTS_KEY = 'acanomas_requests_v1';
const REVIEWS_KEY = 'acanomas_reviews_v1';
const CATEGORIES_KEY = 'acanomas_categories_v1';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getProviders(): Provider[] {
  if (!isBrowser()) return INITIAL_PROVIDERS;
  try {
    const data = localStorage.getItem(PROVIDERS_KEY);
    if (!data) {
      localStorage.setItem(PROVIDERS_KEY, JSON.stringify(INITIAL_PROVIDERS));
      return INITIAL_PROVIDERS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_PROVIDERS;
  }
}

export function saveProviders(providers: Provider[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(PROVIDERS_KEY, JSON.stringify(providers));
}

export function getProviderById(id: string): Provider | undefined {
  return getProviders().find(p => p.id === id);
}

export function createProvider(newProvider: Provider): void {
  const providers = getProviders();
  providers.push(newProvider);
  saveProviders(providers);
}

export function updateProvider(id: string, updates: Partial<Provider>): Provider | undefined {
  const providers = getProviders();
  const idx = providers.findIndex(p => p.id === id);
  if (idx === -1) return undefined;
  providers[idx] = { ...providers[idx], ...updates };
  saveProviders(providers);
  return providers[idx];
}

export function getServiceRequests(): ServiceRequest[] {
  if (!isBrowser()) return INITIAL_REQUESTS;
  try {
    const data = localStorage.getItem(REQUESTS_KEY);
    if (!data) {
      localStorage.setItem(REQUESTS_KEY, JSON.stringify(INITIAL_REQUESTS));
      return INITIAL_REQUESTS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_REQUESTS;
  }
}

export function saveServiceRequests(requests: ServiceRequest[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
}

export function getServiceRequestById(id: string): ServiceRequest | undefined {
  return getServiceRequests().find(r => r.id === id);
}

export function createServiceRequest(req: ServiceRequest): ServiceRequest {
  const requests = getServiceRequests();
  requests.unshift(req);
  saveServiceRequests(requests);
  return req;
}

export function updateServiceRequest(id: string, updates: Partial<ServiceRequest>): ServiceRequest | undefined {
  const requests = getServiceRequests();
  const idx = requests.findIndex(r => r.id === id);
  if (idx === -1) return undefined;
  
  const current = requests[idx];
  const updated: ServiceRequest = { ...current, ...updates };

  // If status is moving to 'llegado' and arrival was not recorded yet, evaluate punctuality automatically!
  if (updates.status === 'llegado' && !updated.arrivedAt) {
    const nowISO = new Date().toISOString();
    updated.arrivedAt = nowISO;
    const isReprogrammed = current.status === 'reprogramado';
    const evalResult = evaluatePunctuality(updated.agreedDate, updated.agreedTime, nowISO, isReprogrammed);
    updated.punctualityResult = evalResult.status;
    updated.minutesDiff = evalResult.minutesDiff;

    // Also update the provider's statistics!
    const provider = getProviderById(updated.providerId);
    if (provider) {
      provider.servicesCompleted = (provider.servicesCompleted || 0) + 1;
      updateProvider(provider.id, { servicesCompleted: provider.servicesCompleted });
    }
  }

  requests[idx] = updated;
  saveServiceRequests(requests);
  return updated;
}

export function getReviews(): Review[] {
  if (!isBrowser()) return INITIAL_REVIEWS;
  try {
    const data = localStorage.getItem(REVIEWS_KEY);
    if (!data) {
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(INITIAL_REVIEWS));
      return INITIAL_REVIEWS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_REVIEWS;
  }
}

export function addReview(review: Review): void {
  if (!isBrowser()) return;
  const reviews = getReviews();
  reviews.unshift(review);
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));

  // Update provider rating average
  const providerReviews = reviews.filter(r => r.providerId === review.providerId);
  const avg = providerReviews.reduce((sum, r) => sum + r.averageRating, 0) / providerReviews.length;
  
  const provider = getProviderById(review.providerId);
  if (provider) {
    updateProvider(provider.id, {
      rating: parseFloat(avg.toFixed(1)),
      reviewCount: providerReviews.length
    });
  }

  // Mark request as rated
  if (review.orderId) {
    updateServiceRequest(review.orderId, { clientRated: true });
  }
}

export function getCategories(): Category[] {
  if (!isBrowser()) return INITIAL_CATEGORIES;
  try {
    const data = localStorage.getItem(CATEGORIES_KEY);
    if (!data) {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_CATEGORIES;
  }
}

export function addCategory(category: Category): void {
  if (!isBrowser()) return;
  const cats = getCategories();
  cats.push(category);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
}
