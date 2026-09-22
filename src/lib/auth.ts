import { AuthUser, Provider, UserRole } from '@/types';
import { getProviders, createProvider, BALCARCE_CENTER } from './store';
import {
  sanitizeTextInput,
  sanitizePhone,
  sanitizeImageUrl,
  detectMaliciousPayload,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit
} from './security';

const AUTH_USER_KEY = 'acanomas_current_user_v1';
const USERS_DB_KEY = 'acanomas_users_db_v1';

export const ADMIN_CREDENTIALS = {
  email: 'admin@acanomas.com',
  password: 'admin123',
  pin: '1234'
};

const INITIAL_USERS: AuthUser[] = [
  {
    id: 'usr-admin-1',
    name: 'Administrador AcáNomás',
    email: ADMIN_CREDENTIALS.email,
    password: ADMIN_CREDENTIALS.password,
    role: 'admin'
  },
  {
    id: 'usr-prov-roberto-gomez',
    name: 'Roberto Gómez',
    phone: '2266551122',
    password: '1234',
    role: 'prestador',
    providerId: 'prov-roberto-gomez'
  },
  {
    id: 'usr-prov-marisa-lopez',
    name: 'Marisa López',
    phone: '2266442233',
    password: '1234',
    role: 'prestador',
    providerId: 'prov-marisa-lopez'
  },
  {
    id: 'usr-prov-carlos-plomero',
    name: 'Carlos M. (Plomería Balcarce)',
    phone: '2266338877',
    password: '1234',
    role: 'prestador',
    providerId: 'prov-carlos-plomero'
  },
  {
    id: 'usr-client-demo-1',
    name: 'Esteban Di Meglio',
    phone: '2266887766',
    password: '1234',
    address: 'Calle 16 N° 452, Balcarce',
    role: 'cliente'
  }
];

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getRegisteredUsers(): AuthUser[] {
  if (!isBrowser()) return INITIAL_USERS;
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (!raw) {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USERS;
  }
}

export function saveRegisteredUsers(users: AuthUser[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
}

export function getCurrentUser(): AuthUser | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: AuthUser | null): void {
  if (!isBrowser()) return;
  if (!user) {
    localStorage.removeItem(AUTH_USER_KEY);
  } else {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
  window.dispatchEvent(new Event('auth-change'));
}

// 1. ADMIN LOGIN CON RATE LIMITING Y BLOQUEO POR FUERZA BRUTA
export function loginAsAdmin(password: string): { 
  success: boolean; 
  error?: string;
  isLocked?: boolean;
  remainingSeconds?: number;
} {
  const rateLimitKey = 'admin_lockout';
  const check = checkRateLimit(rateLimitKey);

  if (!check.allowed) {
    return {
      success: false,
      isLocked: true,
      remainingSeconds: check.remainingSeconds,
      error: `Demasiados intentos erróneos. Acceso de administrador bloqueado temporalmente por ${check.remainingSeconds} segundos.`
    };
  }

  // Prevenir inyección o contraseñas gigantes
  if (detectMaliciousPayload(password) || password.length > 128) {
    recordFailedAttempt(rateLimitKey);
    return { success: false, error: 'Credenciales inválidas o caracteres no permitidos.' };
  }

  if (password === ADMIN_CREDENTIALS.password || password === ADMIN_CREDENTIALS.pin) {
    resetRateLimit(rateLimitKey);
    const adminUser: AuthUser = {
      id: 'usr-admin-1',
      name: 'Administrador AcáNomás',
      email: ADMIN_CREDENTIALS.email,
      role: 'admin'
    };
    setCurrentUser(adminUser);
    return { success: true };
  }

  const failed = recordFailedAttempt(rateLimitKey);
  if (failed.locked) {
    return {
      success: false,
      isLocked: true,
      remainingSeconds: failed.remainingSeconds,
      error: `Límite de intentos alcanzado. Acceso bloqueado por ${failed.remainingSeconds} segundos por seguridad.`
    };
  }

  return { 
    success: false, 
    error: `Contraseña incorrecta. Te quedan ${failed.attemptsLeft} intentos antes del bloqueo.` 
  };
}

// 2. PRESTADOR LOGIN & REGISTRO SEGURO
export function loginPrestador(
  phone: string,
  password?: string
): { success: boolean; user?: AuthUser; error?: string; isLocked?: boolean; remainingSeconds?: number } {
  const cleanPhone = sanitizePhone(phone);
  if (!cleanPhone || cleanPhone.length < 6) {
    return { success: false, error: 'Ingresá un número de teléfono válido.' };
  }

  if (detectMaliciousPayload(phone) || (password && detectMaliciousPayload(password))) {
    return { success: false, error: 'Se detectaron caracteres no permitidos.' };
  }

  const rateLimitKey = `prov_login_${cleanPhone}`;
  const check = checkRateLimit(rateLimitKey);

  if (!check.allowed) {
    return {
      success: false,
      isLocked: true,
      remainingSeconds: check.remainingSeconds,
      error: `Demasiados intentos fallidos. Cuenta protegida temporalmente. Esperá ${check.remainingSeconds} segundos.`
    };
  }

  const users = getRegisteredUsers();
  const user = users.find(
    u => u.role === 'prestador' && (sanitizePhone(u.phone) === cleanPhone || (u.phone && cleanPhone.includes(u.phone)))
  );

  if (!user) {
    // Verificar si coincide con prestadores precargados en el store
    const providers = getProviders();
    const provider = providers.find(p => sanitizePhone(p.phone).includes(cleanPhone));
    if (provider) {
      resetRateLimit(rateLimitKey);
      const newUser: AuthUser = {
        id: `usr-${provider.id}`,
        name: provider.name,
        role: 'prestador',
        phone: provider.phone,
        providerId: provider.id
      };
      setCurrentUser(newUser);
      return { success: true, user: newUser };
    }

    const failed = recordFailedAttempt(rateLimitKey);
    return { 
      success: false, 
      error: failed.locked 
        ? `Cuenta bloqueada por ${failed.remainingSeconds}s.` 
        : 'No encontramos ningún prestador registrado con ese teléfono.' 
    };
  }

  if (password && user.password && user.password !== password) {
    const failed = recordFailedAttempt(rateLimitKey);
    if (failed.locked) {
      return {
        success: false,
        isLocked: true,
        remainingSeconds: failed.remainingSeconds,
        error: `Has superado el límite de intentos. Bloqueo temporal por ${failed.remainingSeconds} segundos.`
      };
    }
    return { 
      success: false, 
      error: `Contraseña incorrecta. Intentos restantes: ${failed.attemptsLeft}.` 
    };
  }

  resetRateLimit(rateLimitKey);
  setCurrentUser(user);
  return { success: true, user };
}

export interface RegisterPrestadorInput {
  name: string;
  phone: string;
  password?: string;
  category: string;
  customCategory?: string;
  zoneName: string;
  coverageRadiusKm: number;
  dniPhotoUrl: string; // FOTO DE DNI OBLIGATORIA
  isMatriculado: boolean;
  matriculaNumber?: string;
  bio?: string;
}

export function registerPrestador(
  input: RegisterPrestadorInput
): { success: boolean; user?: AuthUser; error?: string } {
  // 1. Sanitizar y verificar entradas
  const safeName = sanitizeTextInput(input.name, 60);
  const safePhone = sanitizePhone(input.phone);
  const safeCategory = sanitizeTextInput(input.category, 40);
  const safeCustomCategory = sanitizeTextInput(input.customCategory, 40);
  const safeZone = sanitizeTextInput(input.zoneName, 80) || 'Balcarce Centro';
  const safeBio = sanitizeTextInput(input.bio, 400);
  const safeMatricula = sanitizeTextInput(input.matriculaNumber, 30);
  const safeDniPhoto = sanitizeImageUrl(input.dniPhotoUrl, '');

  // Detección de inyecciones
  if (
    detectMaliciousPayload(input.name) ||
    detectMaliciousPayload(input.phone) ||
    detectMaliciousPayload(input.customCategory) ||
    detectMaliciousPayload(input.bio)
  ) {
    return { success: false, error: 'El formulario contiene caracteres o instrucciones no permitidas.' };
  }

  if (!safeName || safeName.length < 3) {
    return { success: false, error: 'Por favor ingresá un nombre válido (mínimo 3 letras).' };
  }

  if (!safePhone || safePhone.length < 7) {
    return { success: false, error: 'Ingresá un número de teléfono o WhatsApp válido.' };
  }

  if (!safeDniPhoto) {
    return { success: false, error: 'La foto de tu DNI es estrictamente obligatoria para verificar tu identidad y cuidar la seguridad del barrio.' };
  }

  if (input.password && (input.password.length < 4 || input.password.length > 128)) {
    return { success: false, error: 'La contraseña debe tener entre 4 y 128 caracteres.' };
  }

  // 2. Control Anti-Fraude: Evitar duplicación de teléfono
  const existingUsers = getRegisteredUsers();
  const phoneExists = existingUsers.some(
    u => u.phone && sanitizePhone(u.phone) === safePhone
  );
  if (phoneExists) {
    return { 
      success: false, 
      error: 'Ya existe una cuenta registrada con este número de teléfono. Si sos vos, iniciá sesión directamente.' 
    };
  }

  const existingProviders = getProviders();
  const providerPhoneExists = existingProviders.some(
    p => sanitizePhone(p.phone) === safePhone
  );
  if (providerPhoneExists) {
    return {
      success: false,
      error: 'Este número de teléfono ya pertenece a un prestador registrado en Balcarce.'
    };
  }

  const newProviderId = 'prov-' + Date.now().toString(36);

  // 3. Crear prestador en el store con estado PENDIENTE de verificación
  const newProvider: Provider = {
    id: newProviderId,
    name: safeName,
    realName: safeName,
    category: safeCategory === 'otro' ? (safeCustomCategory?.toLowerCase().trim() || 'otro') : safeCategory,
    customCategory: safeCategory === 'otro' ? safeCustomCategory : undefined,
    isProtected: false,
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
    phone: safePhone,
    zoneName: safeZone,
    location: {
      lat: BALCARCE_CENTER.lat + (Math.random() * 0.01 - 0.005),
      lng: BALCARCE_CENTER.lng + (Math.random() * 0.01 - 0.005)
    },
    coverageRadiusKm: Math.min(Math.max(input.coverageRadiusKm || 6, 1), 30),
    isVerified: false,
    dniStatus: 'pending', // PENDIENTE DE REVISIÓN EN ADMIN CON SU FOTO
    dniDocumentUrl: safeDniPhoto,
    isMatriculado: Boolean(input.isMatriculado && safeMatricula),
    matriculaNumber: input.isMatriculado ? safeMatricula : undefined,
    matriculaStatus: input.isMatriculado && safeMatricula ? 'pending' : 'none',
    isPremium: false,
    rating: 5.0,
    reviewCount: 0,
    punctualityScore: 100,
    servicesCompleted: 0,
    bio: safeBio || 'Profesional de oficio en Balcarce. Soluciones con garantía y puntualidad asegurada.',
    experienceYears: 4,
    createdAt: new Date().toISOString().split('T')[0]
  };

  createProvider(newProvider);

  // 4. Crear usuario en la base auth
  const newUser: AuthUser = {
    id: `usr-${newProviderId}`,
    name: safeName,
    role: 'prestador',
    phone: safePhone,
    password: input.password || '1234',
    dniPhotoUrl: safeDniPhoto,
    providerId: newProviderId,
    createdAt: new Date().toISOString()
  };

  existingUsers.push(newUser);
  saveRegisteredUsers(existingUsers);

  setCurrentUser(newUser);
  return { success: true, user: newUser };
}

// 3. CLIENTE / VECINO LOGIN & REGISTRO SEGURO
export function loginCliente(
  phone: string,
  password?: string
): { success: boolean; user?: AuthUser; error?: string; isLocked?: boolean; remainingSeconds?: number } {
  const cleanPhone = sanitizePhone(phone);
  if (!cleanPhone || cleanPhone.length < 6) {
    return { success: false, error: 'Ingresá un número de teléfono válido.' };
  }

  if (detectMaliciousPayload(phone) || (password && detectMaliciousPayload(password))) {
    return { success: false, error: 'Se detectaron caracteres no permitidos.' };
  }

  const rateLimitKey = `client_login_${cleanPhone}`;
  const check = checkRateLimit(rateLimitKey);

  if (!check.allowed) {
    return {
      success: false,
      isLocked: true,
      remainingSeconds: check.remainingSeconds,
      error: `Demasiados intentos fallidos. Esperá ${check.remainingSeconds} segundos antes de reintentar.`
    };
  }

  const users = getRegisteredUsers();
  const user = users.find(
    u => u.role === 'cliente' && sanitizePhone(u.phone) === cleanPhone
  );

  if (!user) {
    const failed = recordFailedAttempt(rateLimitKey);
    return { 
      success: false, 
      error: failed.locked
        ? `Acceso temporalmente bloqueado por ${failed.remainingSeconds}s.`
        : 'No encontramos una cuenta con ese teléfono. Podés registrarte en un clic abajo.' 
    };
  }

  if (password && user.password && user.password !== password) {
    const failed = recordFailedAttempt(rateLimitKey);
    if (failed.locked) {
      return {
        success: false,
        isLocked: true,
        remainingSeconds: failed.remainingSeconds,
        error: `Superaste los intentos permitidos. Bloqueo temporal por ${failed.remainingSeconds} segundos.`
      };
    }
    return { 
      success: false, 
      error: `Contraseña incorrecta. Te quedan ${failed.attemptsLeft} intentos.` 
    };
  }

  resetRateLimit(rateLimitKey);
  setCurrentUser(user);
  return { success: true, user };
}

export function registerCliente(input: {
  name: string;
  phone: string;
  password?: string;
  address?: string;
}): { success: boolean; user?: AuthUser; error?: string } {
  const safeName = sanitizeTextInput(input.name, 60);
  const safePhone = sanitizePhone(input.phone);
  const safeAddress = sanitizeTextInput(input.address, 100) || 'Balcarce, Bs. As.';

  if (detectMaliciousPayload(input.name) || detectMaliciousPayload(input.phone) || detectMaliciousPayload(input.address)) {
    return { success: false, error: 'Caracteres inválidos en los campos de registro.' };
  }

  if (!safeName || safeName.length < 3) {
    return { success: false, error: 'Ingresá tu nombre y apellido completo.' };
  }

  if (!safePhone || safePhone.length < 7) {
    return { success: false, error: 'Ingresá un número de teléfono válido.' };
  }

  if (input.password && (input.password.length < 4 || input.password.length > 128)) {
    return { success: false, error: 'La contraseña debe tener entre 4 y 128 caracteres.' };
  }

  const existingUsers = getRegisteredUsers();
  const phoneExists = existingUsers.some(
    u => u.role === 'cliente' && sanitizePhone(u.phone) === safePhone
  );

  if (phoneExists) {
    return { 
      success: false, 
      error: 'Ya existe una cuenta de vecino con este número. Por favor, iniciá sesión.' 
    };
  }

  const newUser: AuthUser = {
    id: `usr-client-${Date.now().toString(36)}`,
    name: safeName,
    phone: safePhone,
    password: input.password || '1234',
    address: safeAddress,
    role: 'cliente',
    createdAt: new Date().toISOString()
  };

  existingUsers.push(newUser);
  saveRegisteredUsers(existingUsers);

  setCurrentUser(newUser);
  return { success: true, user: newUser };
}

export function logout(): void {
  setCurrentUser(null);
}
