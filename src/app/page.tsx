'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { 
  Search, 
  Map, 
  LayoutGrid, 
  Crown, 
  Award, 
  ShieldCheck, 
  Compass, 
  PlusCircle,
  Sparkles,
  MapPin,
  Navigation,
  Clock,
  ArrowRight
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import CategorySelector from '@/components/CategorySelector';
import ProviderCard from '@/components/ProviderCard';
import ServiceRequestModal from '@/components/ServiceRequestModal';
import AuthPromptModal from '@/components/AuthPromptModal';
import { Provider, ServiceRequest } from '@/types';
import { getProviders, getCategories, getServiceRequests } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';

// Dynamic import for Leaflet map component with ssr disabled
const MapCoverage = dynamic(() => import('@/components/MapCoverage'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[360px] sm:h-[420px] bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 font-medium text-xs sm:text-sm">
      Cargando mapa de Balcarce...
    </div>
  )
});

export default function HomePage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState(getCategories());
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Active request in 'en_camino' for live consultation banner
  const [activeEnCaminoRequest, setActiveEnCaminoRequest] = useState<ServiceRequest | null>(null);

  // Filter badges
  const [filterPremium, setFilterPremium] = useState(false);
  const [filterMatriculado, setFilterMatriculado] = useState(false);
  const [filterVerified, setFilterVerified] = useState(false);

  // View mode: 'cards' or 'map'
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards');

  // Request modal & Auth prompt
  const [activeProviderForModal, setActiveProviderForModal] = useState<Provider | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [providerForAuthPrompt, setProviderForAuthPrompt] = useState<Provider | null>(null);

  useEffect(() => {
    const provs = getProviders();
    setProviders(provs);
    setCategories(getCategories());

    const requests = getServiceRequests();
    const enCamino = requests.find(r => r.status === 'en_camino');
    if (enCamino) {
      setActiveEnCaminoRequest(enCamino);
    }

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const reqProvId = urlParams.get('requestProvider');
      if (reqProvId) {
        const found = provs.find(p => p.id === reqProvId);
        if (found) {
          if (getCurrentUser()) {
            setActiveProviderForModal(found);
            setIsModalOpen(true);
          } else {
            setProviderForAuthPrompt(found);
            setIsAuthPromptOpen(true);
          }
        }
      }
    }
  }, []);

  // Filter & Sort Providers
  const filteredProviders = useMemo(() => {
    return providers.filter(provider => {
      // Category filter
      if (selectedCategory !== 'todos' && provider.category !== selectedCategory) {
        return false;
      }
      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = provider.name.toLowerCase().includes(query);
        const matchesBio = provider.bio.toLowerCase().includes(query);
        const matchesCategory = provider.category.toLowerCase().includes(query);
        const matchesZone = provider.zoneName.toLowerCase().includes(query);
        if (!matchesName && !matchesBio && !matchesCategory && !matchesZone) {
          return false;
        }
      }
      // Badges filter
      if (filterPremium && !provider.isPremium) return false;
      if (filterMatriculado && !provider.isMatriculado) return false;
      if (filterVerified && !provider.isVerified) return false;

      return true;
    }).sort((a, b) => {
      // Premium first!
      if (a.isPremium && !b.isPremium) return -1;
      if (!a.isPremium && b.isPremium) return 1;
      // Then highest rating
      if (b.rating !== a.rating) return b.rating - a.rating;
      // Then highest punctuality
      return b.punctualityScore - a.punctualityScore;
    });
  }, [providers, selectedCategory, searchQuery, filterPremium, filterMatriculado, filterVerified]);

  const activeProvider = activeEnCaminoRequest
    ? providers.find(p => p.id === activeEnCaminoRequest.providerId)
    : null;

  const handleOpenRequest = (provider: Provider) => {
    const user = getCurrentUser();
    if (!user) {
      setProviderForAuthPrompt(provider);
      setIsAuthPromptOpen(true);
      return;
    }
    setActiveProviderForModal(provider);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* 🚀 BANNER DESTACADO DE CONSULTA: SEGUIMIENTO EN VIVO ESTILO UBER */}
      {activeEnCaminoRequest && (
        <aside aria-label="Alerta de seguimiento en vivo" className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-amber-400/40 py-2.5 px-3 sm:px-6 shadow-md">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
              <div className="min-w-0 text-xs sm:text-sm">
                <span className="font-bold text-amber-300">
                  🚗 ¡{activeProvider ? activeProvider.name : 'Tu profesional'} va en camino!
                </span>
                <span className="text-slate-300 ml-1.5 hidden md:inline">
                  Destino: {activeEnCaminoRequest.clientAddress} (Llegada estimada: ~{activeEnCaminoRequest.estimatedArrivalMinutes || 8} min)
                </span>
              </div>
            </div>

            <Link
              href={`/seguimiento/${activeEnCaminoRequest.id}`}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 shadow-sm active:scale-95 transition-all self-end sm:self-auto shrink-0"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Ver Mapa en Vivo (Estilo Uber)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>
      )}

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-orange-500/10 via-amber-500/5 to-transparent pt-5 sm:pt-7 pb-4 border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-orange-700 text-xs font-bold shadow-xs border border-orange-200/80 mb-2.5">
              <MapPin className="w-3.5 h-3.5 text-orange-600" />
              <span>Red de Oficios Barriales en Balcarce</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              La tarjetita del almacén,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
                en tu celular
              </span>
            </h1>

            <p className="mt-1.5 text-xs sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
              Plomeros, electricistas, podadores y gasistas de confianza. Contacto directo por WhatsApp, seguimiento estilo Uber y costo cero.
            </p>

            {/* Quick Search & Tracking consultation */}
            <div className="mt-4 sm:mt-5 max-w-xl mx-auto flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="¿Qué necesitás hoy? (ej. gasista, pérdida, poda)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-slate-900"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 p-1"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <Link
                href="/mis-turnos"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 shadow-xs active:scale-95 transition-all shrink-0"
              >
                <Navigation className="w-4 h-4 text-orange-600" />
                <span>Consultar mi Turno</span>
              </Link>
            </div>
          </div>

          {/* Category carousel */}
          <div className="mt-3 sm:mt-4">
            <CategorySelector
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-5 sm:py-6">
        {/* Controls Toolbar: Filters & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-200">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline">Filtros:</span>
            
            <button
              onClick={() => setFilterPremium(!filterPremium)}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterPremium
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Premium</span>
            </button>

            <button
              onClick={() => setFilterMatriculado(!filterMatriculado)}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterMatriculado
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Matriculados</span>
            </button>

            <button
              onClick={() => setFilterVerified(!filterVerified)}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterVerified
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DNI Verificado</span>
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="bg-slate-200/80 p-0.5 rounded-xl flex items-center gap-0.5">
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Tarjetas</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'map'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Mapa Balcarce</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="my-3 sm:my-4 flex items-center justify-between text-xs text-slate-500">
          <p className="truncate mr-2">
            Mostrando <strong>{filteredProviders.length}</strong> prestadores en Balcarce
            {selectedCategory !== 'todos' && ` para "${selectedCategory}"`}
          </p>
          <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1 shrink-0">
            <Crown className="w-3 h-3" /> Prestadores Premium al principio
          </span>
        </div>

        {/* Content View: Cards or Map */}
        {viewMode === 'cards' ? (
          filteredProviders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {filteredProviders.map(provider => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onRequestService={handleOpenRequest}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-3">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No encontramos prestadores con esos filtros</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Probá quitando los filtros o seleccioná &quot;Todos los oficios&quot;.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('todos');
                  setSearchQuery('');
                  setFilterPremium(false);
                  setFilterMatriculado(false);
                  setFilterVerified(false);
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold shadow-xs hover:bg-orange-700"
              >
                Restablecer filtros
              </button>
            </div>
          )
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span>Hacé clic en cualquier profesional o círculo para ver su zona de trabajo en Balcarce</span>
              <span className="font-bold text-orange-600">Centrado en Plaza Libertad</span>
            </div>
            <MapCoverage
              providers={filteredProviders}
              height="480px"
              onSelectProvider={(p) => handleOpenRequest(p)}
            />
          </div>
        )}

        {/* Community Banner (Bottom) */}
        <div className="mt-8 sm:mt-12 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-5 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl">
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-orange-400">
              <Sparkles className="w-3.5 h-3.5" /> ¿Trabajás en un oficio en Balcarce?
            </span>
            <h3 className="text-lg sm:text-2xl font-black">
              Sumá tu tarjetita a la red AcáNomás
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md">
              Publicar es gratis. Recibís los pedidos directamente en tu WhatsApp y construís tu reputación con estrellas de tus vecinos.
            </p>
          </div>

          <Link
            href="/ofrecer-servicio"
            className="w-full sm:w-auto text-center shrink-0 px-6 py-3 rounded-2xl font-black text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 shadow-lg shadow-orange-500/25 active:scale-95 transition-all"
          >
            Publicar mi Oficio Gratis
          </Link>
        </div>
      </main>

      {/* Modal for Service Request */}
      <ServiceRequestModal
        provider={activeProviderForModal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        redirectUrl={activeProviderForModal ? `/?requestProvider=${activeProviderForModal.id}` : '/'}
      />

      {/* Modal de Requerimiento de Autenticación para Turnos */}
      <AuthPromptModal
        isOpen={isAuthPromptOpen}
        onClose={() => setIsAuthPromptOpen(false)}
        provider={providerForAuthPrompt}
        redirectUrl={providerForAuthPrompt ? `/?requestProvider=${providerForAuthPrompt.id}` : '/'}
      />
    </div>
  );
}
