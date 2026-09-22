'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Share2, PlusSquare, Smartphone, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // 1. Registrar Service Worker para cumplir requisitos de PWA
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('PWA ServiceWorker registrado con éxito:', reg.scope))
        .catch((err) => console.warn('PWA ServiceWorker registro fallido:', err));
    }

    // 2. Verificar si ya está corriendo en modo standalone (instalada como app)
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    
    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) return;

    // 3. Verificar si el usuario ya cerró el banner recientemente
    const dismissedAt = localStorage.getItem('acanomas_install_dismissed');
    if (dismissedAt) {
      const hoursSinceDismiss = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60);
      if (hoursSinceDismiss < 24) {
        // No molestar por 24 horas si lo cerró
        return;
      }
    }

    // 4. Detección de iOS (iPhone/iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    if (isIosDevice && !isStandaloneMode) {
      // Mostrar banner sutil para iOS tras 2 segundos
      const timer = setTimeout(() => setShowPrompt(true), 2000);
      return () => clearTimeout(timer);
    }

    // 5. Capturar evento de instalación nativo en Android/Chrome
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setInstalledSuccess(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIosGuide(true);
      }
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalledSuccess(true);
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Error al solicitar instalación PWA:', err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIosGuide(false);
    localStorage.setItem('acanomas_install_dismissed', Date.now().toString());
  };

  if (isStandalone || installedSuccess || !showPrompt) {
    return null;
  }

  return (
    <>
      {/* Banner flotante principal */}
      <div className="fixed bottom-18 sm:bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-in slide-in-from-bottom-5 duration-300">
        <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3.5 shadow-2xl border border-slate-700/80 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center shrink-0 p-1 shadow-md shadow-orange-500/30">
            <img 
              src="/icon-192.png" 
              alt="AcáNomás Icon" 
              className="w-full h-full object-contain rounded-lg"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-white">
                Instalar AcáNomás
              </span>
              <span className="text-[9px] font-bold bg-orange-500/30 text-orange-300 px-1.5 py-0.2 rounded-full border border-orange-500/40">
                Acceso Directo
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate">
              {isIOS 
                ? 'Agregá el icono a tu pantalla de inicio en iPhone' 
                : 'Instalá la app para abrirla en 1 clic sin navegador'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isIOS ? (
              <button
                onClick={() => setShowIosGuide(true)}
                className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-transform active:scale-95 shadow-sm"
              >
                ¿Cómo?
              </button>
            ) : (
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-transform active:scale-95 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar</span>
              </button>
            )}

            <button
              onClick={handleDismiss}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              aria-label="Cerrar sugerencia"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal / Guía explicativa para iOS */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 text-slate-900 relative">
            <button
              onClick={() => setShowIosGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-orange-600 p-1.5 shadow-lg shadow-orange-500/30">
                <img 
                  src="/icon-192.png" 
                  alt="AcáNomás Icon" 
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Instalar AcáNomás en iPhone
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tené el icono en tu pantalla de inicio en 2 simples toques:
              </p>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-black shrink-0">
                  1
                </div>
                <div className="flex items-center gap-1.5">
                  <span>Tocá el botón <strong>Compartir</strong> en la barra inferior de Safari</span>
                  <Share2 className="w-4 h-4 text-sky-600 inline" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-black shrink-0">
                  2
                </div>
                <div className="flex items-center gap-1.5">
                  <span>Deslizá hacia abajo y elegí <strong>&ldquo;Agregar a inicio&rdquo;</strong></span>
                  <PlusSquare className="w-4 h-4 text-slate-700 inline" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black shrink-0">
                  ✓
                </div>
                <span>¡Listo! Se abrirá como una aplicación nativa sin barra de navegación.</span>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="mt-4 w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/25 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
