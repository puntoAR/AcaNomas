'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Briefcase, 
  ShieldCheck, 
  Award, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle2, 
  EyeOff, 
  Eye, 
  Upload, 
  Sparkles,
  ArrowLeft,
  Camera
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Provider } from '@/types';
import { createProvider, getCategories, getProviders, BALCARCE_CENTER } from '@/lib/store';
import { sanitizeTextInput, sanitizePhone, detectMaliciousPayload } from '@/lib/security';

export default function OfrecerServicioPage() {
  const router = useRouter();
  const categories = getCategories();

  // Form states
  const [name, setName] = useState('');
  const [realName, setRealName] = useState('');
  const [category, setCategory] = useState('plomero');
  const [customCategory, setCustomCategory] = useState('');
  const [phone, setPhone] = useState('');
  const [zoneName, setZoneName] = useState('Zona Centro / Plaza Libertad');
  const [coverageRadiusKm, setCoverageRadiusKm] = useState(6);
  const [experienceYears, setExperienceYears] = useState(5);
  const [bio, setBio] = useState('');
  
  // Privacy choice: 'visible' or 'protegido'
  const [privacyMode, setPrivacyMode] = useState<'visible' | 'protegido'>('visible');
  const [hasDniUpload, setHasDniUpload] = useState(false);
  
  // Matriculado option
  const [isMatriculado, setIsMatriculado] = useState(false);
  const [matriculaNumber, setMatriculaNumber] = useState('');
  const [hasMatriculaUpload, setHasMatriculaUpload] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Detección de inyecciones maliciosas
    if (
      detectMaliciousPayload(name) ||
      detectMaliciousPayload(phone) ||
      detectMaliciousPayload(customCategory) ||
      detectMaliciousPayload(bio)
    ) {
      setErrorMsg('Se detectaron caracteres o instrucciones no permitidas.');
      return;
    }

    const safeName = sanitizeTextInput(name, 60);
    const safeRealName = sanitizeTextInput(realName, 60) || safeName;
    const safePhone = sanitizePhone(phone);
    const safeZone = sanitizeTextInput(zoneName, 80) || 'Balcarce Centro';
    const safeCustomCategory = sanitizeTextInput(customCategory, 40);
    const safeBio = sanitizeTextInput(bio, 350);
    const safeMatricula = sanitizeTextInput(matriculaNumber, 30);

    if (!safeName || safeName.length < 3) {
      setErrorMsg('Por favor ingresá un nombre válido.');
      return;
    }

    if (!safePhone || safePhone.length < 6) {
      setErrorMsg('Ingresá un número de teléfono válido.');
      return;
    }

    // Control Anti-Fraude: Teléfono duplicado
    const providers = getProviders();
    if (providers.some(p => sanitizePhone(p.phone) === safePhone)) {
      setErrorMsg('Ya existe un prestador registrado con este teléfono en Balcarce.');
      return;
    }

    setIsSubmitting(true);

    const newId = 'prov-' + Date.now().toString(36);
    const isProtected = privacyMode === 'protegido';

    // Default avatar based on selection
    const defaultAvatar = isProtected
      ? 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

    const newProvider: Provider = {
      id: newId,
      name: isProtected ? `${safeName} (${safeCustomCategory || category.toUpperCase()})` : safeName,
      realName: safeRealName,
      category: category === 'otro' ? (safeCustomCategory.toLowerCase().trim() || 'otro') : category,
      customCategory: category === 'otro' ? safeCustomCategory : undefined,
      isProtected,
      avatar: defaultAvatar,
      phone: safePhone,
      zoneName: safeZone,
      location: {
        lat: BALCARCE_CENTER.lat + (Math.random() * 0.01 - 0.005),
        lng: BALCARCE_CENTER.lng + (Math.random() * 0.01 - 0.005)
      },
      coverageRadiusKm: Math.min(Math.max(coverageRadiusKm || 6, 1), 30),
      isVerified: false, // Siempre inicia sin verificar hasta auditoría
      dniStatus: hasDniUpload ? 'pending' : 'none', // PENDIENTE de revisión administrativa
      isMatriculado: Boolean(isMatriculado && safeMatricula),
      matriculaNumber: isMatriculado ? safeMatricula : undefined,
      matriculaStatus: isMatriculado && safeMatricula ? 'pending' : 'none',
      isPremium: false,
      rating: 5.0,
      reviewCount: 0,
      punctualityScore: 100,
      servicesCompleted: 0,
      bio: safeBio || `Profesional de oficio en Balcarce con ${experienceYears} años de trayectoria. Calidad y cumplimiento asegurado.`,
      experienceYears,
      createdAt: new Date().toISOString().split('T')[0]
    };

    createProvider(newProvider);
    setSuccess(true);
    setIsSubmitting(false);

    setTimeout(() => {
      router.push(`/profesional/${newId}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </Link>

        {success ? (
          <div className="bg-white rounded-3xl border border-emerald-200 p-8 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">¡Tu oficio ya está publicado!</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Tu tarjetita virtual ya se encuentra activa en AcáNomás Balcarce. Redirigiendo a tu perfil público...
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-100 mb-1">
                <Briefcase className="w-4 h-4" />
                <span>Alta de Prestador en Balcarce</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">Sumate a AcáNomás</h1>
              <p className="text-xs sm:text-sm text-white/90 mt-1">
                Costo cero para empezar. Recibís los pedidos directamente por WhatsApp y mostrás tu puntualidad a los vecinos.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 animate-in fade-in">
                  {errorMsg}
                </div>
              )}

              {/* 1. Oficio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. ¿A qué oficio te dedicás? *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.filter(c => c.id !== 'todos').map(cat => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        category === cat.id
                          ? 'border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-500/20 shadow-xs'
                          : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {category === 'otro' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      required
                      placeholder="Escribí tu oficio (ej. Afilador, Fletes, Tapicero)..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 text-slate-900"
                    />
                  </div>
                )}
              </div>

              {/* 2. Privacidad vs Estrella de Confianza */}
              <div className="border-t border-slate-100 pt-5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. ¿Cómo querés que te vean los vecinos? *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setPrivacyMode('visible')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      privacyMode === 'visible'
                        ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900 mb-1">
                      <Eye className="w-4 h-4 text-orange-600" />
                      <span>Perfil Visible</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Tu nombre real y foto de perfil son visibles para todos los vecinos.
                    </p>
                  </div>

                  <div
                    onClick={() => setPrivacyMode('protegido')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      privacyMode === 'protegido'
                        ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900 mb-1">
                      <EyeOff className="w-4 h-4 text-blue-600" />
                      <span>Perfil Protegido</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Ocultamos tu cara y apellido legal al público. Mostrás un avatar y alias, pero validás DNI con la plataforma para obtener la <strong>Estrella de Confianza</strong>.
                    </p>
                  </div>
                </div>

                {/* Subida de DNI */}
                <div className="mt-3 p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-blue-950">
                        {privacyMode === 'protegido' ? 'Validación de DNI (Obligatoria para modo protegido)' : 'Validación de Identidad (Opcional pero recomendada)'}
                      </h4>
                      <p className="text-xs text-blue-800">
                        Los profesionales con identidad verificada reciben el sello azul y generan el doble de contrataciones en Balcarce.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-bold text-blue-900 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={hasDniUpload}
                      onChange={(e) => setHasDniUpload(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-blue-300 focus:ring-blue-500"
                    />
                    <span>Adjuntar foto de DNI frente y dorso (Simular verificación)</span>
                  </label>
                </div>
              </div>

              {/* 3. Datos de Contacto */}
              <div className="border-t border-slate-100 pt-5 space-y-3.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  3. Datos de contacto y taller
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {privacyMode === 'protegido' ? 'Nombre o Fantasía Comercial *' : 'Nombre y Apellido *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={privacyMode === 'protegido' ? 'Ej: Carlos (Plomería Balcarce)' : 'Ej: Carlos Giménez'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      WhatsApp para recibir pedidos *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej: 5492266551122"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Barrio o Zona base en Balcarce *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Barrio Pueblo Nuevo / Calle 22 y 17"
                      value={zoneName}
                      onChange={(e) => setZoneName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Radio de cobertura: <span className="text-orange-600 font-bold">{coverageRadiusKm} km</span>
                    </label>
                    <input
                      type="range"
                      min={2}
                      max={15}
                      step={1}
                      value={coverageRadiusKm}
                      onChange={(e) => setCoverageRadiusKm(Number(e.target.value))}
                      className="w-full accent-orange-600 mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Profesional Matriculado */}
              <div className="border-t border-slate-100 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isMatriculado}
                      onChange={(e) => setIsMatriculado(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <span>¿Sos profesional matriculado? (Gas / Electricidad)</span>
                  </label>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Sello Destacado
                  </span>
                </div>

                {isMatriculado && (
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-emerald-950 mb-1">
                        Entidad y Número de Matrícula *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Camuzzi Mat. 48219 o Col. Técnicos N°..."
                        value={matriculaNumber}
                        onChange={(e) => setMatriculaNumber(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-emerald-300 text-sm focus:ring-2 focus:ring-emerald-500 text-slate-900"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-xs font-bold text-emerald-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasMatriculaUpload}
                        onChange={(e) => setHasMatriculaUpload(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500"
                      />
                      <span>Adjuntar foto de credencial/carnet habilitante</span>
                    </label>
                  </div>
                )}
              </div>

              {/* 5. Bio */}
              <div className="border-t border-slate-100 pt-5">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descripción breve de tus trabajos y servicios
                </label>
                <textarea
                  rows={3}
                  placeholder="Contale a los vecinos qué trabajos realizás, marcas que atendés, si hacés urgencias..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 text-slate-900 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-xl shadow-orange-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Publicar mi Oficio en Balcarce Gratis</span>
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
