'use client';

import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  MessageCircle, 
  Globe, 
  MapPin, 
  Code2, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Heart
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!isOpen) return null;

  const phoneRaw = '2266415553';
  const phoneFormatted = '2266 41-5553';
  const phoneInternational = '5492266415553';
  const email = 'empresa.puntoAR@gmail.com';

  const waMessage = encodeURIComponent(
    '¡Hola equipo de puntoAR! Me comunico desde la plataforma AcáNomás Balcarce. Quisiera hacerles una consulta.'
  );
  const waUrl = `https://wa.me/${phoneInternational}?text=${waMessage}`;
  const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent('Consulta desde AcáNomás Balcarce')}`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(phoneRaw);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header con fondo oscuro para lucir el logo oficial puntoAR */}
        <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-7 text-white border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo Oficial puntoAR */}
          <div className="flex flex-col items-center text-center space-y-3 pt-2">
            <div className="w-full max-w-[280px] h-20 flex items-center justify-center">
              <img
                src="/logo-puntoar.png"
                alt="puntoAR Logo Oficial"
                className="max-h-full max-w-full object-contain filter drop-shadow-md"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <Code2 className="w-3.5 h-3.5" />
              <span>Desarrollo de Software & Soluciones Digitales</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Descripción del Proyecto y la Empresa */}
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              <strong>AcáNomás</strong> es un desarrollo tecnológico creado íntegramente por <strong>puntoAR</strong> para la comunidad de <strong>Balcarce, Buenos Aires</strong>.
            </p>
            <p className="text-slate-500 text-xs">
              Nuestra meta es facilitar el acceso rápido, confiable y seguro entre vecinos y profesionales de oficios locales, incorporando seguimiento en vivo, puntuación de puntualidad y contacto directo sin intermediarios ni comisiones abusivas.
            </p>
          </div>

          {/* Canales de Contacto Directo */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Contactar al programador / Desarrollador
            </h4>

            {/* WhatsApp Card */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-emerald-800 tracking-wider block">
                    WhatsApp & Teléfono
                  </span>
                  <span className="text-sm font-black text-slate-900">
                    {phoneFormatted}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1 transition-colors"
                  title="Copiar número"
                >
                  {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPhone ? 'Copiado' : 'Copiar'}</span>
                </button>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chatear</span>
                  <ExternalLink className="w-3 h-3 opacity-75" />
                </a>
              </div>
            </div>

            {/* Email Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block">
                    Correo Electrónico
                  </span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 truncate block">
                    {email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1 transition-colors"
                  title="Copiar email"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmail ? 'Copiado' : 'Copiar'}</span>
                </button>

                <a
                  href={mailtoUrl}
                  className="px-3.5 py-1.5 rounded-xl font-bold text-xs text-white bg-slate-800 hover:bg-slate-900 shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Escribir</span>
                </a>
              </div>
            </div>

            {/* Location card */}
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-orange-50/70 border border-orange-100 text-xs text-orange-950">
              <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
              <span>
                <strong>Sede:</strong> Balcarce, Provincia de Buenos Aires, República Argentina.
              </span>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              Desarrollado con <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> para Balcarce
            </span>
            <span className="font-semibold text-slate-500">© puntoAR</span>
          </div>
        </div>
      </div>
    </div>
  );
}
