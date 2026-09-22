// Utilidades de Seguridad, Sanitización y Prevención de Fraude para AcáNomás Balcarce

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;'
};

/**
 * Escapa caracteres HTML peligrosos para prevenir inyección de código (DOM XSS)
 * al renderizar datos en Leaflet markers, tooltips o popups.
 */
export function escapeHtml(str: string | undefined | null): string {
  if (!str) return '';
  return String(str).replace(/[&<>"'/]/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Sanitiza texto de entrada del usuario:
 * - Elimina tags HTML (<...>)
 * - Remueve caracteres de control nulos (\0)
 * - Remueve directivas javascript: o data:
 * - Trunca la longitud máxima para prevenir DoS
 * - Normaliza espacios
 */
export function sanitizeTextInput(input: string | undefined | null, maxLength = 250): string {
  if (!input) return '';
  
  let cleaned = String(input)
    .replace(/\0/g, '') // Quitar null bytes
    .replace(/<[^>]*>?/gm, '') // Quitar tags HTML
    .replace(/javascript:/gi, '') // Quitar pseudo-protocolos
    .replace(/data:\s*text\/html/gi, '')
    .trim();

  // Limitar longitud para evitar payloads masivos
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength).trim();
  }

  return cleaned;
}

/**
 * Valida y formatea números de teléfono.
 * Permite números argentinos locales o internacionales (ej: 2266551122 o +5492266...)
 */
export function sanitizePhone(phone: string | undefined | null): string {
  if (!phone) return '';
  // Conservar solo dígitos y el signo + si está al inicio
  const hasPlus = phone.trim().startsWith('+');
  const digits = phone.replace(/[^0-9]/g, '');
  
  if (digits.length < 6 || digits.length > 16) {
    return digits;
  }
  
  return hasPlus ? `+${digits}` : digits;
}

/**
 * Sanitiza y valida URLs de imágenes (avatar, DNI, etc.).
 * Solo permite protocolos https:, http:, o datos seguros data:image/(jpeg|png|webp);base64,
 * Rechaza SVGs (pueden contener scripts embebidos) y URLs javascript:
 */
export function sanitizeImageUrl(
  url: string | undefined | null,
  fallback = 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80'
): string {
  if (!url) return fallback;
  const trimmed = url.trim();

  // Permitir datos en base64 solo para formatos de imagen seguros (NO SVG)
  if (trimmed.startsWith('data:image/jpeg;base64,') || 
      trimmed.startsWith('data:image/png;base64,') || 
      trimmed.startsWith('data:image/webp;base64,')) {
    return trimmed;
  }

  // Si es URL remota, debe ser http o https segura y no contener caracteres de inyección
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      // Bloquear extensiones potencialmente peligrosas
      const lowerPath = parsed.pathname.toLowerCase();
      if (lowerPath.endsWith('.svg') || lowerPath.endsWith('.html') || lowerPath.endsWith('.js')) {
        return fallback;
      }
      return trimmed;
    }
  } catch {
    // Si es una ruta relativa local segura (ej: /icon-192.png)
    if (trimmed.startsWith('/') && !trimmed.includes('//') && !trimmed.includes('<')) {
      return trimmed;
    }
  }

  return fallback;
}

/**
 * Detector de patrones maliciosos conocidos (XSS, SQL Injection tokens, path traversal).
 */
export function detectMaliciousPayload(text: string | undefined | null): boolean {
  if (!text) return false;
  const raw = String(text).toLowerCase();

  const suspiciousPatterns = [
    /<script\b/i,
    /<\/script>/i,
    /javascript:/i,
    /onload\s*=/i,
    /onerror\s*=/i,
    /onclick\s*=/i,
    /eval\s*\(/i,
    /union\s+select/i,
    /'\s*or\s*'1'\s*=\s*'1/i,
    /"\s*or\s*"1"\s*=\s*"1/i,
    /;\s*drop\s+table/i,
    /\.\.\// // Path traversal
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(raw));
}

// -------------------------------------------------------------
// SISTEMA DE RATE LIMITING Y BLOQUEO TEMPORAL (LOCKOUT)
// -------------------------------------------------------------

interface RateLimitEntry {
  attempts: number;
  lockedUntil: number | null; // timestamp en ms
}

const RATE_LIMIT_PREFIX = 'acanomas_rl_';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 segundos de bloqueo

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function getRateLimitEntry(key: string): RateLimitEntry {
  if (!isBrowser()) return { attempts: 0, lockedUntil: null };
  try {
    const raw = sessionStorage.getItem(`${RATE_LIMIT_PREFIX}${key}`);
    if (!raw) return { attempts: 0, lockedUntil: null };
    return JSON.parse(raw);
  } catch {
    return { attempts: 0, lockedUntil: null };
  }
}

function setRateLimitEntry(key: string, entry: RateLimitEntry): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.setItem(`${RATE_LIMIT_PREFIX}${key}`, JSON.stringify(entry));
  } catch {
    // Silently ignore storage quota errors
  }
}

/**
 * Verifica si un identificador (ej: teléfono o admin) está bloqueado por demasiados intentos.
 */
export function checkRateLimit(key: string): { 
  allowed: boolean; 
  remainingSeconds?: number;
  attemptsLeft?: number;
} {
  const entry = getRateLimitEntry(key);
  const now = Date.now();

  if (entry.lockedUntil && entry.lockedUntil > now) {
    const remainingSeconds = Math.ceil((entry.lockedUntil - now) / 1000);
    return {
      allowed: false,
      remainingSeconds,
      attemptsLeft: 0
    };
  }

  // Si ya venció el tiempo de bloqueo, resetear
  if (entry.lockedUntil && entry.lockedUntil <= now) {
    resetRateLimit(key);
    return { allowed: true, attemptsLeft: MAX_ATTEMPTS };
  }

  return {
    allowed: true,
    attemptsLeft: Math.max(0, MAX_ATTEMPTS - entry.attempts)
  };
}

/**
 * Registra un intento fallido y activa bloqueo si alcanza el límite.
 */
export function recordFailedAttempt(key: string): { 
  locked: boolean; 
  remainingSeconds?: number;
  attemptsLeft?: number;
} {
  const entry = getRateLimitEntry(key);
  entry.attempts += 1;

  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    setRateLimitEntry(key, entry);
    return {
      locked: true,
      remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
      attemptsLeft: 0
    };
  }

  setRateLimitEntry(key, entry);
  return {
    locked: false,
    attemptsLeft: Math.max(0, MAX_ATTEMPTS - entry.attempts)
  };
}

/**
 * Limpia el contador de intentos tras un inicio de sesión exitoso.
 */
export function resetRateLimit(key: string): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.removeItem(`${RATE_LIMIT_PREFIX}${key}`);
  } catch {
    // Ignore
  }
}

// -------------------------------------------------------------
// PREVENCIÓN DE FLOODING / SPAM EN SOLICITUDES DE SERVICIO
// -------------------------------------------------------------

const COOLDOWN_KEY = 'acanomas_request_last_ts';
const COOLDOWN_SECONDS = 20; // 20 segundos mínimos entre solicitudes de un mismo cliente

export function checkRequestSpamCooldown(): { allowed: boolean; remainingSeconds?: number } {
  if (!isBrowser()) return { allowed: true };
  try {
    const last = sessionStorage.getItem(COOLDOWN_KEY);
    if (!last) return { allowed: true };
    
    const elapsedSeconds = (Date.now() - parseInt(last, 10)) / 1000;
    if (elapsedSeconds < COOLDOWN_SECONDS) {
      return {
        allowed: false,
        remainingSeconds: Math.ceil(COOLDOWN_SECONDS - elapsedSeconds)
      };
    }
    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

export function recordRequestSubmission(): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.setItem(COOLDOWN_KEY, Date.now().toString());
  } catch {
    // Ignore
  }
}
