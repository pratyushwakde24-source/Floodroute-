// Incident Detail & Dispatch Screen
import { store } from '../state/store.js';

export function renderIncidentDetailView() {
  const state = store.getState();
  const inc = state.incidents.find(i => i.id === state.selectedIncidentId) || state.incidents[0];
  const step = state.scenario.step;
  const echo7 = state.vehicles.find(v => v.id === 'VEH-07');
  const availableVehicles = state.vehicles;

  return `
    <div class="flex-1 flex flex-col lg:flex-row h-full min-h-[calc(100vh-7rem)] overflow-hidden bg-app-bg relative">
      
      <!-- LEFT / CENTER: Tactical Incident GIS Map -->
      <div class="relative flex-1 min-h-[460px] lg:min-h-full overflow-hidden bg-slate-900">
        
        <!-- Background Vector Grid -->
        <div class="absolute inset-0 tactical-map-grid opacity-60"></div>

        <!-- SVG Tactical Incident Vectors -->
        <svg class="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none" viewBox="0 0 1000 800">
          <defs>
            <linearGradient id="detailSafeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#14B8A6" stop-opacity="0.95"></stop>
              <stop offset="100%" stop-color="#0D9488" stop-opacity="0.95"></stop>
            </linearGradient>
            <linearGradient id="detailHazardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#EF4444" stop-opacity="0.45"></stop>
              <stop offset="100%" stop-color="#991B1B" stop-opacity="0.15"></stop>
            </linearGradient>
          </defs>

          <!-- Inundation Hazard Polygon Area -->
          <path d="M 280,310 C 360,280 520,330 610,380 C 690,430 730,550 640,640 C 550,710 380,680 300,590 C 240,510 210,360 280,310 Z" fill="url(#detailHazardGrad)"></path>
          <path class="opacity-70 animate-pulse" d="M 280,310 C 360,280 520,330 610,380 C 690,430 730,550 640,640 C 550,710 380,680 300,590 Z" fill="none" stroke="#EF4444" stroke-dasharray="6 4" stroke-width="2"></path>

          <!-- Blocked Road Segment -->
          <path d="M 460,420 L 590,510 L 630,590" fill="none" stroke="#EF4444" stroke-width="6" stroke-dasharray="8 6" stroke-linecap="round"></path>

          <!-- AI Safe Corridor Route A (Viaduct Bypass) -->
          <path d="M 120,680 C 160,540 210,410 330,340 C 440,280 620,290 710,230" fill="none" stroke="url(#detailSafeGrad)" stroke-width="5" stroke-linecap="round"></path>
          <path class="opacity-90 animate-dash" d="M 120,680 C 160,540 210,410 330,340 C 440,280 620,290 710,230" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-dasharray="8 12" stroke-linecap="round"></path>
        </svg>

        <!-- Back to Incidents Queue Floating Button -->
        <div class="absolute top-4 left-4 z-20">
          <button 
            onclick="window.app.navigate('incidents')" 
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-md border border-slate-200 text-navy-900 hover:bg-slate-50 text-xs font-semibold shadow-card transition-colors"
          >
            <span class="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Queue</span>
          </button>
        </div>

        <!-- Local Map Status Tag (Bottom Left) -->
        <div class="absolute bottom-4 left-4 z-20 bg-slate-900/90 text-white border border-slate-700/60 px-3 py-1.5 rounded-lg text-xs font-mono shadow-card">
          <span>Inundation Zone: <strong class="text-red-400">85cm Crest</strong> &bull; Lalbaug Elevated Corridor Active</span>
        </div>

      </div>

      <!-- RIGHT: Incident Dossier & Dispatch Panel -->
      <div class="w-full lg:w-[480px] bg-white border-l border-app-border p-5 lg:p-6 overflow-y-auto space-y-5 flex-shrink-0 z-20 shadow-subtle">
        
        <!-- Header & Severity -->
        <div class="border-b border-app-border pb-4">
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-mono text-xs text-slate-500 font-bold">${inc.id}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              inc.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
            }">
              ${inc.severity} SEVERITY
            </span>
          </div>
          <h1 class="text-lg font-bold text-navy-900 leading-tight">${inc.title}</h1>
          <p class="text-xs text-slate-500 font-mono mt-1">${inc.location} &bull; ${inc.zone}</p>
        </div>

        <!-- Verified Facts & Telemetry Summary -->
        <div class="grid grid-cols-3 gap-2 text-center font-mono text-xs">
          <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span class="text-[10px] text-slate-500 block font-sans">WATER DEPTH</span>
            <span class="text-base font-bold text-red-600 block mt-0.5">${inc.waterDepthM} m</span>
          </div>
          <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span class="text-[10px] text-slate-500 block font-sans">TRAPPED CIVILIANS</span>
            <span class="text-base font-bold text-navy-900 block mt-0.5">${inc.trappedCivilians || 2}</span>
          </div>
          <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span class="text-[10px] text-slate-500 block font-sans">STATUS</span>
            <span class="text-xs font-bold text-amber-700 block mt-1">${inc.status}</span>
          </div>
        </div>

        <!-- Incident Provenance & Data Governance -->
        <div class="ui-card p-3.5 space-y-2 text-xs">
          <div class="flex items-center justify-between border-b border-app-border pb-1.5">
            <span class="font-bold text-navy-900 uppercase text-[11px]">Provenance & Audit Verification</span>
            <span class="px-1.5 py-0.2 rounded bg-teal-50 text-teal-800 border border-teal-200 font-mono text-[9px]">OFFICIAL SOURCE</span>
          </div>
          <div class="space-y-1 text-slate-600 text-[11px]">
            <div><strong>Reporting Agency:</strong> MCGM Disaster Control Room (Annexure IV Spot)</div>
            <div><strong>Confidence Rating:</strong> HIGH (Confirmed by telemetry & field observer)</div>
            <div><strong>Spatial Datum:</strong> WGS84 &bull; Elevation Datum: Mean Sea Level (+3.2m)</div>
          </div>
        </div>

        <!-- Dispatch Actions -->
        <div class="ui-card p-4 space-y-3">
          <h3 class="text-xs font-bold text-navy-900 uppercase tracking-wider">
            Dispatch Resource Allocation
          </h3>

          <div>
            <label class="text-[11px] text-slate-500 font-medium block mb-1">Assign Emergency Vehicle / Unit</label>
            <select 
              onchange="window.app.assignVehicle('${inc.id}', this.value)" 
              class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-navy-900 outline-none focus:border-teal-500 focus:bg-white"
            >
              <option value="">-- Select Available Unit --</option>
              ${availableVehicles.map(v => `
                <option value="${v.id}" ${inc.assignedVehicle === v.callsign ? 'selected' : ''}>
                  ${v.callsign} (${v.type} - ${v.groundClearanceCm}cm clearance)
                </option>
              `).join('')}
            </select>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-1">
            <button 
              onclick="window.app.updateIncidentStatus('${inc.id}', 'IN_PROGRESS')" 
              class="py-2 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-subtle transition-colors flex items-center justify-center gap-1"
            >
              <span class="material-symbols-outlined text-[15px]">send</span>
              <span>Deploy Unit</span>
            </button>

            <button 
              onclick="window.app.triggerBroadcastAlert()" 
              class="py-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-subtle transition-colors flex items-center justify-center gap-1"
            >
              <span class="material-symbols-outlined text-[15px]">podcasts</span>
              <span>Broadcast Warning</span>
            </button>
          </div>
        </div>

        <!-- Incident Timeline Log -->
        <div class="ui-card p-4 space-y-2.5">
          <span class="text-xs font-bold text-navy-900 uppercase tracking-wider block border-b border-app-border pb-1.5">
            Operational Timeline
          </span>
          <div class="space-y-2 text-xs font-sans">
            <div class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 flex-shrink-0"></span>
              <div>
                <span class="font-mono text-[10px] text-slate-400">17:45 IST</span>
                <p class="text-slate-700">Dadar TT stormwater flow sensor recorded initial 45cm runoff surge.</p>
              </div>
            </div>
            <div class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0"></span>
              <div>
                <span class="font-mono text-[10px] text-slate-400">18:05 IST</span>
                <p class="text-slate-700">Crest exceeded 85cm. Dr. Ambedkar arterial closed to civilian and low-chassis traffic.</p>
              </div>
            </div>
            <div class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 flex-shrink-0"></span>
              <div>
                <span class="font-mono text-[10px] text-slate-400">18:12 IST</span>
                <p class="text-slate-700">AI Synthesized Lalbaug Flyover bypass calculated; awaiting dispatcher clearance.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  `;
}
