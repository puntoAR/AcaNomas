'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  FileText, 
  MessageCircle, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  ExternalLink, 
  LogIn 
} from 'lucide-react';
import { Provider, ServiceRequest } from '@/types';
import { createServiceRequest } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';
import {
  sanitizeTextInput,
  sanitizePhone,
  detectMaliciousPayload,
  checkRequestSpamCooldown,
  recordRequestSubmission
} from '@/lib/security';

interface ServiceRequestModalProps {
  provider: Provider | null;
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
}

export default function ServiceRequestModal({
  provider,
  isOpen,
  onClose,
  redirectUrl = '/'
}: ServiceRequestModalProps) {
  const router = useRouter();

  const currentUser = typeof window !== 'undefined' && isOpen ? getCurrentUser() : null;

  // Form states initialized with logged-in user profile
  const [clientName, setClientName] = useState(() => (typeof window !== 'undefined' ? getCurrentUser()?.name || '' : ''));
  const [clientPhone, setClientPhone] = useState(() => (typeof window !== 'undefined' ? getCurrentUser()?.phone || '' : ''));
  const [clientAddress, setClientAddress] = useState(() => (typeof window !== 'undefined' ? getCurrentUser()?.address || 'Calle 18 y 21, Balcarce' : 'Calle 18 y 21, Balcarce'));
  const [description, setDescription] = useState('');
  const [agreedDate, setAgreedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [agreedTime, setAgreedTime] = useState('16:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Honeypot anti-bot field (debe permanecer vacío para humanos)
  const [honeypotUrl, setHoneypotUrl] = useState('');

  // Step 2: Post-creation choice between WhatsApp and Web Chat
  const [submittedData, setSubmittedData] = useState<{
    id: string;
    waUrl: string;
    date: string;
    time: string;
  } | null>(null);

  if (!isOpen || !provider) return null;

  const handleClose = () => {
    setSubmittedData(null);
    setErrorMessage('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // 1. Control Anti-Bot Honeypot: Si un bot llenó el campo oculto, descartar
    if (honeypotUrl) {
      console.warn('Bot detectado en formulario de solicitud.');
      handleClose();
      return;
    }

    // 2. Control Anti-Spam Cooldown
    const cooldown = checkRequestSpamCooldown();
    if (!cooldown.allowed) {
      setErrorMessage(`Esperá ${cooldown.remainingSeconds} segundos antes de enviar otra solicitud.`);
      return;
    }

    // 3. Detección de inyecciones maliciosas
    if (
      detectMaliciousPayload(clientName) ||
      detectMaliciousPayload(clientPhone) ||
      detectMaliciousPayload(clientAddress) ||
      detectMaliciousPayload(description)
    ) {
      setErrorMessage('Se detectaron caracteres o instrucciones no permitidas.');
      return;
    }

    // 4. Sanitización rigurosa de entradas
    const safeClientName = sanitizeTextInput(clientName, 60);
    const safeClientPhone = sanitizePhone(clientPhone);
    const safeClientAddress = sanitizeTextInput(clientAddress, 100);
    const safeDescription = sanitizeTextInput(description, 350) || `Consulta por servicio de ${provider.category}`;

    if (!safeClientName || safeClientName.length < 3) {
      setErrorMessage('Ingresá tu nombre completo.');
      return;
    }

    if (!safeClientPhone || safeClientPhone.length < 6) {
      setErrorMessage('Ingresá un número de teléfono o WhatsApp válido.');
      return;
    }

    setIsSubmitting(true);

    const newRequestId = 'req-' + Date.now().toString(36);

    const newRequest: ServiceRequest = {
      id: newRequestId,
      providerId: provider.id,
      clientName: safeClientName,
      clientPhone: safeClientPhone,
      clientAddress: safeClientAddress,
      clientCoords: {
        lat: provider.location.lat + (Math.random() * 0.008 - 0.004),
        lng: provider.location.lng + (Math.random() * 0.008 - 0.004)
      },
      serviceCategory: provider.category,
      description: safeDescription,
      agreedDate,
      agreedTime,
      status: 'pendiente', // PENDIENTE DE CONFIRMACIÓN DE VISITA POR EL PRESTADOR
      phoneUnlocked: false, // PROTEGIDO HASTA CONFIRMACIÓN
      messages: [
        {
          id: 'msg-' + Date.now().toString(36) + '-1',
          sender: 'cliente',
          senderName: safeClientName,
          text: `Hola ${provider.name}, solicité tu servicio para el ${agreedDate} a las ${agreedTime} hs: "${safeDescription}".`,
          timestamp: new Date().toISOString()
        },
        {
          id: 'msg-' + Date.now().toString(36) + '-2',
          sender: 'sistema',
          senderName: 'AcáNomás',
          text: `📌 Solicitud registrada. El prestador debe confirmar el día y la hora de visita para validar el acuerdo y habilitar los teléfonos de contacto directos.`,
          timestamp: new Date().toISOString(),
          actionType: 'info'
        }
      ],
      providerCurrentLocation: provider.location,
      estimatedArrivalMinutes: 10,
      createdAt: new Date().toISOString()
    };

    createServiceRequest(newRequest);
    recordRequestSubmission();

    // Build WhatsApp message con texto sanitizado
    const waText = encodeURIComponent(
      `¡Hola ${provider.name}! Vi tu perfil en AcáNomás (Balcarce).\n\n` +
      `👤 Mi nombre: ${safeClientName}\n` +
      `📍 Mi dirección: ${safeClientAddress}\n` +
      `📅 Fecha y hora solicitada: ${agreedDate} a las ${agreedTime} hs\n` +
      `🔧 Motivo: ${safeDescription}\n\n` +
      `¿Podrías confirmarme si tenés disponibilidad para esa fecha/hora? ¡Muchas gracias!`
    );

    const waUrl = `https://wa.me/${provider.phone.replace(/[^0-9]/g, '')}?text=${waText}`;

    setIsSubmitting(false);
    setSubmittedData({
      id: newRequestId,
      waUrl,
      date: agreedDate,
      time: agreedTime
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/20 border-2 border-white/40">
              <img src={provider.avatar} alt={provider.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-100">
                Solicitar Visita / Presupuesto
              </span>
              <h3 className="text-lg font-black tracking-tight">{provider.name}</h3>
              <p className="text-xs text-white/90 capitalize">{provider.category} en Balcarce</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 2: Post-Submission Choice or Step 1: Form Body */}
        {submittedData ? (
          <div className="p-6 sm:p-7 space-y-5 text-center animate-in fade-in duration-200">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                Turno #{submittedData.id.slice(-6).toUpperCase()} Registrado
              </span>
              <h3 className="text-xl font-black text-slate-900">
                ¡Solicitud enviada a {provider.name}!
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Visita propuesta para el <strong>{submittedData.date}</strong> a las <strong>{submittedData.time} hs</strong>.
              </p>
            </div>

            {/* Options to contact */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-slate-700">
                Elegí cómo preferís comunicarte ahora:
              </p>

              <a
                href={submittedData.waUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  setTimeout(() => {
                    handleClose();
                    router.push(`/seguimiento/${submittedData.id}`);
                  }, 1200);
                }}
                className="w-full py-3.5 px-4 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <MessageCircle className="w-5 h-5" />
                <span>1. Abrir Chat por WhatsApp Directo</span>
                <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
              </a>

              <button
                type="button"
                onClick={() => {
                  handleClose();
                  router.push(`/seguimiento/${submittedData.id}`);
                }}
                className="w-full py-3.5 px-4 rounded-2xl font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center gap-2 transition-all active:scale-98 text-xs sm:text-sm"
              >
                <MessageCircle className="w-5 h-5 text-orange-600" />
                <span>2. Usar Web Chat de AcáNomás (Registrado)</span>
              </button>
            </div>

            {/* Privacy notice banner */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-left flex items-start gap-2.5 text-xs text-amber-900">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong>Privacidad de contacto:</strong> Por seguridad de ambas partes, los números de teléfono directo se habilitarán en la plataforma una vez que <strong>{provider.name}</strong> confirme el día y hora de visita.
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                handleClose();
                router.push(`/seguimiento/${submittedData.id}`);
              }}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 underline pt-1 block mx-auto"
            >
              Ir a la pantalla de seguimiento del turno →
            </button>
          </div>
        ) : !currentUser ? (
          <div className="p-6 sm:p-7 space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                Iniciá sesión para pedir tu turno
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Para solicitar un turno o comunicarte con <strong>{provider.name}</strong> debés ingresar con tu cuenta de AcáNomás.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
                }}
                className="w-full py-3 px-4 rounded-xl font-black text-xs text-white bg-slate-900 hover:bg-slate-800 shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <LogIn className="w-4 h-4" />
                <span>Ya tengo cuenta: Iniciar Sesión</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleClose();
                  router.push(`/login?mode=register&role=cliente&redirect=${encodeURIComponent(redirectUrl)}`);
                }}
                className="w-full py-3 px-4 rounded-xl font-black text-xs text-slate-900 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <span>Crear Cuenta de Vecino Gratis</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Seguir explorando
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {/* Honeypot anti-spam invisible para humanos */}
            <div style={{ display: 'none' }} aria-hidden="true">
              <input
                type="text"
                name="company_website_url"
                tabIndex={-1}
                autoComplete="off"
                value={honeypotUrl}
                onChange={(e) => setHoneypotUrl(e.target.value)}
              />
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700 animate-in fade-in">
                {errorMessage}
              </div>
            )}

            <div className="bg-orange-50/80 border border-orange-200 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-orange-900">
              <Sparkles className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <span>
                <strong>Cero comisiones:</strong> La solicitud generará tu turno y podrás chatear por WhatsApp o a través del Web Chat oficial de AcáNomás para conservar todos los acuerdos.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tu Nombre y Apellido *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Ej: Marcelo Gómez"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tu WhatsApp / Teléfono *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="Ej: 2266 123456"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dirección en Balcarce *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Ej: Calle 24 N° 580 (entre 17 y 19)"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Día propuesto *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    required
                    value={agreedDate}
                    onChange={(e) => setAgreedDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hora propuesta *
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="time"
                    required
                    value={agreedTime}
                    onChange={(e) => setAgreedTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ¿Qué necesitás que repare o presupueste?
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <textarea
                  rows={2}
                  placeholder="Breve descripción del trabajo..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-slate-900 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-4 rounded-2xl font-black text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Solicitar Servicio y Abrir Contacto</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
