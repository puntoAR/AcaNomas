'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Star, 
  MapPin, 
  Clock, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  Crown,
  ChevronRight,
  MessageCircle,
  EyeOff
} from 'lucide-react';
import { Provider } from '@/types';

interface ProviderCardProps {
  provider: Provider;
  onRequestService: (provider: Provider) => void;
}

export default function ProviderCard({ provider, onRequestService }: ProviderCardProps) {
  return (
    <div className={`relative flex flex-col justify-between rounded-2xl bg-white border transition-all duration-200 hover:shadow-lg ${
      provider.isPremium
        ? 'border-amber-300 ring-2 ring-amber-400/20 shadow-md shadow-amber-500/5'
        : 'border-slate-200 shadow-xs hover:border-slate-300'
    }`}>
      {/* Top badges bar */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {/* Premium Shield */}
          {provider.isPremium && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-xs">
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
              PREMIUM
            </span>
          )}

          {/* Matriculado Badge */}
          {provider.isMatriculado && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200" title={provider.matriculaNumber}>
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              Matriculado
            </span>
          )}

          {/* Identidad Verificada */}
          {provider.isVerified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200" title="Identidad cotejada con DNI por el equipo de AcáNomás">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Verificado
            </span>
          )}

          {/* Protected Profile indicator */}
          {provider.isProtected && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200" title="Perfil protegido: identidad respaldada ante la app">
              <EyeOff className="w-3 h-3 text-slate-500" />
              Perfil Protegido
            </span>
          )}
        </div>

        {/* Header: Photo + Name + Category + Rating */}
        <div className="flex items-start gap-3.5">
          <div className="relative shrink-0">
            <div className={`w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border-2 ${
              provider.isPremium ? 'border-amber-400' : 'border-slate-200'
            }`}>
              <img
                src={provider.avatar}
                alt={provider.name}
                className="w-full h-full object-cover"
              />
            </div>
            {provider.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center ring-2 ring-white shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 truncate flex items-center gap-1.5">
              {provider.name}
            </h3>
            
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
              {provider.category.replace('-', ' ')}
            </p>

            {/* Stars & Punctuality */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{provider.rating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">({provider.reviewCount})</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md" title="Índice de puntualidad en sus turnos">
                <Clock className="w-3 h-3 text-emerald-600" />
                <span>{provider.punctualityScore}% a tiempo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio summary */}
        <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {provider.bio}
        </p>

        {/* Location & Coverage */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
          <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <span className="truncate">{provider.zoneName}</span>
          <span className="text-slate-300 shrink-0">|</span>
          <span className="shrink-0 font-medium text-slate-600">Radio {provider.coverageRadiusKm} km</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 sm:p-5 pt-0 mt-2 border-t border-slate-100 flex items-center gap-2 pt-3">
        <Link
          href={`/profesional/${provider.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-98 transition-all"
        >
          <span>Ver Ficha & Mapa</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>

        <button
          onClick={() => onRequestService(provider)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 shadow-sm shadow-emerald-600/20 transition-all"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Pedir Turno</span>
        </button>
      </div>
    </div>
  );
}
