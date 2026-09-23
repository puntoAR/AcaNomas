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
  Camera,
  MapPin,
  Phone,
  Briefcase,
  Copy,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { AuthUser } from '@/types';
import { 
  getCurrentUser, 
  loginUser, 
  registerPrestador, 
  registerCliente, 
  logout,
  isUsernameTaken,
  suggestAvailableUsernames,
  generateSecurePassword,
  updateUserPassword
} from '@/lib/auth';
import { getCategories } from '@/lib/store';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '';
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const initialRole = searchParams.get('role') === 'prestador' ? 'prestador' : 'cliente';

  const [mode, setMode] = useState<'login' | 'register' | 'change-password'>(initialMode);
  const [role, setRole] = useState<'cliente' | 'prestador'>(initialRole);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const categories = getCategories();

  // General error / success message & Security Lockout
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [lockCountdown, setLockCountdown] = useState<number | null>(null);

  // Form Fields - Login (UNIFICADO)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields - Registration Common
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [usernameError, setUsernameError] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(false);

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

  // Form Fields - Mandatory Password Change
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tempUserForPasswordChange, setTempUserForPasswordChange] = useState<AuthUser | null>(null);

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

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user?.mustChangePassword) {
      setTempUserForPasswordChange(user);
      setMode('change-password');
    }
  }, []);

  // Verificar username en tiempo real al escribir
  const handleUsernameChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9._]/g, '');
    setUsername(clean);

    if (!clean) {
      setUsernameError('');
      setUsernameSuggestions([]);
      return;
    }

    if (clean.length < 3) {
      setUsernameError('El usuario debe tener al menos 3 caracteres.');
      setUsernameSuggestions([]);
      return;
    }

    if (isUsernameTaken(clean)) {
      setUsernameError(`El nombre de usuario "${clean}" ya existe.`);
      const suggestions = suggestAvailableUsernames(clean);
      setUsernameSuggestions(suggestions);
    } else {
      setUsernameError('');
      setUsernameSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggested: string) => {
    setUsername(suggested);
    setUsernameError('');
    setUsernameSuggestions([]);
  };

  // Generador de clave segura
  const handleGeneratePassword = () => {
    const generated = generateSecurePassword();
    setRegPassword(generated);
    setShowPassword(true);
    setCopiedPassword(false);
  };

  const handleGenerateNewPasswordForChange = () => {
    const generated = generateSecurePassword();
    setNewPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
  };

  const handleCopyGeneratedPassword = (textToCopy: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2500);
    }
  };

  // Handle DNI file upload & preview
  const handleDniUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMimes.includes(file.type.toLowerCase())) {
        setErrorMsg('Formato no permitido. Solo se aceptan fotos reales en JPG, PNG o WebP.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('El archivo es demasiado pesado. El tamaño máximo es 5MB.');
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

  const handleSimulateDni = () => {
    setDniPhotoUrl('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80');
    setErrorMsg('');
  };

  // ==========================================
  // 1. SUBMIT: LOGIN UNIFICADO
  // ==========================================
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const res = loginUser(loginIdentifier, loginPassword);

    if (res.success && res.user) {
      setLockCountdown(null);
      
      // Si el usuario debe cambiar su contraseña obligatoriamente (ej: admin default 1234)
      if (res.mustChangePassword) {
        setTempUserForPasswordChange(res.user);
        setMode('change-password');
        setSuccessMsg('Acceso verificado. Por seguridad, debés cambiar la contraseña por defecto antes de continuar.');
        return;
      }

      setSuccessMsg(`¡Bienvenido/a, ${res.user.name}! Redirigiendo...`);
      setCurrentUser(res.user);

      setTimeout(() => {
        if (redirectTarget) {
          router.push(redirectTarget);
        } else if (res.user?.role === 'admin') {
          router.push('/admin');
        } else if (res.user?.role === 'prestador') {
          router.push('/panel-prestador');
        } else {
          router.push('/mis-turnos');
        }
      }, 700);
    } else {
      if (res.isLocked && res.remainingSeconds) {
        setLockCountdown(res.remainingSeconds);
      }
      setErrorMsg(res.error || 'Credenciales incorrectas');
    }
  };

  // ==========================================
  // 2. SUBMIT: CAMBIO DE CONTRASEÑA OBLIGATORIO
  // ==========================================
  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const targetUser = tempUserForPasswordChange || currentUser;
    if (!targetUser) {
      setErrorMsg('No se detectó usuario activo para cambiar la clave.');
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setErrorMsg('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (newPassword === '1234') {
      setErrorMsg('Por favor elegí una contraseña diferente a la clave simple por defecto "1234".');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Las contraseñas ingresadas no coinciden. Verificalas.');
      return;
    }

    const res = updateUserPassword(targetUser.id, newPassword);
    if (res.success) {
      setSuccessMsg('¡Contraseña actualizada con éxito! Ingresando a tu panel...');
      const updatedUser = getCurrentUser();
      setCurrentUser(updatedUser);

      setTimeout(() => {
        if (redirectTarget) {
          router.push(redirectTarget);
        } else if (targetUser.role === 'admin') {
          router.push('/admin');
        } else if (targetUser.role === 'prestador') {
          router.push('/panel-prestador');
        } else {
          router.push('/mis-turnos');
        }
      }, 1000);
    } else {
      setErrorMsg(res.error || 'Error al actualizar la contraseña.');
    }
  };

  // ==========================================
  // 3. SUBMIT: REGISTRO (PRESTADOR O VECINO)
  // ==========================================
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (username && isUsernameTaken(username)) {
      setErrorMsg(`El nombre de usuario "${username}" ya está ocupado. Elegí una de las opciones sugeridas.`);
      return;
    }

    if (role === 'prestador') {
      if (!dniPhotoUrl) {
        setErrorMsg('La foto de tu DNI es obligatoria para verificar tu identidad y cuidar la seguridad del barrio.');
        return;
      }

      const res = registerPrestador({
        name,
        username,
        phone,
        password: regPassword || '1234',
        category,
        customCategory,
        zoneName,
        coverageRadiusKm,
        dniPhotoUrl,
        isMatriculado,
        matriculaNumber,
        bio
      });

      if (res.success && res.user) {
        setSuccessMsg('¡Registro completado! Tu DNI ha sido enviado para verificación. Redirigiendo...');
        setCurrentUser(res.user);
        setTimeout(() => router.push(redirectTarget || '/panel-prestador'), 1200);
      } else {
        setErrorMsg(res.error || 'Error en el registro.');
      }
    } else {
      // Cliente / Vecino
      const res = registerCliente({
        name,
        username,
        phone,
        password: regPassword || '1234',
        address
      });

      if (res.success && res.user) {
        setSuccessMsg('¡Cuenta de vecino creada con éxito! Redirigiendo...');
        setCurrentUser(res.user);
        setTimeout(() => router.push(redirectTarget || '/'), 1000);
      } else {
        setErrorMsg(res.error || 'Error al registrarte.');
      }
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setTempUserForPasswordChange(null);
    setMode('login');
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

        {/* If user is already logged in and DOES NOT need password change */}
        {currentUser && !currentUser.mustChangePassword && mode !== 'change-password' ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Sesión Activa
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-2">{currentUser.name}</h2>
              <p className="text-xs text-slate-500">
                Rol: <strong className="capitalize">{currentUser.role}</strong>
                {currentUser.username && ` • @${currentUser.username}`}
                {currentUser.phone && ` • Tel: ${currentUser.phone}`}
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              {currentUser.role === 'admin' && (
                <Link
                  href="/admin"
                  className="w-full py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Ir al Panel de Administrador</span>
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
                type="button"
                onClick={() => setMode('change-password')}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <KeyRound className="w-4 h-4 text-slate-500" />
                <span>Cambiar mi contraseña</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        ) : mode === 'change-password' ? (
          /* ======================================================== */
          /* PANTALLA DE CAMBIO OBLIGATORIO / VOLUNTARIO DE CLAVE     */
          /* ======================================================== */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 text-white text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mb-2 shadow-xs">
                <KeyRound className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-black">Actualización de Contraseña</h1>
              <p className="text-xs text-amber-100 mt-1 max-w-sm mx-auto">
                {tempUserForPasswordChange?.role === 'admin' || currentUser?.role === 'admin'
                  ? 'Bienvenido administrador. Se requiere cambiar la contraseña por defecto para proteger el panel.'
                  : 'Establecé tu nueva clave segura para acceder a tu cuenta.'}
              </p>
            </div>

            <form onSubmit={handlePasswordChangeSubmit} className="p-5 sm:p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Seguridad obligatoria:</strong> Podés ingresar una clave personalizada o pulsar el botón para generar automáticamente una clave segura y robusta.
                </div>
              </div>

              {/* Botón para generar clave segura con un clic */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleGenerateNewPasswordForChange}
                  className="flex-1 py-2 px-3 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-900 text-xs font-black flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span>⚡ Generar Clave Segura Automática</span>
                </button>

                {newPassword && (
                  <button
                    type="button"
                    onClick={() => handleCopyGeneratedPassword(newPassword)}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5"
                    title="Copiar contraseña generada"
                  >
                    {copiedPassword ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">¡Copiada!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-600" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Input Nueva Contraseña */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nueva Contraseña *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    placeholder="Escribí tu nueva contraseña..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Input Confirmar Contraseña */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirmar Nueva Contraseña *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    placeholder="Repetí la contraseña..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-black text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/20 active:scale-98 transition-all"
              >
                Guardar Contraseña y Continuar
              </button>

              {currentUser && (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 pt-1"
                >
                  Volver al inicio de sesión
                </button>
              )}
            </form>
          </div>
        ) : (
          /* ======================================================== */
          /* PANTALLA PRINCIPAL: INICIAR SESIÓN O CREAR CUENTA        */
          /* ======================================================== */
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

            {/* Lockout Banner */}
            {lockCountdown !== null && lockCountdown > 0 && (
              <div className="m-5 p-4 rounded-2xl bg-rose-100 border-2 border-rose-300 text-xs font-semibold text-rose-900 flex items-start gap-2.5 animate-pulse">
                <Lock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-black text-rose-950 uppercase tracking-wide">
                    Acceso Temporalmente Bloqueado por Seguridad
                  </h5>
                  <p className="mt-0.5 text-[11px] text-rose-800 leading-relaxed">
                    Múltiples intentos erróneos. Esperá <strong>{lockCountdown} segundos</strong> para reintentar.
                  </p>
                </div>
              </div>
            )}

            {/* Alert Messages */}
            {errorMsg && lockCountdown === null && (
              <div className="mx-5 mt-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mx-5 mt-5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* ======================================================== */
            /* MODO INICIAR SESIÓN (FORMULARIO UNIFICADO SIN BOTÓN ADMIN) */
            /* ======================================================== */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="p-5 sm:p-6 space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 flex items-start gap-2">
                  <UserCheck className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <span>
                    Ingresá con tu <strong>usuario</strong>, <strong>teléfono</strong> o <strong>email</strong>. El sistema identificará tus permisos automáticamente.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Usuario, Teléfono o Email *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Ej: 2266 123456 o tu usuario"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
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
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Tu contraseña o PIN"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

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
                    ? `🔒 Bloqueado temporalmente (${lockCountdown}s)`
                    : 'Iniciar Sesión'}
                </button>

                {/* Accesos rápidos de prueba para facilitar verificación */}
                <div className="pt-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[11px] text-slate-500 space-y-1.5">
                  <span className="font-bold block text-slate-700">Accesos rápidos de demostración:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setLoginIdentifier('jroman2266'); setLoginPassword('1234'); }}
                      className="px-2 py-1 rounded-md bg-white border border-slate-200 text-indigo-700 font-bold hover:bg-indigo-50"
                    >
                      👑 Admin (jroman2266 / 1234)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setLoginIdentifier('2266887766'); setLoginPassword('1234'); }}
                      className="px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-800 font-bold hover:bg-slate-100"
                    >
                      👤 Vecino (Esteban)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setLoginIdentifier('2266551122'); setLoginPassword('1234'); }}
                      className="px-2 py-1 rounded-md bg-white border border-slate-200 text-orange-700 font-bold hover:bg-orange-50"
                    >
                      🔧 Prestador (Roberto)
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* ======================================================== */
              /* MODO CREAR CUENTA NUEVA (VECINO O PRESTADOR)             */
              /* ======================================================== */
              <div>
                {/* Role Tabs for Registration */}
                <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-600">
                  <button
                    type="button"
                    onClick={() => { setRole('cliente'); setErrorMsg(''); }}
                    className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      role === 'cliente'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Soy Vecino (Pedir Servicios)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setRole('prestador'); setErrorMsg(''); }}
                    className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      role === 'prestador'
                        ? 'bg-white text-orange-600 shadow-xs'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Soy Prestador (Ofrecer Oficio)</span>
                  </button>
                </div>

                <form onSubmit={handleRegisterSubmit} className="p-5 sm:p-6 space-y-4">
                  {/* Nombre y Apellido */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {role === 'prestador' ? 'Nombre y Apellido (o nombre de oficio) *' : 'Nombre y Apellido *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Marcelo Gómez"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* Campo de Nombre de Usuario con Detección de Colisiones y Sugerencias */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Nombre de Usuario (Opcional)
                      </label>
                      <span className="text-[10px] text-slate-400">Para iniciar sesión fácilmente</span>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ej: marcelogomez_bce"
                        value={username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 ${
                          usernameError ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                        }`}
                      />
                    </div>

                    {/* Mensaje de error y sugerencias automáticas */}
                    {usernameError && (
                      <div className="mt-1.5 space-y-1.5">
                        <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{usernameError}</span>
                        </p>

                        {usernameSuggestions.length > 0 && (
                          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                            <span className="text-[10px] font-bold text-amber-900 block">
                              Sugerencias disponibles (tocá para elegir una):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {usernameSuggestions.map((sug) => (
                                <button
                                  key={sug}
                                  type="button"
                                  onClick={() => handleSelectSuggestion(sug)}
                                  className="px-2 py-1 bg-white border border-amber-300 hover:border-orange-500 text-slate-800 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
                                >
                                  <Sparkles className="w-3 h-3 text-orange-600" />
                                  <span>{sug}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Campos específicos de Prestador */}
                  {role === 'prestador' && (
                    <>
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
                              Validación de identidad con DNI para la seguridad de la comunidad.
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
                                Formatos JPG, PNG o WebP
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

                  {/* Dirección para Cliente / Vecino */}
                  {role === 'cliente' && (
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
                  )}

                  {/* Teléfono */}
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

                  {/* Contraseña con Generador o Personalizada */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Contraseña *
                      </label>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Generar clave segura</span>
                      </button>
                    </div>

                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={4}
                        placeholder="Escribí una clave o generá una automática"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full pl-9 pr-16 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 font-mono"
                      />
                      <div className="absolute right-2 top-2 flex items-center gap-1">
                        {regPassword && (
                          <button
                            type="button"
                            onClick={() => handleCopyGeneratedPassword(regPassword)}
                            className="p-1 text-slate-400 hover:text-slate-700"
                            title="Copiar contraseña"
                          >
                            {copiedPassword ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1 text-slate-400 hover:text-slate-700"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-black text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/20 active:scale-98 transition-all"
                  >
                    {role === 'prestador' ? 'Crear Cuenta y Enviar DNI' : 'Crear Cuenta de Vecino'}
                  </button>
                </form>
              </div>
            )}
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
