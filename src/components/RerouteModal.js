// Dispatcher AI Reroute Approval Modal (Mumbai Pilot Scenario)
import { store } from '../state/store.js';

export function renderRerouteModal() {
  const state = store.getState();
  if (!state.showRerouteModal && state.scenario.step !== 2) return '';

  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div class="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 shadow-modal overflow-hidden relative animate-slideDown">
        
        <!-- Header -->
        <div class="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <span class="material-symbols-outlined text-[24px]">alt_route</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold text-navy-900">Urgent Dispatcher Route Authorization Required</h3>
                <span class="px-2 py-0.5 rounded bg-red-100 text-red-800 font-mono text-[10px] font-bold">ROUTE SEVERED</span>
              </div>
              <p class="text-xs text-slate-500 font-mono mt-0.5">Asset: Rescue Echo-7 &bull; Cargo: Critical Pediatric Medicine &bull; Destination: KEM Hospital (Parel)</p>
            </div>
          </div>
          <button onclick="window.app.closeRerouteModal()" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <!-- Incident Hazard Context -->
        <div class="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-4 flex items-start gap-3">
          <span class="material-symbols-outlined text-red-600 text-[22px] flex-shrink-0 mt-0.5">warning</span>
          <div class="text-xs leading-relaxed text-slate-800">
            <strong class="text-red-700">CRITICAL HAZARD:</strong> Dr. Ambedkar Road at Hindmata Junction is completely inundated with water depth recorded at <strong class="font-mono text-red-700">85 cm</strong>.
            Vehicle Echo-7 maximum safe water clearance is <strong class="font-mono text-slate-900">60 cm</strong> (Ground clearance deficit: <strong class="font-mono text-red-700">+25 cm</strong>).
            Continuing on Route Alpha will submerge the vehicle chassis, stall the engine, and destroy the pediatric cold-chain cargo.
          </div>
        </div>

        <!-- Route Comparison Matrix -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          
          <!-- Old Severed Route Alpha -->
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-mono font-bold text-slate-500">ORIGINAL ROUTE ALPHA</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold">BLOCKED / IMPASSABLE</span>
            </div>
            <div class="text-sm font-semibold text-navy-900 mb-3">Dr. Ambedkar Road Direct Arterial</div>
            <div class="space-y-2 text-xs font-mono">
              <div class="flex justify-between py-1 border-b border-slate-200">
                <span class="text-slate-500">Nominal Time:</span>
                <span class="text-slate-400 line-through">13.8 mins</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-200">
                <span class="text-slate-500">Water Depth:</span>
                <span class="text-red-600 font-bold">85 cm (Breached)</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-200">
                <span class="text-slate-500">Ground Elevation:</span>
                <span class="text-slate-700">+3.2m MSL (Low Basin)</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-slate-500">Safety Status:</span>
                <span class="text-red-600 font-bold">CRITICAL FAILURE</span>
              </div>
            </div>
          </div>

          <!-- Recommended AI Elevated Bypass -->
          <div class="bg-teal-50/50 border-2 border-teal-500 rounded-xl p-4 relative shadow-sm">
            <div class="absolute -top-2.5 right-4 bg-teal-600 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              RECOMMENDED AI VECTOR
            </div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-mono font-bold text-teal-800">SYNTHESIZED BYPASS</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">100% DRY ELEVATION</span>
            </div>
            <div class="text-sm font-semibold text-navy-900 mb-3">Lalbaug Elevated Viaduct Flyover</div>
            <div class="space-y-2 text-xs font-mono">
              <div class="flex justify-between py-1 border-b border-teal-100">
                <span class="text-slate-500">Travel Time:</span>
                <span class="text-teal-900 font-bold">17.5 mins (+3.7 min detour)</span>
              </div>
              <div class="flex justify-between py-1 border-b border-teal-100">
                <span class="text-slate-500">Water Depth:</span>
                <span class="text-teal-700 font-bold">0 cm (Elevated Deck)</span>
              </div>
              <div class="flex justify-between py-1 border-b border-teal-100">
                <span class="text-slate-500">Deck Elevation:</span>
                <span class="text-teal-900 font-bold">+14.5m MSL (+11.3m dry margin)</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-slate-500">Safety Status:</span>
                <span class="text-teal-700 font-bold">NOMINAL & VERIFIED</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Human Dispatcher Action Controls -->
        <div class="flex items-center justify-between pt-3 border-t border-slate-100">
          <button 
            type="button" 
            onclick="window.app.closeRerouteModal()" 
            class="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:text-navy-900 hover:bg-slate-50 text-xs font-medium transition-colors"
          >
            Defer / Keep Holding
          </button>

          <button 
            type="button" 
            onclick="window.app.approveReroute()" 
            class="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-card flex items-center gap-2 transition-all hover:scale-[1.01]"
          >
            <span class="material-symbols-outlined text-[18px]">verified</span>
            <span>Authorize Elevated Viaduct Vector (Unit Echo-7)</span>
          </button>
        </div>

      </div>
    </div>
  `;
}
