// Field Responder Tactical HUD Screen (Mobile-First Rugged Cockpit)
import { store } from '../state/store.js';

export function renderResponderHudView() {
  const state = store.getState();
  const echo7 = state.vehicles.find(v => v.id === 'VEH-07');
  const step = state.scenario.step;

  return `
    <div class="flex-1 flex justify-center p-3 sm:p-6 bg-app-bg min-h-[calc(100vh-7rem)]">
      <!-- Mobile Viewport Frame (Simulating In-Vehicle Rugged Tablet) -->
      <div class="max-w-md w-full bg-white border border-slate-300 rounded-2xl p-5 space-y-4 shadow-modal relative overflow-hidden self-start">
        
        <!-- Rugged Top Status Bar -->
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full ${step === 2 ? 'bg-red-500 animate-pulse' : 'bg-teal-600'}"></span>
            <span class="font-mono text-xs font-bold text-navy-900">UNIT RESCUE ECHO-7</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-semibold border border-teal-200">FirstNet 5G</span>
            <span class="text-[10px] font-mono text-slate-500 font-bold">BATT: ${echo7.batteryFuelPct}%</span>
          </div>
        </div>

        <!-- HAZARD WARNING BANNER (When step >= 2) -->
        ${step === 2 ? `
          <div class="bg-red-50 border-2 border-red-500 rounded-xl p-3.5 space-y-1.5 animate-pulse">
            <div class="flex items-center gap-2 text-red-700 font-bold text-xs font-mono">
              <span class="material-symbols-outlined text-[20px]">warning</span>
              <span>TACTICAL ALERT: WATER BREACHED</span>
            </div>
            <div class="text-xs text-slate-800 font-sans">
              Dr. Ambedkar Road at Hindmata flooded to <strong class="text-red-700 font-mono">85 cm</strong>. Exceeds vehicle 60cm clearance. Hold position for dispatcher reroute.
            </div>
          </div>
        ` : (step === 3 ? `
          <div class="bg-teal-50 border-2 border-teal-600 rounded-xl p-3.5 space-y-1">
            <div class="flex items-center gap-2 text-teal-800 font-bold text-xs font-mono">
              <span class="material-symbols-outlined text-[20px]">check_circle</span>
              <span>REROUTE TRANSMISSION LOCKED</span>
            </div>
            <div class="text-xs text-teal-900 font-sans">
              Ascend Lalbaug Elevated Flyover (+14.5m MSL). 100% dry road deck.
            </div>
          </div>
        ` : `
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
            <span class="text-slate-500 font-medium">Active Vector:</span>
            <span class="text-navy-900 font-bold truncate max-w-[200px]">${echo7.activeRouteName}</span>
          </div>
        `)}

        <!-- Turn-By-Turn HUD Card -->
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-2">
          <div class="w-12 h-12 rounded-full ${step === 2 ? 'bg-red-100 text-red-600' : 'bg-teal-100 text-teal-800'} mx-auto flex items-center justify-center">
            <span class="material-symbols-outlined text-[28px]">
              ${step >= 3 ? 'turn_slight_right' : (step === 2 ? 'hand_gesture' : 'straight')}
            </span>
          </div>
          <div class="text-lg font-bold font-mono text-navy-900">
            ${step === 2 ? 'HALT & HOLD AT DADAR TT' : (step >= 3 ? 'In 300m, Ascend Lalbaug Flyover Ramp' : 'Continue 1.8 km on Dr. Ambedkar Rd')}
          </div>
          <div class="text-xs text-slate-500 font-sans">
            ${step === 2 ? 'Awaiting Dispatcher Viaduct Clearance' : 'Destination: KEM Hospital Trauma Concourse &bull; Cargo: Pediatric Medicine'}
          </div>
        </div>

        <!-- Cockpit Telemetry Instruments -->
        <div class="grid grid-cols-3 gap-2 text-center font-mono">
          <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span class="text-[9px] text-slate-400 block font-sans">SPEED</span>
            <span class="text-sm font-bold text-navy-900 block mt-0.5">${echo7.speedKmh} km/h</span>
          </div>
          <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span class="text-[9px] text-slate-400 block font-sans">CLEARANCE</span>
            <span class="text-sm font-bold text-navy-900 block mt-0.5">${echo7.groundClearanceCm} cm</span>
          </div>
          <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span class="text-[9px] text-slate-400 block font-sans">WATER DEPTH</span>
            <span class="text-sm font-bold ${echo7.telemetry.waterSensorReadingCm > 50 ? 'text-red-600' : 'text-teal-700'} block mt-0.5">
              ${echo7.telemetry.waterSensorReadingCm} cm
            </span>
          </div>
        </div>

        <!-- Large Touch Target Action Buttons -->
        <div class="space-y-2 pt-2">
          ${step === 2 ? `
            <button 
              onclick="window.app.approveReroute()" 
              class="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-card flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <span class="material-symbols-outlined text-[20px]">thumb_up</span>
              <span>Acknowledge AI Reroute (Field Confirm)</span>
            </button>
          ` : ''}

          <div class="grid grid-cols-2 gap-2">
            <button 
              onclick="window.app.responderAction('HAZARD_REPORTED')" 
              class="py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-navy-900 font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span class="material-symbols-outlined text-[16px] text-red-600">report_problem</span>
              <span>Report Hazard</span>
            </button>
            <button 
              onclick="window.app.responderAction('ASSISTANCE_REQ')" 
              class="py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-navy-900 font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span class="material-symbols-outlined text-[16px] text-amber-600">sos</span>
              <span>Request Escort</span>
            </button>
          </div>

          <button 
            onclick="window.app.setScenarioStep(4)" 
            class="w-full py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-xs text-white font-bold flex items-center justify-center gap-1.5 shadow-subtle transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">done_all</span>
            <span>Confirm Safe Arrival at Hospital</span>
          </button>
        </div>

      </div>
    </div>
  `;
}
