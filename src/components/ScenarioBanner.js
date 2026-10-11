// Interactive Flood Scenario Controller & Mode Banner
// Clearly distinguishes between Live Official Sourced Data and Simulation Demo Mode
import { store } from '../state/store.js';

export function renderScenarioBanner() {
  const state = store.getState();
  const city = store.getSelectedCity();
  const step = state.scenario.step;
  const isSim = state.dataMode === 'SIMULATION';

  if (!isSim) {
    return `
      <div class="w-full bg-slate-50 border-b border-slate-200 py-2 px-4 lg:px-6 shadow-subtle flex-shrink-0">
        <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
          
          <div class="flex items-center gap-2.5">
            <span class="flex h-2.5 w-2.5 relative">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-600"></span>
            </span>
            <div class="text-slate-700">
              <span class="font-semibold text-navy-900">Authoritative GIS Mode:</span>
              <span class="text-teal-700 font-medium ml-1">${city.name} (${city.state})</span>
              <span class="text-slate-500 text-[11px] ml-2 hidden md:inline">
                &bull; Active GIS boundary, road elevation network, ${city.staticRiskSpots.length} statutory risk spots, and CWC hydrometry.
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2 self-end sm:self-center">
            <button 
              onclick="window.app.toggleLegendDrawer()" 
              class="px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1 border border-slate-200 transition-colors shadow-subtle"
            >
              <span class="material-symbols-outlined text-[14px] text-teal-600">verified</span>
              <span>Data Provenance</span>
            </button>
            <button 
              onclick="window.app.setDataMode('SIMULATION')" 
              class="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium flex items-center gap-1.5 shadow-subtle transition-colors"
            >
              <span class="material-symbols-outlined text-[15px]">play_circle</span>
              <span>Launch Mumbai Sim</span>
            </button>
          </div>

        </div>
      </div>
    `;
  }

  const steps = [
    { step: 0, title: '1. Baseline Corridor', badge: 'Route Alpha (12cm)', desc: 'Unit Echo-7 monitoring Dr. Ambedkar Road arterial towards KEM Hospital.' },
    { step: 1, title: '2. Runoff Surge', badge: 'Hindmata 45cm', desc: 'MCGM Dadar flow sensor telemetry indicates rapid storm runoff accumulation.' },
    { step: 2, title: '3. Critical Breach', badge: '85cm - IMPASSABLE', desc: 'Water depth exceeds Echo-7 60cm clearance. Route Alpha severed. Alternative bypass computed.' },
    { step: 3, title: '4. Viaduct Reroute', badge: 'Lalbaug Viaduct (+14.5m)', desc: 'Dispatcher authorizes AI bypass onto elevated flyover deck.' },
    { step: 4, title: '5. Mission Complete', badge: 'Arrival at KEM', desc: 'Pediatric medication delivered without vehicle submersion or water damage.' }
  ];

  const currentStep = steps[step] || steps[0];

  return `
    <div class="w-full bg-amber-50/90 border-b border-amber-200 py-2.5 px-4 lg:px-6 shadow-subtle flex-shrink-0">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        
        <!-- Step Info & Context -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              step === 2 ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-600 text-white'
            }">
              SIMULATION SCENARIO
            </span>
            <span class="font-bold text-navy-900">${currentStep.title}:</span>
          </div>
          <span class="text-slate-700 hidden lg:inline">${currentStep.desc}</span>
        </div>

        <!-- Scenario Stepper Controls -->
        <div class="flex items-center gap-1.5 self-end md:self-center flex-wrap">
          
          <button 
            onclick="window.app.setScenarioStep(Math.max(0, ${step} - 1))" 
            class="px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-amber-200 transition-colors disabled:opacity-50"
            ${step === 0 ? 'disabled' : ''}
            title="Previous Step"
          >
            <span class="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>

          <!-- Step Indicators -->
          <div class="flex items-center gap-1 bg-white/80 px-2 py-1 rounded border border-amber-200">
            ${steps.map((s, idx) => `
              <button 
                onclick="window.app.setScenarioStep(${idx})"
                class="w-6 h-6 rounded text-[11px] font-bold flex items-center justify-center transition-all ${
                  idx === step 
                    ? (step === 2 ? 'bg-red-600 text-white' : 'bg-navy-900 text-white')
                    : (idx < step ? 'bg-teal-100 text-teal-800' : 'text-slate-400 hover:bg-slate-100')
                }"
                title="${s.title}"
              >
                ${idx + 1}
              </button>
            `).join('')}
          </div>

          <button 
            onclick="window.app.setScenarioStep(Math.min(4, ${step} + 1))" 
            class="px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-amber-200 transition-colors disabled:opacity-50"
            ${step === 4 ? 'disabled' : ''}
            title="Next Step"
          >
            <span class="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>

          ${step === 2 ? `
            <button 
              onclick="window.app.openRerouteModal()" 
              class="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-1 shadow-subtle animate-bounce"
            >
              <span class="material-symbols-outlined text-[15px]">alt_route</span>
              <span>Authorize Reroute</span>
            </button>
          ` : ''}

          <button 
            onclick="window.app.resetScenario()" 
            class="px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-600 border border-amber-200 text-xs ml-1"
            title="Reset Scenario to Step 1"
          >
            <span class="material-symbols-outlined text-[15px]">restart_alt</span>
          </button>

          <button 
            onclick="window.app.setDataMode('LIVE_OFFICIAL')" 
            class="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs ml-1"
            title="Exit Simulation"
          >
            <span>Exit Sim</span>
          </button>

        </div>

      </div>
    </div>
  `;
}
