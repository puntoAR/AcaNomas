'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  MapPin, 
  Briefcase, 
  ShieldCheck, 
  UserCheck, 
  Menu, 
  X,
  Compass,
  Navigation,
  LogIn,
  LogOut,
  User,
  Crown,
  Info
} from 'lucide-react';
import AboutModal from './AboutModal';
import { getProviders, getServiceRequests } from '@/lib/store';
import { getCurrentUser, logout } from '@/lib/auth';
import { AuthUser } from '@/types';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [hasEnCamino, setHasEnCamino] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const updateState = () => {
    const providers = getProviders();
    const pending = providers.filter(
      p => p.dniStatus === 'pending' || p.matriculaStatus === 'pending'
    ).length;
    setPendingCount(pending);

    const requests = getServiceRequests();
    setHasEnCamino(requests.some(r => r.status === 'en_camino'));

    setCurrentUser(getCurrentUser());
  };

  useEffect(() => {
    updateState();

    const handleAuthChange = () => updateState();
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Slogan */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-11 h-11 relative flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <img
                src="/logo-icono-transparente.png"
                alt="AcáNomás Logo"
                className="w-full h-full object-contain filter drop-shadow-md"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  Acá<span className="text-orange-600">Nomás</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                  Balcarce
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium -mt-0.5 hidden xs:block">
                Tu oficio de confianza en 2 clics
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <Link
              href="/"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                pathname === '/'
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Explorar
            </Link>

            {/* Client Tracking consultation link */}
            <Link
              href="/mis-turnos"
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                pathname.startsWith('/mis-turnos') || pathname.startsWith('/seguimiento')
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Navigation className={`w-4 h-4 ${hasEnCamino ? 'text-orange-600 animate-spin' : 'text-slate-500'}`} style={{ animationDuration: '4s' }} />
              <span>Mis Turnos (GPS)</span>
              {hasEnCamino && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600"></span>
                </span>
              )}
            </Link>

            <Link
              href="/panel-prestador"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                pathname.startsWith('/panel-prestador')
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Soy Prestador</span>
            </Link>

            {currentUser?.role === 'admin' && (
              <Link
                href="/admin"
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  pathname.startsWith('/admin')
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Panel Admin</span>
                {pendingCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={() => setAboutOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Info className="w-4 h-4 text-amber-500" />
              <span>Acerca de</span>
            </button>

            <Link
              href="/ofrecer-servicio"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-sm shadow-orange-500/25 active:scale-95 transition-all"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Publicar Oficio</span>
            </Link>

            {/* Auth status chip / Login button */}
            {currentUser ? (
              <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors"
                  title="Administrar sesión"
                >
                  {currentUser.role === 'admin' ? (
                    <Crown className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
                  ) : currentUser.role === 'prestador' ? (
                    <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-slate-600" />
                  )}
                  <span className="truncate max-w-[100px]">{currentUser.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="ml-1 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-600" />
                <span>Ingresar</span>
              </Link>
            )}
          </nav>

          {/* Mobile quick actions & hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            {currentUser ? (
              <Link
                href="/login"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200"
              >
                {currentUser.role === 'admin' ? (
                  <Crown className="w-3.5 h-3.5 text-indigo-600" />
                ) : (
                  <User className="w-3.5 h-3.5 text-slate-600" />
                )}
                <span className="truncate max-w-[70px]">{currentUser.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Ingresar</span>
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-slate-500 bg-slate-50 rounded-md">
            <MapPin className="w-3.5 h-3.5 text-orange-500" />
            <span>Área de cobertura: <strong>Balcarce, Bs. As.</strong></span>
          </div>

          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-base font-semibold ${
              pathname === '/' ? 'bg-orange-50 text-orange-600' : 'text-slate-700'
            }`}
          >
            🔍 Explorar Oficios
          </Link>

          <Link
            href="/mis-turnos"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-orange-600" />
              Mis Turnos / Seguimiento GPS
            </span>
            {hasEnCamino && (
              <span className="px-2 py-0.5 rounded-full bg-orange-600 text-white text-[10px] font-bold animate-pulse">
                EN CAMINO
              </span>
            )}
          </Link>

          <Link
            href="/panel-prestador"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              Panel de Prestador (Mis Turnos)
            </span>
          </Link>

          {currentUser?.role === 'admin' && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-base font-semibold text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                Panel Administrador
              </span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold">
                  {pendingCount}
                </span>
              )}
            </Link>
          )}

          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <LogIn className="w-5 h-5 text-slate-600" />
              {currentUser ? `Mi Cuenta (${currentUser.name})` : 'Iniciar Sesión / Registrarse'}
            </span>
          </Link>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setAboutOpen(true);
            }}
            className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Info className="w-5 h-5 text-amber-500" />
              Acerca de (Contacto Programador)
            </span>
          </button>

          <Link
            href="/ofrecer-servicio"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-center py-2.5 rounded-xl font-bold text-white bg-orange-600 shadow-md shadow-orange-500/20"
          >
            Publicar mi Oficio Gratis
          </Link>

          {currentUser && (
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full text-center py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          )}
        </div>
      )}

      {/* Modal Acerca de puntoAR */}
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </header>
  );
}
