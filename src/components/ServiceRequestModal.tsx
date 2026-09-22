'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Calendar, Clock, MapPin, Phone, User, FileText, MessageCircle, Sparkles } from 'lucide-react';
import { Provider, ServiceRequest } from '@/types';
import { createServiceRequest } from '@/lib/store';

interface ServiceRequestModalProps {
  provider: Provider | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ServiceRequestModal({
  provider,
  isOpen,
  onClose
}: ServiceRequestModalProps) {
  const router = useRouter();

  // Form states
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('Calle 18 y 21, Balcarce');
  const [description, setDescription] = useState('');
  const [agreedDate, setAgreedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [agreedTime, setAgreedTime] = useState('16:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !provider) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !clientAddress) return;

    setIsSubmitting(true);

    const newRequestId = 'req-' + Date.now().toString(36);

    const newRequest: ServiceRequest = {
      id: newRequestId,
      providerId: provider.id,
      clientName,
      clientPhone,
      clientAddress,
      clientCoords: {
        lat: provider.location.lat + (Math.random() * 0.008 - 0.004),
        lng: provider.location.lng + (Math.random() * 0.008 - 0.004)
      },
      serviceCategory: provider.category,
      description: description || `Consulta por servicio de ${provider.category}`,
      agreedDate,
      agreedTime,
      status: 'confirmado', // Para demo lo dejamos confirmado
      providerCurrentLocation: provider.location,
      estimatedArrivalMinutes: 10,
      createdAt: new Date().toISOString()
    };

    createServiceRequest(newRequest);

    // Build WhatsApp message
    const waText = encodeURIComponent(
      `¡Hola ${provider.name}! Vi tu perfil en AcáNomás (Balcarce).\n\n` +
      `👤 Mi nombre: ${clientName}\n` +
      `📍 Mi dirección: ${clientAddress}\n` +
      `📅 Fecha y hora propuesta: ${agreedDate} a las ${agreedTime} hs\n` +
      `🔧 Motivo: ${description || 'Presupuesto y visita'}\n\n` +
      `¿Podrías confirmarme si tenés disponibilidad? ¡Muchas gracias!`
    );

    const waUrl = `https://wa.me/${provider.phone.replace(/[^0-9]/g, '')}?text=${waText}`;

    // Open WhatsApp in new tab
    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank');
    }

    setIsSubmitting(false);
    onClose();

    // Redirect client to their tracking screen
    router.push(`/seguimiento/${newRequestId}`);
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
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="bg-orange-50/80 border border-orange-200 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-orange-900">
            <Sparkles className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <span>
              <strong>Cero comisiones:</strong> La solicitud generará tu turno y te abrirá un chat directo de WhatsApp con {provider.name} para coordinar el presupuesto sin intermediarios.
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
            className="w-full mt-2 py-3.5 px-4 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/25 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Confirmar y Enviar por WhatsApp</span>
          </button>
        </form>
      </div>
    </div>
  );
}
