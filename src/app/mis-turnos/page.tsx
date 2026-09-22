'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Navigation, 
  Clock, 
  MapPin, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Search, 
  ArrowLeft, 
  Star, 
  MessageCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { ServiceRequest, Provider } from '@/types';
import { getServiceRequests, getProviders } from '@/lib/store';

export default function MisTurnosPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    setRequests(getServiceRequests());
    setProviders(getProviders());
  }, []);

  const getProviderInfo = (providerId: string) => {
    return providers.find(p => p.id === providerId);
  };

  const filteredRequests = requests.filter(req => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const provider = getProviderInfo(req.providerId);
    return (
      req.id.toLowerCase().includes(q) ||
      req.clientName.toLowerCase().includes(q) ||
      req.clientPhone.includes(q) ||
      req.clientAddress.toLowerCase().includes(q) ||
      (provider && provider.name.toLowerCase().includes(q))
    );
  });

  const activeEnCamino = filteredRequests.filter(r => r.status === 'en_camino');
  const otherRequests = filteredRequests.filter(r => r.status !== 'en_camino');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 sm:pb-12">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la pizarra</span>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">
            <Navigation className="w-4 h-4" />
            <span>Consultar Turno de Vecino</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Seguimiento de Servicios en Balcarce
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Revisá en cualquier momento el estado de tu turno, el tiempo estimado de llegada y el mapa en tiempo real estilo Uber.
          </p>

          {/* Quick Search */}
          <div className="mt-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por teléfono, nombre o dirección..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-orange-500 text-slate-900"
            />
          </div>
        </div>

        {/* 1. SECCIÓN DESTACADA: SERVICIOS EN CAMINO (ESTILO UBER) */}
        {activeEnCamino.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                En Viaje hacia tu domicilio ({activeEnCamino.length})
              </h2>
            </div>

            <div className="space-y-3">
              {activeEnCamino.map(req => {
                const provider = getProviderInfo(req.providerId);
                return (
                  <div
                    key={req.id}
                    className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 sm:p-6 shadow-xl border border-slate-700 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-amber-400 text-slate-950 shadow-xs">
                        <Navigation className="w-3.5 h-3.5 animate-pulse text-slate-950" />
                        PROFESIONAL EN CAMINO (GPS ACTIVO)
                      </span>

                      <span className="text-xs font-mono font-bold text-amber-300">
                        ETA: ~{req.estimatedArrivalMinutes || 8} min
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5">
                      {provider && (
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-700 border-2 border-amber-400 shrink-0">
                          <img src={provider.avatar} alt={provider.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="text-base font-black text-slate-100 truncate">
                          {provider ? provider.name : 'Profesional'}
                        </h3>
                        <p className="text-xs text-orange-400 font-semibold uppercase">
                          {req.serviceCategory} • Balcarce
                        </p>
                        <p className="text-xs text-slate-300 truncate mt-0.5">
                          Destino: {req.clientAddress}
                        </p>
                      </div>
                    </div>

                    <div className="pt-1 flex flex-col sm:flex-row gap-2">
                      <Link
                        href={`/seguimiento/${req.id}`}
                        className="flex-1 py-3 px-4 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>Abrir Mapa de Seguimiento en Vivo (Estilo Uber)</span>
                      </Link>

                      {provider && (
                        <a
                          href={`https://wa.me/${provider.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="py-3 px-4 rounded-xl font-bold text-xs text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center gap-1.5"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-400" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. OTROS TURNOS (CONFIRMADOS O FINALIZADOS) */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Todos mis turnos registrados ({otherRequests.length})
          </h2>

          {otherRequests.length > 0 ? (
            <div className="space-y-3">
              {otherRequests.map(req => {
                const provider = getProviderInfo(req.providerId);
                return (
                  <div
                    key={req.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 transition-all hover:border-slate-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          #{req.id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {provider?.name || 'Profesional'}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {req.status === 'pendiente' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Pendiente de confirmación
                          </span>
                        )}
                        {req.status === 'confirmado' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            Confirmado
                          </span>
                        )}
                        {req.status === 'llegado' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Llegó ({req.punctualityResult === 'a_tiempo' ? 'A tiempo' : 'Registrado'})
                          </span>
                        )}
                        {req.status === 'reprogramado' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                            Reprogramado
                          </span>
                        )}
                        {req.status === 'cancelado' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            Cancelado
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-orange-500" />
                        <span>Fecha: {req.agreedDate} a las {req.agreedTime} hs</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-orange-500" />
                        <span className="truncate">{req.clientAddress}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <Link
                        href={`/seguimiento/${req.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Ver seguimiento y Web Chat</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>

                      {req.status === 'llegado' && !req.clientRated && (
                        <Link
                          href={`/calificar/${req.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-xs"
                        >
                          <Star className="w-3.5 h-3.5 fill-white" />
                          <span>Calificar</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6">
              <p className="text-xs text-slate-500">No encontramos turnos registrados con esa búsqueda.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
