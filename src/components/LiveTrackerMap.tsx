'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ServiceRequest, Provider } from '@/types';
import { Navigation, Home, Clock, AlertCircle } from 'lucide-react';
import { escapeHtml } from '@/lib/security';

interface LiveTrackerMapProps {
  request: ServiceRequest;
  provider: Provider;
  onArrivedSimulation?: () => void;
}

export default function LiveTrackerMap({
  request,
  provider,
  onArrivedSimulation
}: LiveTrackerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const providerMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Simulation progress between 0 (at workshop) and 1 (at client home)
  const [progress, setProgress] = useState(0.45); // Start mid-way for demo
  const [isSimulating, setIsSimulating] = useState(true);
  const [currentEtaMinutes, setCurrentEtaMinutes] = useState(request.estimatedArrivalMinutes || 7);

  const startCoord = [provider.location.lat, provider.location.lng] as [number, number];
  const endCoord = [request.clientCoords.lat, request.clientCoords.lng] as [number, number];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [(startCoord[0] + endCoord[0]) / 2, (startCoord[1] + endCoord[1]) / 2],
      zoom: 15,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    // Client Destination Marker (House with pulsing beacon)
    const clientIcon = L.divIcon({
      className: 'bg-transparent',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-10 h-10 rounded-full bg-orange-500/30 beacon-pulse"></div>
          <div class="relative w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });

    L.marker(endCoord, { icon: clientIcon })
      .bindPopup(`<b>Tu Domicilio:</b><br>${request.clientAddress}`)
      .addTo(map);

    // Initial Provider Marker
    const initialLat = startCoord[0] + (endCoord[0] - startCoord[0]) * progress;
    const initialLng = startCoord[1] + (endCoord[1] - startCoord[1]) * progress;

    const providerIcon = L.divIcon({
      className: 'bg-transparent',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-11 h-11 rounded-2xl bg-slate-900 border-2 border-amber-400 text-white flex items-center justify-center shadow-2xl">
            <svg class="w-6 h-6 text-amber-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <span class="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-md bg-slate-900 text-white text-[9px] font-black uppercase whitespace-nowrap shadow-xs">
            ${escapeHtml(provider.name.split(' ')[0])}
          </span>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    const marker = L.marker([initialLat, initialLng], { icon: providerIcon }).addTo(map);
    providerMarkerRef.current = marker;

    // Route line
    const polyline = L.polyline([startCoord, endCoord], {
      color: '#f97316',
      weight: 4,
      dashArray: '8, 8',
      opacity: 0.85
    }).addTo(map);
    routePolylineRef.current = polyline;

    map.fitBounds(L.latLngBounds([startCoord, endCoord]), { padding: [50, 50] });
    mapRef.current = map;
  }, []);

  // Animate provider marker progress along path
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isSimulating && request.status === 'en_camino') {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 0.98) {
            clearInterval(interval);
            setIsSimulating(false);
            setCurrentEtaMinutes(1);
            return 1;
          }
          const next = prev + 0.02;
          const remainingMinutes = Math.max(1, Math.round((1 - next) * 12));
          setCurrentEtaMinutes(remainingMinutes);
          return next;
        });
      }, 1200);
    }

    return () => clearInterval(interval);
  }, [isSimulating, request.status]);

  // Update marker position when progress changes
  useEffect(() => {
    if (!providerMarkerRef.current) return;

    const curLat = startCoord[0] + (endCoord[0] - startCoord[0]) * progress;
    const curLng = startCoord[1] + (endCoord[1] - startCoord[1]) * progress;
    providerMarkerRef.current.setLatLng([curLat, curLng]);
  }, [progress, startCoord, endCoord]);

  return (
    <div className="flex flex-col gap-3">
      {/* Live Status Header Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {request.status === 'en_camino' ? 'En viaje a tu domicilio' : 'Estado: ' + request.status}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-xl text-xs font-semibold text-amber-300 border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>ETA: {progress >= 0.98 ? 'Llegando ahora' : `~${currentEtaMinutes} min`}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-100">{provider.name} va en camino</h4>
            <p className="text-xs text-slate-400">Destino: {request.clientAddress}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-amber-400">
              {progress >= 0.98 ? '¡Llegó!' : `${currentEtaMinutes}'`}
            </span>
            <span className="text-[10px] block text-slate-400">tiempo estimado</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md">
        <div ref={mapContainerRef} style={{ height: '360px' }} className="w-full" />

        {/* Simulation Floating Controls */}
        <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 z-30 flex items-center justify-between bg-white/95 backdrop-blur px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl shadow-lg border border-slate-200 text-[11px] sm:text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium truncate mr-1">
            <Navigation className="w-3.5 h-3.5 text-orange-500 shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
            <span className="truncate">GPS Balcarce en vivo</span>
          </div>

          <button
            onClick={() => {
              setProgress(1);
              setCurrentEtaMinutes(0);
              if (onArrivedSimulation) onArrivedSimulation();
            }}
            className="shrink-0 px-2.5 py-1 rounded-lg font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs active:scale-95 transition-transform"
          >
            Simular Llegada
          </button>
        </div>
      </div>
    </div>
  );
}
