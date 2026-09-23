import { AuthUser, Provider } from '@/types';
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
  username: 'jroman2266',
  email: 'jroman2266@acanomas.com',
  defaultPassword: '1234',
  pin: '1234'
};

const INITIAL_USERS: AuthUser[] = [
  {
    id: 'usr-admin-1',
    name: 'Administrador AcáNomás',
    username: 'jroman2266',
    email: ADMIN_CREDENTIALS.email,
    password: ADMIN_CREDENTIALS.defaultPassword,
    mustChangePassword: true,
    role: 'admin'
  },
  {
    id: 'usr-prov-roberto-gomez',
    name: 'Roberto Gómez',
    username: 'robertogomez',
    phone: '2266551122',
    password: '1234',
    role: 'prestador',
    providerId: 'prov-roberto-gomez'
  },
  {
    id: 'usr-prov-marisa-lopez',
    name: 'Marisa López',
    username: 'marisalopez',
    phone: '2266442233',
    password: '1234',
    role: 'prestador',
    providerId: 'prov-marisa-lopez'
  },
  {
    id: 'usr-prov-carlos-plomero',
    name: 'Carlos M. (Plomería Balcarce)',
    username: 'carlosplomero',
    phone: '2266338877',
    password: '1234',
    role: 'prestador',
    providerId: 'prov-carlos-plomero'
  },
  {
    id: 'usr-client-demo-1',
    name: 'Esteban Di Meglio',
    username: 'estebandimeglio',
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
    const parsed: AuthUser[] = JSON.parse(raw);
    
    // Asegurar que el usuario admin jroman2266 esté siempre presente y sincronizado
    const adminIdx = parsed.findIndex(u => u.role === 'admin');
    if (adminIdx === -1) {
      parsed.unshift(INITIAL_USERS[0]);
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(parsed));
    } else {
      let updated = false;
      if (!parsed[adminIdx].username) {
        parsed[adminIdx].username = 'jroman2266';
        updated = true;
      }
      if (parsed[adminIdx].password === '1234' && parsed[adminIdx].mustChangePassword === undefined) {
        parsed[adminIdx].mustChangePassword = true;
        updated = true;
      }
      if (updated) {
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(parsed));
      }
    }
    return parsed;
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

// ==========================================
// UTILIDADES: GENERACIÓN DE CLAVE Y SUGERENCIAS DE USUARIO
// ==========================================

export function generateSecurePassword(): string {
  // Clave amigable pero robusta (8-10 caracteres mezclando mayúsculas, minúsculas, números y símbolo)
  const lettersUpper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lettersLower = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%*';

  let pwd = '';
  pwd += lettersUpper.charAt(Math.floor(Math.random() * lettersUpper.length));
  pwd += lettersLower.charAt(Math.floor(Math.random() * lettersLower.length));
  pwd += lettersLower.charAt(Math.floor(Math.random() * lettersLower.length));
  pwd += numbers.charAt(Math.floor(Math.random() * numbers.length));
  pwd += numbers.charAt(Math.floor(Math.random() * numbers.length));
  pwd += symbols.charAt(Math.floor(Math.random() * symbols.length));
  pwd += lettersUpper.charAt(Math.floor(Math.random() * lettersUpper.length));
  pwd += lettersLower.charAt(Math.floor(Math.random() * lettersLower.length));

  // Barajar caracteres
  return pwd.split('').sort(() => 0.5 - Math.random()).join('');
}

export function isUsernameTaken(username: string, excludeUserId?: string): boolean {
  const clean = username.trim().toLowerCase();
  if (!clean) return false;
  if (clean === ADMIN_CREDENTIALS.username.toLowerCase()) {
    return excludeUserId !== 'usr-admin-1';
  }
  const users = getRegisteredUsers();
  return users.some(u => u.id !== excludeUserId && u.username?.toLowerCase() === clean);
}

export function suggestAvailableUsernames(baseUsername: string): string[] {
  const clean = baseUsername.toLowerCase().replace(/[^a-z0-9._]/g, '') || 'usuario';
  const suggestions: string[] = [];
  const suffixes = [
    '2266',
    'bce',
    new Date().getFullYear().toString(),
    Math.floor(10 + Math.random() * 89).toString(),
    Math.floor(100 + Math.random() * 899).toString(),
    'ok'
  ];

  for (const suffix of suffixes) {
    const candidate = `${clean}${suffix}`;
    if (!isUsernameTaken(candidate) && !suggestions.includes(candidate)) {
      suggestions.push(candidate);
    }
    if (suggestions.length >= 3) break;
  }

  // Alternativa con guión bajo si aún faltan
  if (suggestions.length < 3) {
    const candidate = `${clean}_bce`;
    if (!isUsernameTaken(candidate) && !suggestions.includes(candidate)) {
      suggestions.push(candidate);
    }
  }

  return suggestions;
}

// ==========================================
// CAMBIO DE CONTRASEÑA OBLIGATORIO / VOLUNTARIO
// ==========================================

export function updateUserPassword(
  userId: string, 
  newPassword: string
): { success: boolean; error?: string } {
  if (!newPassword || newPassword.length < 4) {
    return { success: false, error: 'La nueva contraseña debe tener al menos 4 caracteres.' };
  }
  if (newPassword === '1234') {
    return { success: false, error: 'Por seguridad, ingresá una contraseña diferente a la clave por defecto (1234).' };
  }

  const users = getRegisteredUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    // Si no está en la lista pero es el admin actual
    const curr = getCurrentUser();
    if (curr && curr.id === userId) {
      curr.password = newPassword;
      curr.mustChangePassword = false;
      setCurrentUser(curr);
      return { success: true };
    }
    return { success: false, error: 'Usuario no encontrado.' };
  }

  users[userIndex].password = newPassword;
  users[userIndex].mustChangePassword = false;
  saveRegisteredUsers(users);

  const curr = getCurrentUser();
  if (curr && curr.id === userId) {
    curr.password = newPassword;
    curr.mustChangePassword = false;
    setCurrentUser(curr);
  }

  return { success: true };
}

// ==========================================
// 1. INICIO DE SESIÓN UNIFICADO (ADMIN, PRESTADOR O VECINO)
// ==========================================
export function loginUser(
  identifier: string,
  password?: string
): { 
  success: boolean; 
  user?: AuthUser; 
  mustChangePassword?: boolean;
  error?: string; 
  isLocked?: boolean; 
  remainingSeconds?: number 
} {
  const cleanId = identifier.trim();
  const cleanIdLower = cleanId.toLowerCase();
  const cleanPhone = sanitizePhone(cleanId);
  const cleanPassword = password?.trim() || '';

  if (!cleanId) {
    return { success: false, error: 'Por favor ingresá tu nombre de usuario, teléfono o email.' };
  }

  if (detectMaliciousPayload(cleanId) || (cleanPassword && detectMaliciousPayload(cleanPassword))) {
    return { success: false, error: 'Se detectaron caracteres o instrucciones no permitidas.' };
  }

  const rateLimitKey = `login_rate_${cleanPhone || cleanIdLower}`;
  const check = checkRateLimit(rateLimitKey);

  if (!check.allowed) {
    return {
      success: false,
      isLocked: true,
      remainingSeconds: check.remainingSeconds,
      error: `Demasiados intentos erróneos. Acceso suspendido temporalmente por ${check.remainingSeconds} segundos.`
    };
  }

  // 1.1 COMPROBAR SI ES EL ADMINISTRADOR (jroman2266 o email)
  const users = getRegisteredUsers();
  const adminUser = users.find(u => u.role === 'admin') || INITIAL_USERS[0];

  const isAdminIdentifier = 
    cleanIdLower === ADMIN_CREDENTIALS.username.toLowerCase() ||
    cleanIdLower === ADMIN_CREDENTIALS.email.toLowerCase() ||
    cleanIdLower === 'admin';

  if (isAdminIdentifier) {
    const validPassword = adminUser.password || ADMIN_CREDENTIALS.defaultPassword;
    if (cleanPassword === validPassword || cleanPassword === ADMIN_CREDENTIALS.pin) {
      resetRateLimit(rateLimitKey);
      const sessionUser: AuthUser = {
        id: adminUser.id,
        name: adminUser.name,
        username: adminUser.username || ADMIN_CREDENTIALS.username,
        email: adminUser.email || ADMIN_CREDENTIALS.email,
        role: 'admin',
        mustChangePassword: Boolean(adminUser.mustChangePassword)
      };
      setCurrentUser(sessionUser);
      return { 
        success: true, 
        user: sessionUser, 
        mustChangePassword: Boolean(adminUser.mustChangePassword) 
      };
    } else {
      const failed = recordFailedAttempt(rateLimitKey);
      return {
        success: false,
        isLocked: failed.locked,
        remainingSeconds: failed.remainingSeconds,
        error: failed.locked 
          ? `Límite de intentos alcanzado. Bloqueado por ${failed.remainingSeconds}s.`
          : `Contraseña incorrecta. Te quedan ${failed.attemptsLeft} intentos.`
      };
    }
  }

  // 1.2 COMPROBAR EN USUARIOS REGISTRADOS (Por username, email o teléfono)
  const user = users.find(u => {
    if (u.username && u.username.toLowerCase() === cleanIdLower) return true;
    if (u.email && u.email.toLowerCase() === cleanIdLower) return true;
    if (cleanPhone && u.phone && sanitizePhone(u.phone) === cleanPhone) return true;
    return false;
  });

  if (user) {
    if (cleanPassword && user.password && user.password !== cleanPassword) {
      const failed = recordFailedAttempt(rateLimitKey);
      return {
        success: false,
        isLocked: failed.locked,
        remainingSeconds: failed.remainingSeconds,
        error: failed.locked
          ? `Acceso temporalmente bloqueado por ${failed.remainingSeconds}s.`
          : `Contraseña incorrecta. Te quedan ${failed.attemptsLeft} intentos.`
      };
    }

    resetRateLimit(rateLimitKey);
    setCurrentUser(user);
    return { 
      success: true, 
      user, 
      mustChangePassword: Boolean(user.mustChangePassword) 
    };
  }

  // 1.3 COMPROBAR PRESTADORES PRECARGADOS EN STORE POR TELÉFONO
  if (cleanPhone) {
    const providers = getProviders();
    const provider = providers.find(p => sanitizePhone(p.phone).includes(cleanPhone));
    if (provider) {
      resetRateLimit(rateLimitKey);
      const newUser: AuthUser = {
        id: `usr-${provider.id}`,
        name: provider.name,
        username: provider.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        role: 'prestador',
        phone: provider.phone,
        providerId: provider.id
      };
      setCurrentUser(newUser);
      return { success: true, user: newUser, mustChangePassword: false };
    }
  }

  const failed = recordFailedAttempt(rateLimitKey);
  return {
    success: false,
    isLocked: failed.locked,
    remainingSeconds: failed.remainingSeconds,
    error: failed.locked
      ? `Acceso temporalmente bloqueado por ${failed.remainingSeconds}s.`
      : 'No encontramos una cuenta con esos datos. Verificá tu usuario/teléfono o registrate en un clic.'
  };
}

// 2. MÉTODOS DE COMPATIBILIDAD
export function loginAsAdmin(password: string) {
  return loginUser(ADMIN_CREDENTIALS.username, password);
}

export function loginPrestador(phone: string, password?: string) {
  return loginUser(phone, password);
}

export function loginCliente(phone: string, password?: string) {
  return loginUser(phone, password);
}

// ==========================================
// 3. REGISTRO SEGURO DE PRESTADOR
// ==========================================
export interface RegisterPrestadorInput {
  name: string;
  username?: string;
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
  const safeUsername = input.username ? input.username.trim().toLowerCase().replace(/[^a-z0-9._]/g, '') : '';
  const safeCategory = sanitizeTextInput(input.category, 40);
  const safeCustomCategory = sanitizeTextInput(input.customCategory, 40);
  const safeZone = sanitizeTextInput(input.zoneName, 80) || 'Balcarce Centro';
  const safeBio = sanitizeTextInput(input.bio, 400);
  const safeMatricula = sanitizeTextInput(input.matriculaNumber, 30);
  const safeDniPhoto = sanitizeImageUrl(input.dniPhotoUrl, '');

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

  if (safeUsername && isUsernameTaken(safeUsername)) {
    return { success: false, error: `El nombre de usuario "${safeUsername}" ya está en uso. Por favor elegí otro.` };
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

  // Control Anti-Duplicación
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
  const finalUsername = safeUsername || safeName.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(10 + Math.random() * 89);

  // Crear prestador
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
    dniStatus: 'pending',
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

  // Crear usuario auth
  const newUser: AuthUser = {
    id: `usr-${newProviderId}`,
    name: safeName,
    username: finalUsername,
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

// ==========================================
// 4. REGISTRO SEGURO DE CLIENTE / VECINO
// ==========================================
export function registerCliente(input: {
  name: string;
  username?: string;
  phone: string;
  password?: string;
  address?: string;
}): { success: boolean; user?: AuthUser; error?: string } {
  const safeName = sanitizeTextInput(input.name, 60);
  const safePhone = sanitizePhone(input.phone);
  const safeUsername = input.username ? input.username.trim().toLowerCase().replace(/[^a-z0-9._]/g, '') : '';
  const safeAddress = sanitizeTextInput(input.address, 100) || 'Balcarce, Bs. As.';

  if (detectMaliciousPayload(input.name) || detectMaliciousPayload(input.phone) || detectMaliciousPayload(input.address)) {
    return { success: false, error: 'Caracteres inválidos en los campos de registro.' };
  }

  if (!safeName || safeName.length < 3) {
    return { success: false, error: 'Ingresá tu nombre y apellido completo.' };
  }

  if (safeUsername && isUsernameTaken(safeUsername)) {
    return { success: false, error: `El nombre de usuario "${safeUsername}" ya está en uso. Por favor elegí otro.` };
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

  const finalUsername = safeUsername || safeName.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(10 + Math.random() * 89);

  const newUser: AuthUser = {
    id: `usr-client-${Date.now().toString(36)}`,
    name: safeName,
    username: finalUsername,
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
