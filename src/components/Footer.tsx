'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Mail, Phone, Heart, Code2, Info } from 'lucide-react';
import AboutModal from './AboutModal';

export default function Footer() {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <>
      <footer className="mt-auto bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
            {/* Left: Brand info */}
            <div className="space-y-1.5 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-xl font-black tracking-tight text-white">
                  Acá<span className="text-orange-500">Nomás</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Balcarce
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm">
                La plataforma barrial para conectar vecinos con prestadores de oficios de confianza. Cero comisiones y contacto directo.
              </p>
            </div>

            {/* Center: puntoAR Company Badge */}
            <div className="flex flex-col items-center bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl max-w-xs text-center space-y-2">
              <div className="h-8 max-w-[140px] flex items-center justify-center">
                <img
                  src="/logo-puntoar.png"
                  alt="puntoAR"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Software & Soluciones Digitales
              </p>
              <button
                onClick={() => setAboutOpen(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Acerca de puntoAR</span>
              </button>
            </div>

            {/* Right: Developer Contact Links */}
            <div className="space-y-2 text-center md:text-right text-xs text-slate-400">
              <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] block">
                Contacto con el Programador:
              </span>
              <div className="flex flex-col md:items-end gap-1.5">
                <a
                  href="https://wa.me/5492266415553?text=Hola%20puntoAR,%20te%20escribo%20desde%20Ac%C3%A1Nom%C3%A1s"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 flex items-center justify-center md:justify-end gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp: 2266 415553</span>
                </a>

                <a
                  href="mailto:empresa.puntoAR@gmail.com?subject=Contacto%20desde%20Ac%C3%A1Nom%C3%A1s"
                  className="hover:text-amber-400 flex items-center justify-center md:justify-end gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>empresa.puntoAR@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom copyright line */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} AcáNomás Balcarce. Todos los derechos reservados.</p>
            <p className="flex items-center gap-1">
              Desarrollado con <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> por <strong className="text-slate-300">puntoAR</strong>
            </p>
          </div>
        </div>
      </footer>

      {/* Reusable About Modal */}
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}
