'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, Clock, CheckCircle2, ArrowLeft, ThumbsUp, Sparkles, MessageSquare } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { ServiceRequest, Provider, Review } from '@/types';
import { getServiceRequestById, getProviderById, addReview } from '@/lib/store';

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default function CalificarServicioPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);

  // Ratings (1 to 5)
  const [punctualityRating, setPunctualityRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [priceRating, setPriceRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const req = getServiceRequestById(resolvedParams.orderId);
    if (req) {
      setRequest(req);
      const prov = getProviderById(req.providerId);
      if (prov) setProvider(prov);
    }
  }, [resolvedParams.orderId]);

  if (!request || !provider) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-slate-500 font-medium">Turno no encontrado para calificar.</p>
          <Link href="/" className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-xl font-bold text-sm">
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const averageRating = parseFloat(
      ((punctualityRating + qualityRating + priceRating) / 3).toFixed(1)
    );

    const newReview: Review = {
      id: 'rev-' + Date.now().toString(36),
      orderId: request.id,
      providerId: provider.id,
      clientName: request.clientName,
      punctualityRating,
      qualityRating,
      priceRating,
      averageRating,
      comment: comment || 'Muy buen trabajo y predisposición.',
      punctualityTag: request.punctualityResult,
      createdAt: new Date().toISOString().split('T')[0]
    };

    addReview(newReview);
    setSubmitted(true);
    setIsSubmitting(false);

    setTimeout(() => {
      router.push(`/profesional/${provider.id}`);
    }, 1800);
  };

  const renderStars = (value: number, setValue: (n: number) => void) => {
    return (
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setValue(star)}
            className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-hidden"
          >
            <Star
              className={`w-7 h-7 ${
                star <= value
                  ? 'fill-amber-400 text-amber-500'
                  : 'text-slate-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 font-bold text-slate-700 text-sm">{value} / 5</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16">
      <Navbar />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-6">
        <Link
          href={`/seguimiento/${request.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al seguimiento</span>
        </Link>

        {submitted ? (
          <div className="bg-white rounded-3xl border border-emerald-200 p-8 text-center space-y-3 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">¡Gracias por calificar a {provider.name}!</h2>
            <p className="text-xs text-slate-600">
              Tu opinión ayuda a que otros vecinos de Balcarce elijan profesionales de confianza. Redirigiendo...
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-100 mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Calificación de Vecino</span>
              </div>
              <h1 className="text-2xl font-black">¿Cómo fue tu experiencia?</h1>
              <p className="text-xs text-white/90 mt-1">
                Calificás el servicio brindado por <strong>{provider.name}</strong> ({provider.category}).
              </p>
            </div>

            {/* Punctuality validation info */}
            <div className="p-4 bg-emerald-50/70 border-b border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-900">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Puntualidad verificada por el sistema:</strong>{' '}
                {request.punctualityResult === 'a_tiempo' ? 'Llegó a tiempo según lo acordado' : 'Visita registrada'}
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Criterion 1: Puntualidad */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  1. Puntualidad y cumplimiento del horario
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  ¿Llegó dentro del horario acordado o te avisó a tiempo?
                </p>
                {renderStars(punctualityRating, setPunctualityRating)}
              </div>

              {/* Criterion 2: Calidad y Solución */}
              <div className="border-t border-slate-100 pt-5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  2. Solución del problema / Calidad del trabajo
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  ¿Resolvió la falla de forma prolija, limpia y duradera?
                </p>
                {renderStars(qualityRating, setQualityRating)}
              </div>

              {/* Criterion 3: Relación Precio / Calidad */}
              <div className="border-t border-slate-100 pt-5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  3. Relación Precio / Calidad
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  ¿El precio acordado fue justo y transparente para el trabajo realizado?
                </p>
                {renderStars(priceRating, setPriceRating)}
              </div>

              {/* Comment */}
              <div className="border-t border-slate-100 pt-5">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dejale un comentario a los vecinos de Balcarce
                </label>
                <textarea
                  rows={3}
                  placeholder="Ej: Muy puntual, prolijo, dejó todo impecable y explicó cada paso..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 text-slate-900 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/25 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Enviar mi Calificación</span>
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
