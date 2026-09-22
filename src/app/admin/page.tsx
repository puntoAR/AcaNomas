'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Award, 
  Crown, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  UserCheck, 
  Eye, 
  EyeOff, 
  Layers, 
  Star, 
  Clock,
  ArrowLeft,
  Search,
  Check
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Provider, Category, AuthUser } from '@/types';
import { getProviders, updateProvider, getCategories, addCategory } from '@/lib/store';
import { getCurrentUser, loginAsAdmin, logout } from '@/lib/auth';

export default function AdminDashboardPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'verificaciones' | 'prestadores' | 'rubros'>('verificaciones');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const loadData = () => {
    setProviders(getProviders());
    setCategories(getCategories());
    setCurrentUser(getCurrentUser());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = loginAsAdmin(passwordInput);
    if (res.success) {
      loadData();
    } else {
      setLoginError(res.error || 'Clave incorrecta');
    }
  };

  const handleAdminLogout = () => {
    logout();
    setCurrentUser(null);
  };

  const pendingDni = providers.filter(p => p.dniStatus === 'pending');
  const pendingMatricula = providers.filter(p => p.matriculaStatus === 'pending');
  const pendingCount = pendingDni.length + pendingMatricula.length;

  const handleApproveDni = (providerId: string) => {
    updateProvider(providerId, {
      dniStatus: 'verified',
      isVerified: true
    });
    loadData();
  };

  const handleRejectDni = (providerId: string) => {
    updateProvider(providerId, {
      dniStatus: 'rejected',
      isVerified: false
    });
    loadData();
  };

  const handleApproveMatricula = (providerId: string) => {
    updateProvider(providerId, {
      matriculaStatus: 'verified',
      isMatriculado: true
    });
    loadData();
  };

  const handleTogglePremium = (provider: Provider) => {
    updateProvider(provider.id, {
      isPremium: !provider.isPremium
    });
    loadData();
  };

  const handlePromoteCustomCategory = (customCatName: string) => {
    const slug = customCatName.toLowerCase().replace(/\s+/g, '-');
    addCategory({
      id: slug,
      name: customCatName.charAt(0).toUpperCase() + customCatName.slice(1),
      icon: 'Wrench',
      isPopular: false
    });
    loadData();
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col pb-16">
        <Navbar />
        <main className="flex-1 max-w-md w-full mx-auto px-4 py-12 flex flex-col justify-center">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-md">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                Área Restringida
              </span>
              <h1 className="text-xl font-black text-slate-900 mt-2">Panel de Administración</h1>
              <p className="text-xs text-slate-500 mt-1">
                Ingresá tu clave de moderador para gestionar validaciones de DNI, matrículas y estatus Premium en Balcarce.
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-3 pt-2 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contraseña de Administrador
                </label>
                <input
                  type="password"
                  required
                  placeholder="Contraseña (admin123)"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>

              {loginError && (
                <p className="text-xs text-rose-600 font-medium">{loginError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-black text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 active:scale-98 transition-all"
              >
                Desbloquear Panel
              </button>

              <button
                type="button"
                onClick={() => setPasswordInput('admin123')}
                className="w-full text-center text-[11px] text-slate-400 hover:text-slate-600"
              >
                (Autocompletar clave de prueba: admin123)
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 text-white p-6 rounded-3xl shadow-xl mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">
                  Backoffice de Moderación
                </span>
                <button
                  onClick={handleAdminLogout}
                  className="text-[10px] text-rose-300 hover:text-rose-100 underline"
                >
                  (Cerrar sesión)
                </button>
              </div>
              <h1 className="text-xl sm:text-2xl font-black">Admin AcáNomás Balcarce</h1>
              <p className="text-xs text-slate-400">
                Control de identidades, matrículas oficiales y asignación de Escudo Premium.
              </p>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('verificaciones')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'verificaciones'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Verificaciones</span>
              {pendingCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('prestadores')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'prestadores'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Prestadores ({providers.length})
            </button>

            <button
              onClick={() => setActiveTab('rubros')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'rubros'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Rubros
            </button>
          </div>
        </div>

        {/* Tab 1: Verifications Queue */}
        {activeTab === 'verificaciones' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>Cola de Validación de DNI (Estrella de Confianza)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Revisá los documentos subidos por prestadores para habilitar el sello de Identidad Verificada.
              </p>
            </div>

            {pendingDni.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingDni.map(p => (
                  <div key={p.id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{p.name}</h4>
                        <p className="text-xs text-orange-600 uppercase font-bold">{p.category} • {p.zoneName}</p>
                        <p className="text-[11px] text-slate-400">Tel: {p.phone}</p>
                      </div>
                    </div>

                    {/* DNI Document Mock View */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                      <span className="font-bold text-slate-700 block">Documento DNI Adjunto:</span>
                      <p className="text-slate-500 text-[11px]">
                        Nombre legal declarado: <strong>{p.realName || p.name}</strong>
                      </p>
                      <div className="h-28 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 font-mono text-xs overflow-hidden">
                        {p.dniDocumentUrl ? (
                          <img src={p.dniDocumentUrl} alt="DNI" className="w-full h-full object-cover" />
                        ) : (
                          <span>[Foto DNI Frente y Dorso]</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleApproveDni(p.id)}
                        className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Aprobar DNI</span>
                      </button>
                      <button
                        onClick={() => handleRejectDni(p.id)}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100"
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-white border border-slate-200 text-center text-xs text-slate-500">
                No hay DNIs pendientes de validación en este momento.
              </div>
            )}

            {/* Matricula Queue */}
            <div className="pt-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <span>Credenciales de Matriculados (Gas / Electricidad)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Revisá el número de matrícula y carnet para otorgar el sello destacado.
              </p>
            </div>

            {pendingMatricula.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingMatricula.map(p => (
                  <div key={p.id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{p.name}</h4>
                        <p className="text-xs text-emerald-700 font-bold uppercase">{p.category}</p>
                        <p className="text-[11px] text-slate-600 font-mono">{p.matriculaNumber}</p>
                      </div>
                    </div>

                    <div className="h-28 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 font-mono text-xs overflow-hidden">
                      {p.matriculaDocumentUrl ? (
                        <img src={p.matriculaDocumentUrl} alt="Carnet" className="w-full h-full object-cover" />
                      ) : (
                        <span>[Foto de Carnet de Matrícula]</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleApproveMatricula(p.id)}
                      className="w-full py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Award className="w-4 h-4" />
                      <span>Validar Matrícula Oficial</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-white border border-slate-200 text-center text-xs text-slate-500">
                No hay matrículas pendientes de verificación.
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Provider Directory & Premium Shield Management */}
        {activeTab === 'prestadores' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Directorio General de Balcarce</h3>
                <p className="text-xs text-slate-500">
                  Activá o desactivá el <strong>Escudo Premium</strong> (prioridad al tope de las búsquedas).
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase font-bold text-[10px] text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Prestador</th>
                    <th className="py-3 px-4">Rubro</th>
                    <th className="py-3 px-4">Insignias</th>
                    <th className="py-3 px-4">Puntualidad</th>
                    <th className="py-3 px-4">Calificación</th>
                    <th className="py-3 px-4 text-right">Estatus Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {providers.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-xl object-cover" />
                          <div>
                            <span className="font-bold text-slate-900 block">{p.name}</span>
                            <span className="text-[10px] text-slate-400">{p.zoneName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-orange-600 uppercase">
                        {p.category}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {p.isVerified && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                              DNI
                            </span>
                          )}
                          {p.isMatriculado && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Matrícula
                            </span>
                          )}
                          {p.isProtected && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px]">
                              Protegido
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-emerald-700">
                          {p.punctualityScore}% a tiempo
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-amber-600">
                        {p.rating.toFixed(1)} ★ ({p.reviewCount})
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleTogglePremium(p)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ml-auto ${
                            p.isPremium
                              ? 'bg-amber-400 text-slate-950 shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <Crown className={`w-3.5 h-3.5 ${p.isPremium ? 'fill-slate-950' : ''}`} />
                          <span>{p.isPremium ? 'PREMIUM (Activo)' : 'Hacer Premium'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Rubros Management */}
        {activeTab === 'rubros' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Gestión de Rubros y Categorías</h3>
              <p className="text-xs text-slate-500">
                Categorías activas en el buscador de Balcarce.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map(c => (
                <div key={c.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>{c.name}</span>
                  <span className="text-[10px] text-slate-400">Activo</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Promover nuevo rubro oficial
              </h4>
              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  id="newRubroInput"
                  placeholder="Ej: Fletes y Mudanzas..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('newRubroInput') as HTMLInputElement;
                    if (input && input.value.trim()) {
                      handlePromoteCustomCategory(input.value.trim());
                      input.value = '';
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 shadow-xs"
                >
                  Agregar Rubro
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
