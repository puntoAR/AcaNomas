'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  UserCheck, 
  User, 
  Lock, 
  ArrowLeft, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  Crown,
  Sparkles,
  LogOut,
  Upload,
  Camera,
  MapPin,
  Phone,
  Briefcase,
  Award
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { UserRole, Provider, AuthUser } from '@/types';
import { 
  getCurrentUser, 
  loginAsAdmin, 
  loginPrestador, 
  registerPrestador, 
  loginCliente, 
  registerCliente, 
  logout 
} from '@/lib/auth';
import { getCategories } from '@/lib/store';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '';
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<UserRole>('prestador');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const categories = getCategories();

  // General error / success message & Security Lockout
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [lockCountdown, setLockCountdown] = useState<number | null>(null);

  // Countdown timer for security lockout
  useEffect(() => {
    if (lockCountdown === null || lockCountdown <= 0) return;
    const timer = setInterval(() => {
      setLockCountdown((prev) => {
        if (prev === null || prev <= 1) {
          setErrorMsg('');
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockCountdown]);

  // Form Fields - Common
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Form Fields - Prestador Registration
  const [category, setCategory] = useState('plomero');
  const [customCategory, setCustomCategory] = useState('');
  const [zoneName, setZoneName] = useState('Zona Centro / Plaza Libertad');
  const [coverageRadiusKm, setCoverageRadiusKm] = useState(7);
  const [dniPhotoUrl, setDniPhotoUrl] = useState('');
  const [isMatriculado, setIsMatriculado] = useState(false);
  const [matriculaNumber, setMatriculaNumber] = useState('');
  const [bio, setBio] = useState('');

  // Form Fields - Cliente Registration
  const [address, setAddress] = useState('Calle 18 y 21, Balcarce');

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  // Handle DNI file upload & preview with security validation
  const handleDniUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. Validar tipo MIME estricto (solo imágenes reales, NO SVG que puedan contener XSS)
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMimes.includes(file.type.toLowerCase())) {
        setErrorMsg('Formato de archivo no permitido. Solo se aceptan fotos reales en JPG, PNG o WebP.');
        return;
      }

      // 2. Validar tamaño de archivo (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('El archivo es demasiado pesado. El tamaño máximo para el documento es de 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setDniPhotoUrl(reader.result as string);
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper for quick simulated DNI photo
  const handleSimulateDni = () => {
    setDniPhotoUrl('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80');
    setErrorMsg('');
  };

  // SUBMIT HANDLERS
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // 1. ADMIN LOGIN
    if (role === 'admin') {
      const res = loginAsAdmin(password);
      if (res.success) {
        setLockCountdown(null);
        router.push(redirectTarget || '/admin');
      } else {
        if (res.isLocked && res.remainingSeconds) {
          setLockCountdown(res.remainingSeconds);
        }
        setErrorMsg(res.error || 'Credenciales incorrectas');
      }
      return;
    }

    // 2. PRESTADOR
    if (role === 'prestador') {
      if (mode === 'login') {
        const res = loginPrestador(phone, password);
        if (res.success) {
          setLockCountdown(null);
          router.push(redirectTarget || '/panel-prestador');
        } else {
          if (res.isLocked && res.remainingSeconds) {
            setLockCountdown(res.remainingSeconds);
          }
          setErrorMsg(res.error || 'Error al iniciar sesión');
        }
      } else {
        // Register Prestador - VALIDAR DNI OBLIGATORIO
        if (!dniPhotoUrl) {
          setErrorMsg('La foto de tu DNI es obligatoria para verificar tu identidad y cuidar la seguridad del barrio.');
          return;
        }

        const res = registerPrestador({
          name,
          phone,
          password: password || '1234',
          category,
          customCategory,
          zoneName,
          coverageRadiusKm,
          dniPhotoUrl,
          isMatriculado,
          matriculaNumber,
          bio
        });

        if (res.success) {
          setSuccessMsg('¡Registro completado! Tu DNI ha sido enviado para verificación. Redirigiendo...');
          setTimeout(() => router.push(redirectTarget || '/panel-prestador'), 1500);
        } else {
          setErrorMsg(res.error || 'Error en el registro.');
        }
      }
      return;
    }

    // 3. CLIENTE
    if (role === 'cliente') {
      if (mode === 'login') {
        const res = loginCliente(phone, password);
        if (res.success) {
          setLockCountdown(null);
          router.push(redirectTarget || '/mis-turnos');
        } else {
          if (res.isLocked && res.remainingSeconds) {
            setLockCountdown(res.remainingSeconds);
          }
          setErrorMsg(res.error || 'Error al iniciar sesión');
        }
      } else {
        const res = registerCliente({
          name,
          phone,
          password: password || '1234',
          address
        });
        if (res.success) {
          setSuccessMsg('¡Cuenta creada con éxito! Redirigiendo a tus turnos...');
          setTimeout(() => router.push(redirectTarget || '/mis-turnos'), 1200);
        } else {
          setErrorMsg(res.error || 'Error al registrarte.');
        }
      }
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16">
      <Navbar />

      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-6 sm:py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </Link>

        {/* If user is already logged in, show session card */}
        {currentUser ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Sesión Activa
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-2">{currentUser.name}</h2>
              <p className="text-xs text-slate-500 capitalize">
                Rol: <strong>{currentUser.role}</strong> {currentUser.phone && `• Tel: ${currentUser.phone}`}
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              {currentUser.role === 'admin' && (
                <Link
                  href="/admin"
                  className="w-full py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs"
                >
                  Ir al Panel de Administrador
                </Link>
              )}
              {currentUser.role === 'prestador' && (
                <Link
                  href="/panel-prestador"
                  className="w-full py-3 rounded-xl font-bold text-xs text-white bg-orange-600 hover:bg-orange-700 shadow-xs"
                >
                  Ir a mi Panel de Prestador
                </Link>
              )}
              {currentUser.role === 'cliente' && (
                <Link
                  href="/mis-turnos"
                  className="w-full py-3 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 shadow-xs"
                >
                  Ver mis turnos y GPS en vivo
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header with Mode Toggle: Iniciar Sesión vs Registrarse */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white text-center">
              <h1 className="text-xl font-black">Acceso a AcáNomás Balcarce</h1>
              <p className="text-xs text-slate-400 mt-1">
                La plataforma de oficios y servicios de tu barrio
              </p>

              {/* Mode Switcher */}
              <div className="mt-4 inline-flex p-1 bg-slate-800 rounded-2xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(''); }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    mode === 'login'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMsg(''); }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    mode === 'register'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Crear Cuenta Nueva
                </button>
              </div>
            </div>

            {/* Role Tabs */}
            <div className="grid grid-cols-3 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => { setRole('prestador'); setErrorMsg(''); }}
                className={`py-2 rounded-xl transition-all flex flex-col items-center gap-1 ${
                  role === 'prestador'
                    ? 'bg-white text-orange-600 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Soy Prestador</span>
              </button>

              <button
                type="button"
                onClick={() => { setRole('cliente'); setErrorMsg(''); }}
                className={`py-2 rounded-xl transition-all flex flex-col items-center gap-1 ${
                  role === 'cliente'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Soy Vecino</span>
              </button>

              <button
                type="button"
                onClick={() => { setRole('admin'); setMode('login'); setErrorMsg(''); }}
                className={`py-2 rounded-xl transition-all flex flex-col items-center gap-1 ${
                  role === 'admin'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </div>

            {/* FORM CONTAINER */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              {/* Security Lockout Banner */}
              {lockCountdown !== null && lockCountdown > 0 && (
                <div className="p-4 rounded-2xl bg-rose-100 border-2 border-rose-300 text-xs font-semibold text-rose-900 flex items-start gap-2.5 animate-pulse">
                  <Lock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-black text-rose-950 uppercase tracking-wide">
                      Acceso Temporalmente Bloqueado por Seguridad
                    </h5>
                    <p className="mt-0.5 text-[11px] text-rose-800 leading-relaxed">
                      Se detectaron múltiples intentos erróneos. Para proteger la red barrial contra ataques automatizados, el acceso está suspendido por <strong>{lockCountdown} segundos</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* Alert Messages */}
              {errorMsg && lockCountdown === null && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* ----------------- ROL PRESTADOR ----------------- */}
              {role === 'prestador' && (
                <>
                  <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-2xl text-xs text-orange-950 flex items-start gap-2">
                    <UserCheck className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <span>
                      {mode === 'login'
                        ? 'Ingresá con tu teléfono registrado para gestionar tus turnos y activar el GPS "Voy en camino".'
                        : 'Sumate a AcáNomás. La validación con DNI es obligatoria para garantizar la seguridad de los vecinos.'}
                    </span>
                  </div>

                  {mode === 'register' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nombre y Apellido (o nombre de fantasía) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Marcelo Gómez (Gasista)"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ¿Qué oficio realizás? *
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                        >
                          {categories.filter(c => c.id !== 'todos').map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        {category === 'otro' && (
                          <input
                            type="text"
                            required
                            placeholder="Escribí tu oficio..."
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            className="mt-2 w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Barrio o Zona base en Balcarce *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Barrio Pueblo Nuevo / Calle 22 y 17"
                          value={zoneName}
                          onChange={(e) => setZoneName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                        />
                      </div>

                      {/* FOTO DE DNI OBLIGATORIA */}
                      <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-2.5">
                        <div className="flex items-start gap-2">
                          <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-xs font-black text-amber-950 uppercase tracking-wide">
                              Foto de DNI (Obligatoria) *
                            </h4>
                            <p className="text-[11px] text-amber-800 leading-relaxed">
                              Para otorgar la <strong>Estrella de Confianza</strong> y que tu perfil se active, debés adjuntar una foto legible de tu documento (frente o dorso).
                            </p>
                          </div>
                        </div>

                        {dniPhotoUrl ? (
                          <div className="relative rounded-xl overflow-hidden border border-amber-300 bg-white p-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img src={dniPhotoUrl} alt="DNI Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> Foto de DNI cargada
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setDniPhotoUrl('')}
                              className="text-xs text-rose-600 font-bold hover:underline"
                            >
                              Cambiar
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-amber-400 bg-white hover:bg-amber-50/50 cursor-pointer transition-colors text-center">
                              <Camera className="w-6 h-6 text-amber-600 mb-1" />
                              <span className="text-xs font-bold text-slate-800">
                                Tomar foto o seleccionar archivo de DNI
                              </span>
                              <span className="text-[10px] text-slate-500 mt-0.5">
                                Formatos JPG, PNG (máx. 10MB)
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleDniUpload}
                                className="hidden"
                              />
                            </label>

                            <button
                              type="button"
                              onClick={handleSimulateDni}
                              className="w-full text-center text-[11px] font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 py-1.5 rounded-lg transition-colors"
                            >
                              ⚡ Adjuntar foto de DNI de prueba (Simular carga)
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Matrícula Checkbox */}
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={isMatriculado}
                          onChange={(e) => setIsMatriculado(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                        />
                        <span>Soy profesional matriculado (Gas / Electricidad)</span>
                      </label>

                      {isMatriculado && (
                        <input
                          type="text"
                          placeholder="Número de matrícula oficial..."
                          value={matriculaNumber}
                          onChange={(e) => setMatriculaNumber(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
                        />
                      )}
                    </>
                  )}

                  {/* Teléfono & Contraseña */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Teléfono / WhatsApp *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        placeholder="Ej: 2266 551122"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contraseña *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        placeholder="Tu contraseña o PIN"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  {/* Demo helper logins */}
                  {mode === 'login' && (
                    <div className="pt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-1.5">
                      <span className="font-bold block text-slate-700">Acceso rápido de prueba para prestadores:</span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => { setPhone('2266551122'); setPassword('1234'); }}
                          className="px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-bold hover:bg-orange-50 hover:text-orange-700"
                        >
                          Roberto (Gasista)
                        </button>
                        <button
                          type="button"
                          onClick={() => { setPhone('2266442233'); setPassword('1234'); }}
                          className="px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-bold hover:bg-orange-50 hover:text-orange-700"
                        >
                          Marisa (Electricista)
                        </button>
                        <button
                          type="button"
                          onClick={() => { setPhone('2266338877'); setPassword('1234'); }}
                          className="px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-bold hover:bg-orange-50 hover:text-orange-700"
                        >
                          Carlos (Plomero)
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={Boolean(lockCountdown && lockCountdown > 0)}
                    className={`w-full py-3 rounded-xl font-black text-xs text-white shadow-md active:scale-98 transition-all ${
                      lockCountdown && lockCountdown > 0
                        ? 'bg-slate-400 cursor-not-allowed opacity-60'
                        : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/20'
                    }`}
                  >
                    {lockCountdown && lockCountdown > 0
                      ? `🔒 Bloqueado por seguridad (${lockCountdown}s)`
                      : mode === 'login'
                        ? 'Iniciar Sesión como Prestador'
                        : 'Crear Cuenta y Enviar DNI'}
                  </button>
                </>
              )}

              {/* ----------------- ROL CLIENTE / VECINO ----------------- */}
              {role === 'cliente' && (
                <>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 flex items-start gap-2">
                    <User className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <span>
                      {mode === 'login'
                        ? 'Ingresá con tu teléfono para ver tus solicitudes, horarios pactados y el mapa en vivo estilo Uber.'
                        : 'Registrate como vecino para solicitar visitas y calificar la atención de los prestadores de Balcarce.'}
                    </span>
                  </div>

                  {mode === 'register' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nombre y Apellido *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Marcelo Gómez"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Dirección en Balcarce *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Calle 20 N° 630 entre 15 y 17"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Teléfono / WhatsApp *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        placeholder="Ej: 2266 887766"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contraseña *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        placeholder="Tu contraseña o PIN"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </div>

                  {/* Demo helper for client */}
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setPhone('2266887766'); setPassword('1234'); }}
                      className="text-[11px] text-slate-400 hover:text-slate-600 block text-left"
                    >
                      (Autocompletar vecino de prueba: Esteban Di Meglio)
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={Boolean(lockCountdown && lockCountdown > 0)}
                    className={`w-full py-3 rounded-xl font-black text-xs text-white shadow-md active:scale-98 transition-all ${
                      lockCountdown && lockCountdown > 0
                        ? 'bg-slate-400 cursor-not-allowed opacity-60'
                        : 'bg-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    {lockCountdown && lockCountdown > 0
                      ? `🔒 Bloqueado por seguridad (${lockCountdown}s)`
                      : mode === 'login'
                        ? 'Iniciar Sesión como Vecino'
                        : 'Crear mi Cuenta de Vecino'}
                  </button>
                </>
              )}

              {/* ----------------- ROL ADMIN ----------------- */}
              {role === 'admin' && (
                <>
                  <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-start gap-2 text-xs text-indigo-950">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Acceso Restringido:</strong> Solo para moderadores autorizados de AcáNomás Balcarce.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contraseña de Administrador *
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        maxLength={128}
                        placeholder="Contraseña (admin123)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={Boolean(lockCountdown && lockCountdown > 0)}
                    className={`w-full py-3 rounded-xl font-black text-xs text-white shadow-md active:scale-98 transition-all ${
                      lockCountdown && lockCountdown > 0
                        ? 'bg-slate-400 cursor-not-allowed opacity-60'
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                    }`}
                  >
                    {lockCountdown && lockCountdown > 0
                      ? `🔒 Bloqueado por seguridad (${lockCountdown}s)`
                      : 'Ingresar al Panel Administrador'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPassword('admin123')}
                    className="w-full text-center text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    (Autocompletar clave: admin123)
                  </button>
                </>
              )}
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-400 text-xs font-medium">
          Cargando inicio de sesión...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
