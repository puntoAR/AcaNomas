'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MessageCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Code2, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Heart,
  Cpu,
  Smartphone,
  Globe
} from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function AcercaDePage() {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const phoneRaw = '2266415553';
  const phoneFormatted = '2266 41-5553';
  const phoneInternational = '5492266415553';
  const email = 'empresa.puntoAR@gmail.com';

  const waMessage = encodeURIComponent(
    '¡Hola equipo de puntoAR! Me comunico desde la plataforma AcáNomás Balcarce. Quisiera hacerles una consulta sobre desarrollo.'
  );
  const waUrl = `https://wa.me/${phoneInternational}?text=${waMessage}`;
  const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent('Contacto desde AcáNomás Balcarce')}`;

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-6">
          
          {/* Header con el logo oficial puntoAR */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 sm:p-10 text-white text-center space-y-4">
            <div className="w-full max-w-[320px] h-24 mx-auto flex items-center justify-center">
              <img
                src="/logo-puntoar.png"
                alt="puntoAR Logo Oficial"
                className="max-h-full max-w-full object-contain filter drop-shadow-lg"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <Code2 className="w-4 h-4" />
              <span>Desarrollo de Software & Soluciones Digitales</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Acerca de puntoAR
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
              Empresa desarrolladora y creadora de la plataforma AcáNomás en Balcarce, Provincia de Buenos Aires.
            </p>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Acerca de la plataforma AcáNomás */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Nuestra Misión</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">
                Tecnología para conectar a la comunidad balcarceña
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                <strong>AcáNomás</strong> nace con el propósito de resolver una necesidad cotidiana en Balcarce: encontrar rápidamente profesionales y personas de oficio verificadas, sin intermediarios costosos ni comisiones abusivas. 
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Diseñamos una experiencia ágil con geolocalización en tiempo real, mapas interactivos de cobertura, cálculo de puntualidad barrial, chat directo por WhatsApp y un Web Chat integrado para que todos los acuerdos queden debidamente registrados y transparentes.
              </p>
            </div>

            {/* Tarjetas de Contacto Directo */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Canales de Contacto con el Desarrollador
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* WhatsApp */}
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col justify-between space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase text-emerald-800 tracking-wider block">
                        WhatsApp & Celular
                      </span>
                      <span className="text-base font-black text-slate-900">
                        {phoneFormatted}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Atención directa por mensajería o llamada
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-emerald-200/60">
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
                    >
                      {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPhone ? 'Copiado' : 'Copiar'}</span>
                    </button>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Abrir WhatsApp</span>
                      <ExternalLink className="w-3 h-3 opacity-75" />
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold uppercase text-slate-500 tracking-wider block">
                        Correo Electrónico
                      </span>
                      <span className="text-sm sm:text-base font-black text-slate-900 truncate block">
                        {email}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Consultas comerciales y nuevos desarrollos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedEmail ? 'Copiado' : 'Copiar'}</span>
                    </button>

                    <a
                      href={mailtoUrl}
                      className="flex-1 py-2 px-3 rounded-xl font-bold text-xs text-white bg-slate-800 hover:bg-slate-900 shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Enviar Email</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Servicios y Capacidades de puntoAR */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Cpu className="w-4 h-4" />
                <span>Servicios Tecnológicos</span>
              </div>
              <h3 className="text-lg font-black text-white">
                ¿Necesitás una aplicación o sistema a medida para tu emprendimiento?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                En <strong>puntoAR</strong> desarrollamos plataformas web, aplicaciones para celulares (Android/iOS con PWA), paneles de administración, integración de pasarelas de pago y automatización de procesos para negocios locales y regionales.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-slate-100">Apps Móviles & PWA</h4>
                  <p className="text-slate-400 text-[11px]">Acceso directo en celular sin intermediarios de tiendas.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-slate-100">Webs & Plataformas</h4>
                  <p className="text-slate-400 text-[11px]">Sistemas modernos, ultrarrápidos y seguros con Next.js.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-slate-100">Seguridad & Confianza</h4>
                  <p className="text-slate-400 text-[11px]">Protección contra fraude y arquitectura blindada.</p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 shadow-md shadow-orange-500/20 active:scale-95 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Consultar por un proyecto de software</span>
                </a>
              </div>
            </div>

            {/* Ubicación y sello */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Balcarce, Provincia de Buenos Aires, República Argentina</span>
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                Hecho con <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> por puntoAR
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
