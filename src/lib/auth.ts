import { AuthUser, UserRole } from '@/types';
import { getProviders } from './store';

const AUTH_USER_KEY = 'acanomas_current_user_v1';

export const ADMIN_CREDENTIALS = {
  email: 'admin@acanomas.com',
  password: 'admin123', // Clave por defecto para demostración y administración
  pin: '1234'
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
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
  // Dispatch custom event so navbar and components re-render immediately
  window.dispatchEvent(new Event('auth-change'));
}

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

export function loginAsPrestador(providerId: string): { success: boolean; user?: AuthUser; error?: string } {
  const providers = getProviders();
  const provider = providers.find(p => p.id === providerId);
  if (!provider) {
    return { success: false, error: 'Prestador no encontrado en el sistema.' };
  }

  const prestadorUser: AuthUser = {
    id: `usr-${provider.id}`,
    name: provider.name,
    role: 'prestador',
    phone: provider.phone,
    providerId: provider.id
  };
  setCurrentUser(prestadorUser);
  return { success: true, user: prestadorUser };
}

export function loginAsCliente(name: string, phone: string): { success: boolean; user?: AuthUser } {
  const clienteUser: AuthUser = {
    id: `usr-client-${Date.now().toString(36)}`,
    name: name || 'Vecino de Balcarce',
    role: 'cliente',
    phone: phone || ''
  };
  setCurrentUser(clienteUser);
  return { success: true, user: clienteUser };
}

export function logout(): void {
  setCurrentUser(null);
}
