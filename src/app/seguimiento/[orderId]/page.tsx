'use client';

import React, { useState, useEffect, use } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw,
  MessageCircle,
  Star,
  ArrowLeft,
  Crown,
  Sparkles
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { ServiceRequest, Provider } from '@/types';
import { getServiceRequestById, getProviderById, updateServiceRequest } from '@/lib/store';
import { evaluatePunctuality } from '@/lib/punctuality';

// Dynamic import of LiveTrackerMap
const LiveTrackerMap = dynamic(() => import('@/components/LiveTrackerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-slate-900 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 font-medium text-sm">
      Cargando mapa de seguimiento en Balcarce...
    </div>
  )
});

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default function TrackingPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    const req = getServiceRequestById(resolvedParams.orderId);
    if (req) {
      setRequest({ ...req });
      const p = getProviderById(req.providerId);
      if (p) setProvider(p);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [resolvedParams.orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 text-slate-400 text-sm">
          Cargando seguimiento...
        </div>
      </div>
    );
  }

  if (!request || !provider) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-slate-600 font-medium">Solicitud no encontrada.</p>
          <Link href="/" className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-xl font-bold text-sm">
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  // Provider / Demo action helpers
  const handleSetEnCamino = () => {
    const updated = updateServiceRequest(request.id, {
      status: 'en_camino',
      enRouteAt: new Date().toISOString(),
      estimatedArrivalMinutes: 10
    });
    if (updated) setRequest({ ...updated });
  };

  const handleSetLlegado = (simulateDelayMinutes: number = 0) => {
    // Generate arrival time
    const [year, month, day] = request.agreedDate.split('-').map(Number);
    const [hours, minutes] = request.agreedTime.split(':').map(Number);
    const arrivalDate = new Date(year, month - 1, day, hours, minutes + simulateDelayMinutes, 0);

    const updated = updateServiceRequest(request.id, {
      status: 'llegado',
      arrivedAt: arrivalDate.toISOString()
    });
    if (updated) setRequest({ ...updated });
  };

  const handleReprogramar = () => {
    const updated = updateServiceRequest(request.id, {
      status: 'reprogramado'
    });
    if (updated) setRequest({ ...updated });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </Link>

        {/* Turn Status Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                Turno #{request.id.slice(-6).toUpperCase()}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Seguimiento de Visita en Balcarce
              </h1>
            </div>

            {/* Status Pills */}
            <div className="self-start sm:self-auto">
              {request.status === 'en_camino' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  EN VIAJE (ESTILO UBER)
                </span>
              )}
              {request.status === 'confirmado' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  Turno Confirmado
                </span>
              )}
              {request.status === 'llegado' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Llegó al Domicilio
                </span>
              )}
              {request.status === 'reprogramado' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
                  <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
                  Reprogramado
                </span>
              )}
            </div>
          </div>

          {/* Turn Data Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs text-slate-600">
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
              <span>Día acordado: <strong>{request.agreedDate}</strong></span>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <Clock className="w-4 h-4 text-orange-500 shrink-0" />
              <span>Hora pactada: <strong>{request.agreedTime} hs</strong></span>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 sm:col-span-2">
              <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
              <span className="truncate">Domicilio en Balcarce: <strong>{request.clientAddress}</strong></span>
            </div>
          </div>
        </div>

        {/* Live Tracker or Status Screen */}
        {request.status === 'en_camino' ? (
          <div className="space-y-4 mb-6">
            <LiveTrackerMap
              request={request}
              provider={provider}
              onArrivedSimulation={() => handleSetLlegado(0)}
            />
          </div>
        ) : request.status === 'llegado' ? (
          /* Arrival & Punctuality Result Card */
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Resultado de Puntualidad Automática
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  {request.punctualityResult === 'a_tiempo' && '¡Llegó a tiempo! 🎉'}
                  {request.punctualityResult === 'retraso_moderado' && 'Llegada con demora moderada'}
                  {request.punctualityResult === 'incumplimiento' && 'Incumplimiento de horario (> 60 min)'}
                  {request.punctualityResult === 'reprogramado' && 'Turno Reprogramado'}
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <p>
                <strong>Hora pactada:</strong> {request.agreedTime} hs | <strong>Hora de llegada registrada:</strong> {new Date(request.arrivedAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs.
              </p>
              <p className="text-slate-600 text-[11px]">
                El sistema de AcáNomás actualizó automáticamente el índice de cumplimiento del profesional (+puntaje de confiabilidad para el barrio).
              </p>
            </div>

            {/* Call to Action: Rate Service */}
            <div className="pt-2">
              <Link
                href={`/calificar/${request.id}`}
                className="w-full py-3.5 px-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 transition-all"
              >
                <Star className="w-5 h-5 fill-white" />
                <span>Calificar la atención de {provider.name}</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Waiting for provider to depart */
          <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center space-y-3 mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Esperando que {provider.name} salga hacia tu domicilio
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Cuando el profesional active el botón &quot;Voy en camino&quot; desde su celular, esta pantalla mostrará el mapa en vivo estilo Uber y el tiempo estimado de llegada en Balcarce.
            </p>
          </div>
        )}

        {/* Provider Contact Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
              <img src={provider.avatar} alt={provider.name} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-slate-900 truncate">{provider.name}</h4>
                {provider.isPremium && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
              </div>
              <p className="text-xs text-orange-600 font-semibold uppercase">{provider.category}</p>
              <p className="text-[11px] text-slate-400">Tel: {provider.phone}</p>
            </div>
          </div>

          <a
            href={`https://wa.me/${provider.phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat WhatsApp</span>
          </a>
        </div>

        {/* Demo Simulation Tool (Interactive testing for prompt evaluation) */}
        <div className="mt-8 p-4 rounded-2xl bg-slate-900 text-white text-xs border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-amber-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Simulador de Estados (Prueba del MVP)
            </span>
            <span className="text-[10px] text-slate-400">Balcarce Live GPS</span>
          </div>
          <p className="text-slate-300 text-[11px]">
            Podés simular las acciones que realiza el profesional desde su panel para probar la experiencia en tiempo real:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={handleSetEnCamino}
              className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 font-bold text-white shadow-xs"
            >
              1. Iniciar &quot;Voy en camino&quot; (Uber GPS)
            </button>

            <button
              onClick={() => handleSetLlegado(0)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 font-bold text-white shadow-xs"
            >
              2. Simular Llegada A Tiempo (Puntual)
            </button>

            <button
              onClick={() => handleSetLlegado(75)}
              className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 font-bold text-white shadow-xs"
            >
              3. Simular Demora &gt; 60 min (Incumplimiento)
            </button>

            <button
              onClick={handleReprogramar}
              className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 font-bold text-white shadow-xs"
            >
              4. Simular Reprogramación
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
