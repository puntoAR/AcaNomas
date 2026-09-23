'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  LogIn, 
  UserPlus, 
  X, 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  Clock, 
  Calendar 
} from 'lucide-react';
import { Provider } from '@/types';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider?: Provider | null;
  redirectUrl?: string;
}

export default function AuthPromptModal({
  isOpen,
  onClose,
  provider,
  redirectUrl = '/'
}: AuthPromptModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoLogin = () => {
    onClose();
    router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
  };

  const handleGoRegister = () => {
    onClose();
    router.push(`/login?mode=register&role=cliente&redirect=${encodeURIComponent(redirectUrl)}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header gradient banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
              <Lock className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                Acceso Requerido
              </span>
              <h3 className="text-base font-black">Iniciá sesión para continuar</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-slate-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6 space-y-4">
          {provider ? (
            <div className="flex items-center gap-3 p-3 bg-orange-50/70 border border-orange-200 rounded-2xl">
              <img
                src={provider.avatar}
                alt={provider.name}
                className="w-12 h-12 rounded-xl object-cover border border-orange-300 shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wide">
                  Prestador Seleccionado
                </span>
                <h4 className="text-sm font-black text-slate-900 truncate">
                  {provider.name}
                </h4>
                <p className="text-xs text-slate-600 capitalize">
                  {provider.category} en Balcarce
                </p>
              </div>
            </div>
          ) : null}

          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-black text-slate-900">
              {provider 
                ? `Para pedir un turno o contactar a ${provider.name}` 
                : 'Para pedir un turno y gestionar tus visitas'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Es necesario estar registrado en AcáNomás. Así aseguramos la identidad de vecinos y prestadores, resguardamos tu dirección y te permitimos ver el estado de tu turno en tiempo real.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Dirección protegida</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
              <Clock className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Puntualidad en vivo</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleGoLogin}
              className="w-full py-3 px-4 rounded-xl font-black text-xs text-white bg-slate-900 hover:bg-slate-800 shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <LogIn className="w-4 h-4" />
              <span>Ya tengo cuenta: Iniciar Sesión</span>
            </button>

            <button
              onClick={handleGoRegister}
              className="w-full py-3 px-4 rounded-xl font-black text-xs text-slate-900 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <UserPlus className="w-4 h-4" />
              <span>Crear Cuenta de Vecino Gratis</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Seguir explorando oficios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
