'use client';

import React, { useState, useEffect, use } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Star, 
  MapPin, 
  Clock, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  Crown, 
  ArrowLeft,
  MessageCircle,
  EyeOff,
  ThumbsUp,
  Calendar,
  Phone
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import ServiceRequestModal from '@/components/ServiceRequestModal';
import { Provider, Review } from '@/types';
import { getProviderById, getReviews } from '@/lib/store';

// Dynamic import for Leaflet map component with ssr disabled
const MapCoverage = dynamic(() => import('@/components/MapCoverage'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 font-medium text-sm">
      Cargando área de cobertura en Balcarce...
    </div>
  )
});

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProviderProfilePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const p = getProviderById(resolvedParams.id);
    if (p) {
      setProvider(p);
      const allReviews = getReviews();
      setReviews(allReviews.filter(r => r.providerId === p.id));
    }
  }, [resolvedParams.id]);

  if (!provider) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-slate-500 font-medium">Profesional no encontrado.</p>
          <Link href="/" className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-xl font-bold text-sm">
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 sm:pb-12">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-4 py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la pizarra de oficios</span>
        </Link>

        {/* Profile Card Header */}
        <div className={`rounded-3xl bg-white border p-6 sm:p-8 shadow-sm ${
          provider.isPremium ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-200'
        }`}>
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {provider.isPremium && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-xs">
                <Crown className="w-4 h-4 fill-slate-950" />
                PRESTADOR PREMIUM
              </span>
            )}

            {provider.isMatriculado && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                <Award className="w-4 h-4 text-emerald-600" />
                Matriculado Oficial
              </span>
            )}

            {provider.isVerified && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-300">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Identidad Verificada (DNI)
              </span>
            )}

            {provider.isProtected && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                Perfil Protegido por Privacidad
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-3xl overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-md">
                <img
                  src={provider.avatar}
                  alt={provider.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {provider.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center ring-4 ring-white shadow-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                {provider.name}
              </h1>

              <p className="text-sm font-bold text-orange-600 uppercase tracking-wider mt-0.5">
                {provider.category.replace('-', ' ')} en Balcarce
              </p>

              {provider.matriculaNumber && (
                <p className="text-xs font-semibold text-emerald-800 bg-emerald-50 inline-block px-2.5 py-1 rounded-lg border border-emerald-200 mt-2">
                  {provider.matriculaNumber}
                </p>
              )}

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1 font-bold text-amber-600 text-sm">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{provider.rating.toFixed(1)}</span>
                  <span className="text-slate-400 font-normal">({provider.reviewCount} reseñas)</span>
                </div>

                <span className="text-slate-300">•</span>

                <div className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{provider.punctualityScore}% puntualidad</span>
                </div>

                <span className="text-slate-300">•</span>

                <span className="text-slate-600 font-medium">
                  <strong>{provider.experienceYears}</strong> años de experiencia
                </span>
              </div>
            </div>

            {/* Desktop CTA Button */}
            <div className="hidden sm:block shrink-0">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3.5 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/25 active:scale-95 transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Pedir Turno / WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Sobre el profesional
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {provider.bio}
            </p>
          </div>
        </div>

        {/* Coverage Map Section */}
        <div className="mt-6 rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Zona de Cobertura en Balcarce
                </h3>
                <p className="text-xs text-slate-500">
                  Taller / Base de referencia: <strong>{provider.zoneName}</strong> (Radio aproximado de {provider.coverageRadiusKm} km)
                </p>
              </div>
            </div>
          </div>

          <MapCoverage
            providers={[provider]}
            selectedProviderId={provider.id}
            height="320px"
          />
        </div>

        {/* Punctuality Indicator Widget */}
        <div className="mt-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200 p-6 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  Sistema de Cumplimiento de Horario
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-bold">
                  {provider.punctualityScore}% A Tiempo
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                AcáNomás calcula automáticamente si el profesional llega dentro de la hora pactada cuando activa la llegada en su celular. Si hay demora superior a una hora sin reprogramar, el sistema registra incumplimiento.
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-6 rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">
                Opiniones de Vecinos de Balcarce
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
            </span>
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map(rev => (
                <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center">
                        {rev.clientName.charAt(0)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900">{rev.clientName}</span>
                        <span className="text-[10px] text-slate-400 block">{rev.createdAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{rev.averageRating.toFixed(1)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 italic">
                    &quot;{rev.comment}&quot;
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1 text-[10px] text-slate-500">
                    <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      Puntualidad: {rev.punctualityRating} ★
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      Calidad: {rev.qualityRating} ★
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      Precio: {rev.priceRating} ★
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-6">
              Este profesional aún no tiene reseñas públicas en AcáNomás. ¡Sé el primero en calificar su trabajo!
            </p>
          )}
        </div>
      </main>

      {/* Floating Sticky Mobile CTA */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur border-t border-slate-200 z-40 shadow-2xl">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full py-3.5 px-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 active:scale-98 shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Solicitar Visita por WhatsApp</span>
        </button>
      </div>

      {/* Modal */}
      <ServiceRequestModal
        provider={provider}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
