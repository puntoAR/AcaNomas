import { AuthUser, Provider, UserRole } from '@/types';
import { getProviders, createProvider, BALCARCE_CENTER } from './store';

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

// 1. ADMIN LOGIN
export function loginAsAdmin(password: string): { success: boolean; error?: string } {
  if (password === ADMIN_CREDENTIALS.password || password === ADMIN_CREDENTIALS.pin) {
    const adminUser: AuthUser = {
      id: 'usr-admin-1',
      name: 'Administrador AcáNomás',
      email: ADMIN_CREDENTIALS.email,
      role: 'admin'
    };
    setCurrentUser(adminUser);
    return { success: true };
  }
  return { success: false, error: 'Contraseña o PIN incorrecto. (Probá con admin123)' };
}

// 2. PRESTADOR LOGIN & REGISTRO
export function loginPrestador(
  phone: string,
  password?: string
): { success: boolean; user?: AuthUser; error?: string } {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const users = getRegisteredUsers();
  
  const user = users.find(
    u => u.role === 'prestador' && (u.phone?.replace(/[^0-9]/g, '') === cleanPhone || u.phone?.includes(cleanPhone))
  );

  if (!user) {
    // Check if phone matches any provider in store directly
    const providers = getProviders();
    const provider = providers.find(p => p.phone.includes(cleanPhone));
    if (provider) {
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
    return { success: false, error: 'No encontramos ningún prestador registrado con ese teléfono. Registrate a continuación.' };
  }

  if (password && user.password && user.password !== password) {
    return { success: false, error: 'Contraseña incorrecta para este prestador.' };
  }

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
  if (!input.name || !input.phone || !input.category) {
    return { success: false, error: 'Completá todos los campos requeridos.' };
  }

  if (!input.dniPhotoUrl) {
    return { success: false, error: 'La foto de tu DNI es obligatoria para verificar tu identidad y cuidar la seguridad de los vecinos de Balcarce.' };
  }

  const cleanPhone = input.phone.replace(/[^0-9]/g, '');
  const newProviderId = 'prov-' + Date.now().toString(36);

  // Create provider in main store with dniStatus = pending!
  const newProvider: Provider = {
    id: newProviderId,
    name: input.name,
    realName: input.name,
    category: input.category === 'otro' ? (input.customCategory?.toLowerCase().trim() || 'otro') : input.category,
    customCategory: input.category === 'otro' ? input.customCategory : undefined,
    isProtected: false,
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
    phone: input.phone,
    zoneName: input.zoneName || 'Balcarce Centro',
    location: {
      lat: BALCARCE_CENTER.lat + (Math.random() * 0.01 - 0.005),
      lng: BALCARCE_CENTER.lng + (Math.random() * 0.01 - 0.005)
    },
    coverageRadiusKm: input.coverageRadiusKm || 6,
    isVerified: false,
    dniStatus: 'pending', // PENDIENTE DE REVISIÓN EN ADMIN CON SU FOTO
    dniDocumentUrl: input.dniPhotoUrl,
    isMatriculado: input.isMatriculado,
    matriculaNumber: input.isMatriculado ? input.matriculaNumber : undefined,
    matriculaStatus: input.isMatriculado ? 'pending' : 'none',
    isPremium: false,
    rating: 5.0,
    reviewCount: 0,
    punctualityScore: 100,
    servicesCompleted: 0,
    bio: input.bio || `Profesional de oficio en Balcarce. Soluciones con garantía y puntualidad asegurada.`,
    experienceYears: 4,
    createdAt: new Date().toISOString().split('T')[0]
  };

  createProvider(newProvider);

  // Create user in auth database
  const newUser: AuthUser = {
    id: `usr-${newProviderId}`,
    name: input.name,
    role: 'prestador',
    phone: input.phone,
    password: input.password || '1234',
    dniPhotoUrl: input.dniPhotoUrl,
    providerId: newProviderId,
    createdAt: new Date().toISOString()
  };

  const users = getRegisteredUsers();
  users.push(newUser);
  saveRegisteredUsers(users);

  setCurrentUser(newUser);
  return { success: true, user: newUser };
}

// 3. CLIENTE / VECINO LOGIN & REGISTRO
export function loginCliente(
  phone: string,
  password?: string
): { success: boolean; user?: AuthUser; error?: string } {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const users = getRegisteredUsers();

  const user = users.find(
    u => u.role === 'cliente' && u.phone?.replace(/[^0-9]/g, '') === cleanPhone
  );

  if (!user) {
    return { success: false, error: 'No encontramos una cuenta con ese teléfono. Podés registrarte en un clic abajo.' };
  }

  if (password && user.password && user.password !== password) {
    return { success: false, error: 'Contraseña incorrecta.' };
  }

  setCurrentUser(user);
  return { success: true, user };
}

export function registerCliente(input: {
  name: string;
  phone: string;
  password?: string;
  address?: string;
}): { success: boolean; user?: AuthUser; error?: string } {
  if (!input.name || !input.phone) {
    return { success: false, error: 'Por favor ingresá tu nombre y teléfono.' };
  }

  const newUser: AuthUser = {
    id: `usr-client-${Date.now().toString(36)}`,
    name: input.name,
    phone: input.phone,
    password: input.password || '1234',
    address: input.address || 'Balcarce, Bs. As.',
    role: 'cliente',
    createdAt: new Date().toISOString()
  };

  const users = getRegisteredUsers();
  users.push(newUser);
  saveRegisteredUsers(users);

  setCurrentUser(newUser);
  return { success: true, user: newUser };
}

export function logout(): void {
  setCurrentUser(null);
}
