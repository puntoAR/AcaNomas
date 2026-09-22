'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserCheck, 
  Crown, 
  Clock, 
  Star, 
  MapPin, 
  Phone, 
  Navigation, 
  CheckCircle2, 
  RotateCcw, 
  Calendar,
  AlertCircle,
  ShieldCheck,
  Award,
  MessageCircle,
  Lock,
  Unlock,
  XCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import ServiceChat from '@/components/ServiceChat';
import { Provider, ServiceRequest, AuthUser } from '@/types';
import { 
  getProviders, 
  getServiceRequests, 
  updateServiceRequest,
  confirmServiceVisit,
  confirmReschedule
} from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';

export default function ProviderDashboardPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('prov-roberto-gomez');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [expandedChatOrderId, setExpandedChatOrderId] = useState<string | null>(null);

  const loadData = () => {
    const provs = getProviders();
    setProviders(provs);
    setRequests(getServiceRequests());
    
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user?.role === 'prestador' && user.providerId) {
      setSelectedProviderId(user.providerId);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeProvider = providers.find(p => p.id === selectedProviderId) || providers[0];
  const providerRequests = requests.filter(r => r.providerId === selectedProviderId);

  const handleConfirmVisit = (requestId: string) => {
    if (!activeProvider) return;
    confirmServiceVisit(requestId, activeProvider.name);
    loadData();
  };

  const handleAcceptReschedule = (requestId: string) => {
    if (!activeProvider) return;
    confirmReschedule(requestId, activeProvider.name, 'prestador');
    loadData();
  };

  const handleUpdateStatus = (
    requestId: string,
    status: ServiceRequest['status'],
    minutesDelay: number = 0
  ) => {
    const updates: Partial<ServiceRequest> = { status };

    if (status === 'en_camino') {
      updates.enRouteAt = new Date().toISOString();
      updates.estimatedArrivalMinutes = 10;
    }

    updateServiceRequest(requestId, updates);
    loadData();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Header & Role Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
              Panel del Prestador
            </span>
            <h1 className="text-2xl font-black text-slate-900">
              Gestión de Turnos y Puntualidad
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Controlá tus servicios en Balcarce y activá el mapa de aproximación para tus clientes.
            </p>
          </div>

          {/* Selector de prestador para pruebas */}
          <div className="flex flex-col gap-1 sm:w-72">
            <label className="text-[11px] font-bold text-slate-500 uppercase">
              Probar como prestador:
            </label>
            <select
              value={selectedProviderId}
              onChange={(e) => setSelectedProviderId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-orange-500"
            >
              {providers.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category}) {p.isPremium ? '👑 Premium' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Provider Profile Summary Bar */}
        {activeProvider && (
          <div className={`p-5 rounded-3xl bg-white border mb-6 shadow-xs ${
            activeProvider.isPremium ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <img src={activeProvider.avatar} alt={activeProvider.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">{activeProvider.name}</h3>
                    {activeProvider.isPremium ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 flex items-center gap-1">
                        <Crown className="w-3 h-3" /> ESCUDO PREMIUM
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        Nivel Estándar
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-orange-600 font-bold uppercase">{activeProvider.category} • {activeProvider.zoneName}</p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="flex items-center gap-4 text-xs">
                <div className="text-center px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center justify-center gap-1 font-black text-amber-700 text-sm">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>{activeProvider.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-[10px] text-amber-800 font-medium">({activeProvider.reviewCount} reseñas)</span>
                </div>

                <div className="text-center px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center justify-center gap-1 font-black text-emerald-700 text-sm">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>{activeProvider.punctualityScore}%</span>
                  </div>
                  <span className="text-[10px] text-emerald-800 font-medium">Puntualidad</span>
                </div>

                <div className="text-center px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="font-black text-blue-700 text-sm">
                    {activeProvider.servicesCompleted}
                  </div>
                  <span className="text-[10px] text-blue-800 font-medium">Trabajos</span>
                </div>
              </div>
            </div>

            {/* Premium explanation notice */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-500" />
                <strong>Beneficio Premium:</strong> Aparecés primero en las búsquedas de Balcarce con el escudo distintivo.
              </span>
              <span className="text-slate-400 text-[11px]">Suscripción: Costo de 1 café al mes</span>
            </div>
          </div>
        )}

        {/* Requests List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Solicitudes y Turnos de {activeProvider?.name} ({providerRequests.length})
            </h2>
            <span className="text-xs text-slate-500">Actualizado en tiempo real</span>
          </div>

          {providerRequests.length > 0 ? (
            <div className="space-y-3">
              {providerRequests.map(req => (
                <div
                  key={req.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 transition-all hover:border-slate-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center">
                        {req.clientName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{req.clientName}</h4>
                        {req.phoneUnlocked ? (
                          <p className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                            <Unlock className="w-3 h-3 text-emerald-600" />
                            <span>Tel: {req.clientPhone}</span>
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-amber-500" />
                            <span>Tel: Protegido hasta confirmar visita</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {req.status === 'pendiente' && (
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 animate-pulse flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          SOLICITUD PENDIENTE
                        </span>
                      )}
                      {req.status === 'en_camino' && (
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300 animate-pulse flex items-center gap-1.5">
                          <Navigation className="w-3.5 h-3.5 text-amber-600" />
                          EN VIAJE (GPS ACTIVO)
                        </span>
                      )}
                      {req.status === 'confirmado' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          Confirmado
                        </span>
                      )}
                      {req.status === 'llegado' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Llegó al domicilio
                        </span>
                      )}
                      {req.status === 'reprogramado' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
                          Reprogramado
                        </span>
                      )}
                      {req.status === 'cancelado' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          Cancelado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Banner: Solicitud Pendiente de Visita */}
                  {req.status === 'pendiente' && (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
                      <div className="space-y-0.5">
                        <span className="font-bold flex items-center gap-1.5 text-amber-950">
                          <Clock className="w-4 h-4 text-amber-600" />
                          El cliente solicita visita para el {req.agreedDate} a las {req.agreedTime} hs
                        </span>
                        <p className="text-[11px] text-amber-800">
                          Al confirmar, la visita quedará asentada y se liberarán los teléfonos de contacto para ambas partes.
                        </p>
                      </div>
                      <button
                        onClick={() => handleConfirmVisit(req.id)}
                        className="px-4 py-2 rounded-xl font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 shrink-0 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirmar Día y Hora</span>
                      </button>
                    </div>
                  )}

                  {/* Banner: Propuesta de Reprogramación */}
                  {req.pendingReschedule && (
                    <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-purple-900">
                      <div className="space-y-0.5">
                        <span className="font-bold flex items-center gap-1.5 text-purple-950">
                          <RotateCcw className="w-4 h-4 text-purple-600" />
                          Propuesta de reprogramación: {req.pendingReschedule.proposedDate} a las {req.pendingReschedule.proposedTime} hs
                        </span>
                        <p className="text-[11px] text-purple-800">
                          Motivo: &quot;{req.pendingReschedule.reason}&quot; (propuesto por {req.pendingReschedule.proposedBy === 'cliente' ? req.clientName : 'vos'})
                        </p>
                      </div>
                      {req.pendingReschedule.proposedBy === 'cliente' && (
                        <button
                          onClick={() => handleAcceptReschedule(req.id)}
                          className="px-4 py-2 rounded-xl font-black text-white bg-purple-600 hover:bg-purple-700 shadow-xs flex items-center gap-1.5 shrink-0 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Aceptar y Confirmar</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 sm:col-span-2">
                      <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                      <span className="truncate"><strong>Dirección:</strong> {req.clientAddress}</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>{req.agreedDate} a las {req.agreedTime} hs</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                    <strong>Motivo del trabajo:</strong> {req.description}
                  </p>

                  {/* Action Buttons for the Pro */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    {/* Toggle Web Chat */}
                    <button
                      onClick={() => setExpandedChatOrderId(expandedChatOrderId === req.id ? null : req.id)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-orange-600" />
                      <span>{expandedChatOrderId === req.id ? 'Ocultar Web Chat' : 'Abrir Web Chat'}</span>
                    </button>

                    {/* Quick WhatsApp button if unlocked */}
                    {req.phoneUnlocked && (
                      <a
                        href={`https://wa.me/${req.clientPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    {req.status === 'confirmado' && (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'en_camino')}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-sm shadow-orange-500/20 flex items-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>¡Voy en camino! (Iniciar GPS)</span>
                      </button>
                    )}

                    {req.status === 'en_camino' && (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'llegado')}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>¡Llegué al domicilio! (Registrar puntualidad)</span>
                      </button>
                    )}

                    <Link
                      href={`/seguimiento/${req.id}`}
                      target="_blank"
                      className="ml-auto text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
                    >
                      <span>Ver pantalla del cliente</span>
                      <span>→</span>
                    </Link>
                  </div>

                  {/* Expandable Web Chat */}
                  {expandedChatOrderId === req.id && (
                    <div className="pt-3 border-t border-slate-100 animate-in fade-in duration-150">
                      <ServiceChat
                        request={req}
                        role="prestador"
                        currentUserName={activeProvider.name}
                        counterpartName={req.clientName}
                        counterpartPhone={req.clientPhone}
                        onUpdateRequest={() => loadData()}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6">
              <p className="text-sm font-semibold text-slate-600">No hay solicitudes activas para este profesional.</p>
              <p className="text-xs text-slate-400 mt-1">Podés solicitar un turno desde la página de inicio para probar el flujo.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
