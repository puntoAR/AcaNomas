'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Navigation, PlusCircle, UserCheck } from 'lucide-react';
import { getServiceRequests } from '@/lib/store';

export default function BottomNav() {
  const pathname = usePathname();
  const [hasEnCamino, setHasEnCamino] = useState(false);

  useEffect(() => {
    const requests = getServiceRequests();
    const enCamino = requests.some(r => r.status === 'en_camino');
    setHasEnCamino(enCamino);
  }, [pathname]);

  const navItems = [
    {
      label: 'Explorar',
      href: '/',
      icon: Compass,
      isActive: pathname === '/'
    },
    {
      label: 'Seguimiento',
      href: '/mis-turnos',
      icon: Navigation,
      isActive: pathname.startsWith('/mis-turnos') || pathname.startsWith('/seguimiento'),
      badge: hasEnCamino
    },
    {
      label: 'Publicar',
      href: '/ofrecer-servicio',
      icon: PlusCircle,
      isActive: pathname === '/ofrecer-servicio'
    },
    {
      label: 'Prestador',
      href: '/panel-prestador',
      icon: UserCheck,
      isActive: pathname.startsWith('/panel-prestador')
    }
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl safe-area-pb">
      <div className="grid grid-cols-4 h-16 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center h-full py-1 transition-all active:scale-90 select-none ${
                item.isActive ? 'text-orange-600 font-black' : 'text-slate-500 font-semibold'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${item.isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-600"></span>
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
