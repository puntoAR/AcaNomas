import { Provider, ServiceRequest, Review, Category, ServiceStatus, ChatMessage, RescheduleProposal } from '@/types';
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
    phoneUnlocked: true,
    messages: [
      {
        id: 'msg-101-1',
        sender: 'cliente',
        senderName: 'Esteban Di Meglio',
        text: 'Hola Roberto, solicité una revisión de calefactores para hoy a las 15:30 hs.',
        timestamp: '2026-09-22T11:00:00.000Z'
      },
      {
        id: 'msg-101-2',
        sender: 'prestador',
        senderName: 'Roberto Gómez',
        text: 'Hola Esteban, perfecto. Confirmo la visita para hoy a las 15:30 hs. Llevo los repuestos de termocuplas y piloto.',
        timestamp: '2026-09-22T11:15:00.000Z',
        actionType: 'confirm_visit'
      },
      {
        id: 'msg-101-3',
        sender: 'sistema',
        senderName: 'AcáNomás',
        text: '✅ Visita confirmada para el 2026-09-22 a las 15:30 hs por Roberto Gómez. Teléfonos de contacto habilitados.',
        timestamp: '2026-09-22T11:15:00.000Z',
        actionType: 'confirm_visit'
      },
      {
        id: 'msg-101-4',
        sender: 'prestador',
        senderName: 'Roberto Gómez',
        text: '¡Voy saliendo hacia tu domicilio en Calle 16!',
        timestamp: '2026-09-22T15:23:00.000Z'
      }
    ],
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
    phoneUnlocked: true,
    messages: [
      {
        id: 'msg-102-1',
        sender: 'cliente',
        senderName: 'Carla San Martín',
        text: 'Hola Marisa, te envié la solicitud porque salta la térmica.',
        timestamp: '2026-09-22T12:00:00.000Z'
      },
      {
        id: 'msg-102-2',
        sender: 'prestador',
        senderName: 'Marisa López',
        text: 'Hola Carla! Ya vi el pedido. Confirmo la visita hoy a las 17:00 hs.',
        timestamp: '2026-09-22T12:20:00.000Z',
        actionType: 'confirm_visit'
      },
      {
        id: 'msg-102-3',
        sender: 'sistema',
        senderName: 'AcáNomás',
        text: '✅ Visita confirmada para el 2026-09-22 a las 17:00 hs por Marisa López. Teléfonos de contacto habilitados.',
        timestamp: '2026-09-22T12:20:00.000Z',
        actionType: 'confirm_visit'
      }
    ],
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
    phoneUnlocked: true,
    messages: [
      {
        id: 'msg-103-1',
        sender: 'sistema',
        senderName: 'AcáNomás',
        text: '✅ Visita confirmada para las 11:00 hs. Teléfonos de contacto habilitados.',
        timestamp: '2026-09-22T08:30:00.000Z'
      },
      {
        id: 'msg-103-2',
        sender: 'prestador',
        senderName: 'Carlos M.',
        text: 'Llegué al domicilio.',
        timestamp: '2026-09-22T10:55:00.000Z'
      }
    ],
    enRouteAt: '2026-09-22T10:45:00.000Z',
    arrivedAt: '2026-09-22T10:55:00.000Z', // Llegó 5 min antes
    punctualityResult: 'a_tiempo',
    minutesDiff: -5,
    clientRated: false,
    createdAt: '2026-09-22T08:00:00.000Z'
  },
  {
    id: 'req-demo-104',
    providerId: 'prov-carlos-plomero',
    clientName: 'Valeria Rossi',
    clientPhone: '5492266667788',
    clientAddress: 'Calle 14 e/ 17 y 19 N° 630, Balcarce',
    clientCoords: { lat: -37.8445, lng: -58.2530 },
    serviceCategory: 'plomero',
    description: 'Bomba presurizadora no arranca y gotea la llave de paso del patio.',
    agreedDate: '2026-09-23',
    agreedTime: '10:00',
    status: 'pendiente', // PENDIENTE DE CONFIRMACIÓN DE DÍA Y HORA
    phoneUnlocked: false,
    messages: [
      {
        id: 'msg-104-1',
        sender: 'cliente',
        senderName: 'Valeria Rossi',
        text: 'Hola Carlos, solicité tu servicio para mañana a las 10:00 hs. ¿Tendrás disponibilidad?',
        timestamp: new Date().toISOString()
      },
      {
        id: 'msg-104-2',
        sender: 'sistema',
        senderName: 'AcáNomás',
        text: '📌 Solicitud creada. El prestador debe confirmar el día y horario de la visita para habilitar los teléfonos de contacto directos.',
        timestamp: new Date().toISOString(),
        actionType: 'info'
      }
    ],
    createdAt: new Date().toISOString()
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

/**
 * Agrega un mensaje al historial de chat de la solicitud
 */
export function addChatMessage(
  orderId: string,
  message: {
    sender: 'cliente' | 'prestador' | 'sistema';
    senderName: string;
    text: string;
    actionType?: ChatMessage['actionType'];
    actionMetadata?: ChatMessage['actionMetadata'];
  }
): ChatMessage | undefined {
  const requests = getServiceRequests();
  const idx = requests.findIndex(r => r.id === orderId);
  if (idx === -1) return undefined;

  const newMsg: ChatMessage = {
    id: 'msg-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    sender: message.sender,
    senderName: message.senderName,
    text: message.text,
    timestamp: new Date().toISOString(),
    actionType: message.actionType,
    actionMetadata: message.actionMetadata
  };

  const currentMessages = requests[idx].messages || [];
  requests[idx].messages = [...currentMessages, newMsg];
  saveServiceRequests(requests);
  return newMsg;
}

/**
 * Confirma el día y hora de visita por parte del prestador (o mutuo acuerdo)
 * Habilita los números de teléfono de ambas partes y pasa a status 'confirmado'.
 */
export function confirmServiceVisit(
  orderId: string,
  confirmedByName: string,
  agreedDate?: string,
  agreedTime?: string
): ServiceRequest | undefined {
  const req = getServiceRequestById(orderId);
  if (!req) return undefined;

  const date = agreedDate || req.agreedDate;
  const time = agreedTime || req.agreedTime;

  const updated = updateServiceRequest(orderId, {
    status: 'confirmado',
    phoneUnlocked: true,
    agreedDate: date,
    agreedTime: time,
    pendingReschedule: undefined
  });

  if (updated) {
    addChatMessage(orderId, {
      sender: 'sistema',
      senderName: 'AcáNomás',
      text: `✅ Visita confirmada para el ${date} a las ${time} hs por ${confirmedByName}. ¡Los números de contacto directos ya están visibles para ambas partes!`,
      actionType: 'confirm_visit',
      actionMetadata: { date, time }
    });
  }

  return getServiceRequestById(orderId);
}

/**
 * Propone reprogramar el turno (cliente o prestador).
 * Cambia el estado a 'reprogramado' y deja la propuesta pendiente para que la otra parte la re-confirme.
 */
export function proposeReschedule(
  orderId: string,
  proposedBy: 'cliente' | 'prestador',
  proposedByName: string,
  newDate: string,
  newTime: string,
  reason: string
): ServiceRequest | undefined {
  const req = getServiceRequestById(orderId);
  if (!req) return undefined;

  const proposal: RescheduleProposal = {
    proposedBy,
    proposedDate: newDate,
    proposedTime: newTime,
    reason,
    createdAt: new Date().toISOString()
  };

  updateServiceRequest(orderId, {
    status: 'reprogramado',
    pendingReschedule: proposal
  });

  addChatMessage(orderId, {
    sender: proposedBy,
    senderName: proposedByName,
    text: `📅 Propuse reprogramar la visita para el ${newDate} a las ${newTime} hs. Motivo: ${reason}.`,
    actionType: 'propose_reschedule',
    actionMetadata: { date: newDate, time: newTime, reason }
  });

  addChatMessage(orderId, {
    sender: 'sistema',
    senderName: 'AcáNomás',
    text: `⚠️ Solicitud de reprogramación pendiente: ${proposedByName} propuso el ${newDate} a las ${newTime} hs. Se requiere re-confirmación de la otra parte para validar la fecha.`,
    actionType: 'info'
  });

  return getServiceRequestById(orderId);
}

/**
 * Re-confirma la propuesta de reprogramación aceptándola
 */
export function confirmReschedule(
  orderId: string,
  confirmedByName: string,
  confirmedByRole: 'cliente' | 'prestador'
): ServiceRequest | undefined {
  const req = getServiceRequestById(orderId);
  if (!req || !req.pendingReschedule) return undefined;

  const { proposedDate, proposedTime } = req.pendingReschedule;

  updateServiceRequest(orderId, {
    status: 'confirmado',
    agreedDate: proposedDate,
    agreedTime: proposedTime,
    pendingReschedule: undefined,
    phoneUnlocked: true
  });

  addChatMessage(orderId, {
    sender: confirmedByRole,
    senderName: confirmedByName,
    text: `✅ Acepté la nueva fecha de visita: ${proposedDate} a las ${proposedTime} hs.`,
    actionType: 'accept_reschedule',
    actionMetadata: { date: proposedDate, time: proposedTime }
  });

  addChatMessage(orderId, {
    sender: 'sistema',
    senderName: 'AcáNomás',
    text: `🎉 Turno re-confirmado con éxito para el ${proposedDate} a las ${proposedTime} hs. Visita agendada.`,
    actionType: 'confirm_visit'
  });

  return getServiceRequestById(orderId);
}

/**
 * Cancela el servicio (cliente o prestador en todo momento)
 */
export function cancelServiceOrder(
  orderId: string,
  cancelledByRole: 'cliente' | 'prestador',
  cancelledByName: string,
  reason: string
): ServiceRequest | undefined {
  const req = getServiceRequestById(orderId);
  if (!req) return undefined;

  updateServiceRequest(orderId, {
    status: 'cancelado',
    cancelledBy: cancelledByRole,
    cancellationReason: reason,
    pendingReschedule: undefined
  });

  addChatMessage(orderId, {
    sender: cancelledByRole,
    senderName: cancelledByName,
    text: `❌ Cancelé el servicio. Motivo: ${reason}`,
    actionType: 'cancel_service',
    actionMetadata: { reason }
  });

  addChatMessage(orderId, {
    sender: 'sistema',
    senderName: 'AcáNomás',
    text: `🚫 El servicio ha sido cancelado por ${cancelledByName}. Motivo informado: "${reason}". La visita queda desestimada.`,
    actionType: 'cancel_service'
  });

  return getServiceRequestById(orderId);
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

export function addReview(review: Review): boolean {
  if (!isBrowser()) return false;
  const reviews = getReviews();

  // Control Anti-Fraude: Evitar que una misma orden sea calificada múltiples veces
  if (review.orderId && reviews.some(r => r.orderId === review.orderId)) {
    console.warn('Intento de calificación duplicada bloqueado:', review.orderId);
    return false;
  }

  // Asegurar que las calificaciones se mantengan estrictamente entre 1 y 5
  review.punctualityRating = Math.min(Math.max(review.punctualityRating, 1), 5);
  review.qualityRating = Math.min(Math.max(review.qualityRating, 1), 5);
  review.priceRating = Math.min(Math.max(review.priceRating, 1), 5);
  review.averageRating = parseFloat(
    ((review.punctualityRating + review.qualityRating + review.priceRating) / 3).toFixed(1)
  );

  reviews.unshift(review);
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));

  // Actualizar promedio general del prestador
  const providerReviews = reviews.filter(r => r.providerId === review.providerId);
  const avg = providerReviews.reduce((sum, r) => sum + r.averageRating, 0) / providerReviews.length;
  
  const provider = getProviderById(review.providerId);
  if (provider) {
    updateProvider(provider.id, {
      rating: parseFloat(avg.toFixed(1)),
      reviewCount: providerReviews.length
    });
  }

  // Marcar la solicitud como calificada
  if (review.orderId) {
    updateServiceRequest(review.orderId, { clientRated: true });
  }

  return true;
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
