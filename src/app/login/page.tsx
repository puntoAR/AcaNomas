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
  LogOut
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { UserRole, Provider, AuthUser } from '@/types';
import { getCurrentUser, loginAsAdmin, loginAsPrestador, loginAsCliente, logout } from '@/lib/auth';
import { getProviders } from '@/lib/store';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '';

  const [activeTab, setActiveTab] = useState<UserRole>('admin');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);

  // Admin form
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  // Prestador form
  const [selectedProviderId, setSelectedProviderId] = useState('');

  // Cliente form
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    const provs = getProviders();
    setProviders(provs);
    if (provs.length > 0) {
      setSelectedProviderId(provs[0].id);
    }
  }, []);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    const res = loginAsAdmin(adminPassword);
    if (res.success) {
      router.push(redirectTarget || '/admin');
    } else {
      setAdminError(res.error || 'Credenciales incorrectas');
    }
  };

  const handlePrestadorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = loginAsPrestador(selectedProviderId);
    if (res.success) {
      router.push(redirectTarget || '/panel-prestador');
    }
  };

  const handleClienteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = loginAsCliente(clientName, clientPhone);
    if (res.success) {
      router.push(redirectTarget || '/mis-turnos');
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16">
      <Navbar />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </Link>

        {/* If user is already logged in, show current session status */}
        {currentUser ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Sesión Activa
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-2">{currentUser.name}</h2>
              <p className="text-xs text-slate-500 capitalize">Rol: {currentUser.role}</p>
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
                  Ver mis turnos y GPS
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
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white text-center">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-black">Iniciar Sesión en AcáNomás</h1>
              <p className="text-xs text-slate-400 mt-1">
                Elegí tu tipo de acceso para continuar
              </p>
            </div>

            {/* Role selector tabs */}
            <div className="grid grid-cols-3 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`py-2 rounded-xl transition-all flex flex-col items-center gap-1 ${
                  activeTab === 'admin'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('prestador')}
                className={`py-2 rounded-xl transition-all flex flex-col items-center gap-1 ${
                  activeTab === 'prestador'
                    ? 'bg-white text-orange-600 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Prestador</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('cliente')}
                className={`py-2 rounded-xl transition-all flex flex-col items-center gap-1 ${
                  activeTab === 'cliente'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Vecino</span>
              </button>
            </div>

            <div className="p-6">
              {/* TAB 1: ADMIN LOGIN */}
              {activeTab === 'admin' && (
                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-start gap-2 text-xs text-indigo-950">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Acceso Restringido:</strong> Permite validar documentos, habilitar carnets de matriculados y gestionar el Escudo Premium.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contraseña o PIN de Administrador *
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        placeholder="Contraseña (por defecto: admin123)"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900"
                      />
                    </div>
                  </div>

                  {adminError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{adminError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-black text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 active:scale-98 transition-all"
                  >
                    Ingresar como Administrador
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdminPassword('admin123')}
                    className="w-full text-center text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    (Autocompletar clave de prueba: admin123)
                  </button>
                </form>
              )}

              {/* TAB 2: PRESTADOR LOGIN */}
              {activeTab === 'prestador' && (
                <form onSubmit={handlePrestadorSubmit} className="space-y-4">
                  <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-2xl flex items-start gap-2 text-xs text-orange-950">
                    <UserCheck className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <span>
                      Ingresá con tu perfil de oficio para ver solo tus pedidos y activar el mapa de aproximación GPS.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Seleccionar tu perfil registrado en Balcarce *
                    </label>
                    <select
                      value={selectedProviderId}
                      onChange={(e) => setSelectedProviderId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-orange-500 bg-white"
                    >
                      {providers.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.category}) {p.isPremium ? '👑 Premium' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-black text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/20 active:scale-98 transition-all"
                  >
                    Ingresar a mi Panel de Trabajo
                  </button>
                </form>
              )}

              {/* TAB 3: CLIENTE / VECINO LOGIN */}
              {activeTab === 'cliente' && (
                <form onSubmit={handleClienteSubmit} className="space-y-4">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-2 text-xs text-slate-600">
                    <User className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <span>
                      Identificate con tu nombre y teléfono para ver tus turnos guardados y calificaciones.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tu Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Marcelo Gómez"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej: 2266 123456"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-black text-xs text-white bg-slate-900 hover:bg-slate-800 shadow-md active:scale-98 transition-all"
                  >
                    Guardar y Ver mis Turnos
                  </button>
                </form>
              )}
            </div>
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
