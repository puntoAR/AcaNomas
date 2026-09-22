'use client';

import React, { useState } from 'react';
import { 
  MessageCircle, 
  Send, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Lock, 
  Unlock, 
  Phone, 
  AlertTriangle,
  Info,
  ShieldCheck,
  X
} from 'lucide-react';
import { ServiceRequest, ChatMessage } from '@/types';
import { 
  addChatMessage, 
  confirmServiceVisit, 
  proposeReschedule, 
  confirmReschedule, 
  cancelServiceOrder 
} from '@/lib/store';
import { sanitizeTextInput } from '@/lib/security';

interface ServiceChatProps {
  request: ServiceRequest;
  role: 'cliente' | 'prestador';
  currentUserName: string;
  counterpartName: string;
  counterpartPhone?: string;
  onUpdateRequest: (updated: ServiceRequest) => void;
  className?: string;
}

export default function ServiceChat({
  request,
  role,
  currentUserName,
  counterpartName,
  counterpartPhone,
  onUpdateRequest,
  className = ''
}: ServiceChatProps) {
  const [inputText, setInputText] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Form states for reschedule
  const [newDate, setNewDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 86400000);
    return tomorrow.toISOString().split('T')[0];
  });
  const [newTime, setNewTime] = useState('16:00');
  const [rescheduleReason, setRescheduleReason] = useState('');

  // Form states for cancellation
  const [cancelReason, setCancelReason] = useState('');

  const messages = request.messages || [];
  const isPhoneUnlocked = Boolean(request.phoneUnlocked);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = sanitizeTextInput(inputText, 400);
    if (!cleanText) return;

    const newMsg = addChatMessage(request.id, {
      sender: role,
      senderName: currentUserName,
      text: cleanText
    });

    if (newMsg) {
      setInputText('');
      const updated = {
        ...request,
        messages: [...messages, newMsg]
      };
      onUpdateRequest(updated);
    }
  };

  const handleConfirmVisit = () => {
    const updated = confirmServiceVisit(request.id, currentUserName);
    if (updated) {
      onUpdateRequest(updated);
    }
  };

  const handleProposeReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanReason = sanitizeTextInput(rescheduleReason, 200) || 'Necesidad de cambio de horario';
    const updated = proposeReschedule(
      request.id,
      role,
      currentUserName,
      newDate,
      newTime,
      cleanReason
    );
    if (updated) {
      onUpdateRequest(updated);
      setShowRescheduleModal(false);
      setRescheduleReason('');
    }
  };

  const handleAcceptReschedule = () => {
    const updated = confirmReschedule(request.id, currentUserName, role);
    if (updated) {
      onUpdateRequest(updated);
    }
  };

  const handleCancelService = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanReason = sanitizeTextInput(cancelReason, 200) || 'Cancelado por el usuario';
    const updated = cancelServiceOrder(request.id, role, currentUserName, cleanReason);
    if (updated) {
      onUpdateRequest(updated);
      setShowCancelModal(false);
      setCancelReason('');
    }
  };

  // Pre-formatted WhatsApp link
  const generateWhatsAppLink = () => {
    if (!counterpartPhone) return '#';
    const phoneClean = counterpartPhone.replace(/[^0-9]/g, '');

    let text = `¡Hola ${counterpartName}! Te escribo desde AcáNomás Balcarce por la solicitud #${request.id.slice(-6).toUpperCase()}.\n`;
    if (request.status === 'pendiente') {
      text += `📅 Fecha propuesta: ${request.agreedDate} a las ${request.agreedTime} hs.\n¿Podrías confirmarme tu disponibilidad?`;
    } else if (request.status === 'confirmado') {
      text += `✅ Visita agendada para el ${request.agreedDate} a las ${request.agreedTime} hs en ${request.clientAddress}.`;
    } else if (request.status === 'reprogramado') {
      text += `📅 Turno en proceso de reprogramación en la plataforma.`;
    } else if (request.status === 'cancelado') {
      text += `❌ Te informo sobre la cancelación de la solicitud por: "${request.cancellationReason || 'Imprevisto'}".`;
    }

    return `https://wa.me/${phoneClean}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center font-bold text-base shadow-sm">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-white">
                Web Chat con {counterpartName}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                #{request.id.slice(-6).toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Historial oficial de acuerdos y visitas en Balcarce
            </p>
          </div>
        </div>

        {/* Privacy Phone Disclosure Status */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isPhoneUnlocked ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Teléfonos Visibles</span>
              </span>

              {counterpartPhone && (
                <a
                  href={`tel:${counterpartPhone}`}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
                  title={`Llamar a ${counterpartName}`}
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              )}

              {counterpartPhone && (
                <a
                  href={generateWhatsAppLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  title="Abrir WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Teléfonos protegidos hasta acordar fecha</span>
            </span>
          )}
        </div>
      </div>

      {/* Banner 1: Pending Initial Visit Confirmation (for Provider) */}
      {request.status === 'pendiente' && role === 'prestador' && (
        <div className="bg-amber-50 border-b border-amber-200 p-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Solicitud de visita pendiente de confirmación</span>
              </div>
              <p className="text-amber-800 text-[11px]">
                El cliente solicita tu visita para el <strong>{request.agreedDate}</strong> a las <strong>{request.agreedTime} hs</strong>. Al confirmar, quedará agendada y se liberarán los teléfonos de contacto.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleConfirmVisit}
                className="px-3.5 py-1.5 rounded-xl font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Día y Hora</span>
              </button>
              <button
                onClick={() => setShowRescheduleModal(true)}
                className="px-3 py-1.5 rounded-xl font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                Proponer otro horario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner 2: Pending Initial Visit Confirmation (for Client) */}
      {request.status === 'pendiente' && role === 'cliente' && (
        <div className="bg-blue-50 border-b border-blue-200 p-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 animate-spin" />
            </div>
            <div>
              <p className="font-bold text-blue-900">
                Esperando confirmación de {counterpartName}
              </p>
              <p className="text-blue-800 text-[11px]">
                Solicitaste visita para el <strong>{request.agreedDate}</strong> a las <strong>{request.agreedTime} hs</strong>. Tan pronto como el prestador confirme o acuerden fecha, los números telefónicos quedarán habilitados.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Banner 3: Pending Reschedule Action */}
      {request.pendingReschedule && (
        <div className="bg-purple-50 border-b border-purple-200 p-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-purple-900">
                <RotateCcw className="w-4 h-4 text-purple-600" />
                <span>
                  {request.pendingReschedule.proposedBy === role
                    ? 'Tu propuesta de reprogramación está pendiente de confirmación'
                    : `${counterpartName} propuso reprogramar la visita`}
                </span>
              </div>
              <p className="text-purple-800 text-[11px]">
                Nueva fecha propuesta: <strong>{request.pendingReschedule.proposedDate}</strong> a las <strong>{request.pendingReschedule.proposedTime} hs</strong>.
                {request.pendingReschedule.reason && ` Motivo: "${request.pendingReschedule.reason}".`}
              </p>
            </div>

            {request.pendingReschedule.proposedBy !== role && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleAcceptReschedule}
                  className="px-3.5 py-1.5 rounded-xl font-black text-white bg-purple-600 hover:bg-purple-700 shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aceptar y Confirmar Fecha</span>
                </button>
                <button
                  onClick={() => setShowRescheduleModal(true)}
                  className="px-3 py-1.5 rounded-xl font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  Proponer otra
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Banner 4: Cancelled State */}
      {request.status === 'cancelado' && (
        <div className="bg-rose-50 border-b border-rose-200 p-4 text-xs">
          <div className="flex items-center gap-2.5 text-rose-900">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold">Este servicio se encuentra cancelado</p>
              <p className="text-rose-700 text-[11px]">
                {request.cancellationReason ? `Motivo: "${request.cancellationReason}"` : 'La visita fue dada de baja.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="p-4 sm:p-5 max-h-96 overflow-y-auto space-y-3 bg-slate-50/70">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            <p>Aún no hay mensajes en este chat.</p>
            <p className="text-[11px] mt-1">Escribí tu mensaje o utilizá las opciones para coordinar la visita.</p>
          </div>
        ) : (
          messages.map(msg => {
            if (msg.sender === 'sistema') {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <div className="max-w-md px-3.5 py-2 rounded-2xl bg-white border border-slate-200 shadow-xs text-center text-xs text-slate-600 space-y-0.5">
                    <div className="flex items-center justify-center gap-1.5 font-bold text-[11px] text-orange-600">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Mensaje de Plataforma AcáNomás</span>
                    </div>
                    <p className="text-slate-800 leading-snug">{msg.text}</p>
                    <span className="text-[10px] text-slate-400 block pt-0.5">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs
                    </span>
                  </div>
                </div>
              );
            }

            const isMe = msg.sender === role;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs shadow-xs ${
                    isMe
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className={`text-[10px] font-bold ${isMe ? 'text-amber-100' : 'text-slate-500'}`}>
                      {isMe ? 'Vos' : msg.senderName}
                    </span>
                    <span className={`text-[9px] ${isMe ? 'text-amber-100/80' : 'text-slate-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Action Bar (WhatsApp, Reschedule, Cancel) */}
      <div className="p-3 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          {/* Quick WhatsApp Button */}
          {counterpartPhone && (
            <a
              href={generateWhatsAppLink()}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Chatear por WhatsApp</span>
            </a>
          )}

          {/* Reschedule Button */}
          {request.status !== 'cancelado' && (
            <button
              onClick={() => setShowRescheduleModal(true)}
              className="px-3 py-1.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Reprogramar</span>
            </button>
          )}

          {/* Cancel Button */}
          {request.status !== 'cancelado' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-3 py-1.5 rounded-xl font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Cancelar</span>
            </button>
          )}
        </div>

        {/* Protection Note */}
        {!isPhoneUnlocked && (
          <span className="text-[11px] text-slate-400 italic">
            🔒 Teléfonos se desbloquean al confirmar día y hora.
          </span>
        )}
      </div>

      {/* Message Input Form */}
      {request.status !== 'cancelado' && (
        <form onSubmit={handleSendMessage} className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Escribile a ${counterpartName}...`}
            maxLength={400}
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs flex items-center gap-1.5 transition-all"
          >
            <span>Enviar</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {/* MODAL: Reprogramar */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                <h4 className="font-black text-slate-900 text-base">
                  Reprogramar Visita en Balcarce
                </h4>
              </div>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Proponé una nueva fecha y horario. La otra parte recibirá una notificación automática para re-confirmar el acuerdo.
            </p>

            <form onSubmit={handleProposeReschedule} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nueva Fecha propuesta:
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nuevo Horario propuesto:
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Motivo de la reprogramación:
                </label>
                <textarea
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="Ej: Imprevisto laboral, lluvia, falta de materiales..."
                  maxLength={200}
                  required
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-xs"
                >
                  Enviar Propuesta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Cancelar */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="font-black text-slate-900 text-base">
                  Cancelar Prestación de Servicio
                </h4>
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Esta acción cancelará la solicitud o visita en AcáNomás. Se le enviará un mensaje automático a <strong>{counterpartName}</strong> informando el motivo.
            </p>

            <form onSubmit={handleCancelService} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Motivo de la cancelación:
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ej: Ya resolví el inconveniente, no estaré en mi domicilio, etc."
                  maxLength={200}
                  required
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
                >
                  Confirmar Cancelación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
