// Flood Simulation & Scenario Replay Screen (Mumbai Pilot Corridor)
import { store } from '../state/store.js';
import { formatIST } from '../models/provenance.js';

export function renderSimulationView() {
  const state = store.getState();
  const city = store.getSelectedCity();
  const step = state.scenario.step;
  const echo7 = state.vehicles.find(v => v.id === 'VEH-07');
  const isSim = state.dataMode === 'SIMULATION';

  const timelineEvents = [
    {
      time: 'T+00:00',
      title: 'Baseline Route Alpha Transit Initialized',
      desc: 'Unit Echo-7 carrying pediatric critical medicine departs BKC Depot towards KEM Hospital via Dr. Ambedkar Rd. Water level at 12cm is safely passable.',
      status: 'NORMAL',
      stepIndex: 0
    },
    {
      time: 'T+00:12',
      title: 'Hindmata Junction Storm Runoff Surge Warning',
      desc: 'MCGM Dadar flow sensor reports rapid rainfall runoff. Water reaches 45cm at Hindmata / Dadar TT junction. Clearance margin narrows to 15cm.',
      status: 'WARNING',
      stepIndex: 1
    },
    {
      time: 'T+00:20',
      title: 'Critical Inundation Breach & Route Alpha Severed',
      desc: 'Water level reaches 85cm crest at Hindmata, exceeding Echo-7 60cm clearance. Route Alpha invalidated. AI generates Lalbaug Elevated Viaduct bypass.',
      status: 'CRITICAL',
      stepIndex: 2
    },
    {
      time: 'T+00:23',
      title: 'Dispatcher Authorized Reroute onto Elevated Viaduct',
      desc: 'Lead Dispatcher authorizes AI alternative vector. Unit Echo-7 climbs onto +14.5m elevated flyover, safely clearing ground water.',
      status: 'REROUTED',
      stepIndex: 3
    },
    {
      time: 'T+00:38',
      title: 'Mission Accomplished: Arrival at KEM Hospital',
      desc: 'Unit Echo-7 delivers temperature-controlled medication to KEM Trauma Concourse without submersion damage or engine stall.',
      status: 'SUCCESS',
      stepIndex: 4
    }
  ];

  return `
    <div class="p-4 lg:p-6 space-y-5 max-w-[1600px] w-full mx-auto">
      
      <!-- Top Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-app-border pb-4">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-xl font-bold text-navy-900 tracking-tight">Flood Simulation Laboratory & Replay</h1>
            <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
              MUMBAI PILOT SCENARIO
            </span>
          </div>
          <p class="text-xs text-slate-500 font-sans mt-0.5">
            Deterministic Evaluation: Unit Echo-7 Critical Pediatric Medicine Transit
          </p>
        </div>

        <div class="flex items-center gap-2">
          ${!isSim ? `
            <button 
              onclick="window.app.setDataMode('SIMULATION')" 
              class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-subtle flex items-center gap-1.5 transition-colors"
            >
              <span class="material-symbols-outlined text-[16px]">play_arrow</span>
              <span>Engage Simulation Mode</span>
            </button>
          ` : `
            <button 
              onclick="window.app.setDataMode('LIVE_OFFICIAL')" 
              class="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            >
              Exit to Live Mode
            </button>
          `}
        </div>
      </div>

      <!-- Isolation Governance Banner -->
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
        <span class="material-symbols-outlined text-amber-600 text-[20px] flex-shrink-0 mt-0.5">shield</span>
        <div>
          <strong class="font-semibold text-amber-900">SIMULATION ISOLATION GUARANTEE:</strong>
          <span class="text-amber-800 ml-1">
            This scenario demonstrates deterministic routing logic during acute urban inundation. Simulated breaches, water stages, and temporary road blocks are quarantined and never committed to official municipal observation logs.
          </span>
        </div>
      </div>

      <!-- Scenario Timeline Stepper & Controls -->
      <div class="ui-card p-5 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-app-border pb-3">
          <div>
            <span class="text-xs font-bold text-navy-900 uppercase tracking-wider block">
              Scenario Progression Timeline (Step ${step + 1} of 5)
            </span>
            <span class="text-xs text-slate-500 font-sans">
              ${timelineEvents[step].title}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button 
              onclick="window.app.setScenarioStep(Math.max(0, ${step} - 1))" 
              class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
              ${step === 0 ? 'disabled' : ''}
            >
              <span class="material-symbols-outlined text-[15px]">chevron_left</span>
              <span>Previous</span>
            </button>

            <button 
              onclick="window.app.setScenarioStep(Math.min(4, ${step} + 1))" 
              class="px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-subtle transition-colors disabled:opacity-50 flex items-center gap-1"
              ${step === 4 ? 'disabled' : ''}
            >
              <span>Advance Step</span>
              <span class="material-symbols-outlined text-[15px]">chevron_right</span>
            </button>

            <button 
              onclick="window.app.resetScenario()" 
              class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors ml-1"
              title="Reset Scenario"
            >
              <span class="material-symbols-outlined text-[18px]">restart_alt</span>
            </button>
          </div>
        </div>

        <!-- Visual Step Cards -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
          ${timelineEvents.map((evt, idx) => {
            const isCurrent = idx === step;
            const isPast = idx < step;
            return `
              <button 
                onclick="window.app.setScenarioStep(${idx})" 
                class="text-left p-3 rounded-xl border transition-all ${
                  isCurrent 
                    ? 'bg-navy-900 text-white border-navy-900 shadow-card' 
                    : (isPast 
                      ? 'bg-teal-50/60 border-teal-200 text-slate-800 hover:bg-teal-50' 
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100')
                }"
              >
                <div class="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span class="${isCurrent ? 'text-teal-300' : 'text-slate-400'} font-bold">${evt.time}</span>
                  <span class="w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    isCurrent ? 'bg-white text-navy-900' : (isPast ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600')
                  }">
                    ${idx + 1}
                  </span>
                </div>
                <div class="font-bold text-xs truncate ${isCurrent ? 'text-white' : 'text-navy-900'}">${evt.title.split(':')[0]}</div>
                <div class="text-[11px] truncate mt-0.5 ${isCurrent ? 'text-slate-300' : 'text-slate-500'}">${evt.status}</div>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Detailed Step Information & Decision Panel -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        <!-- Step Narration (2 Cols) -->
        <div class="lg:col-span-2 ui-card p-5 space-y-4">
          <div class="flex items-center justify-between border-b border-app-border pb-3">
            <h3 class="font-bold text-sm text-navy-900">
              ${timelineEvents[step].title}
            </h3>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              step === 2 ? 'bg-red-100 text-red-700' : (step === 3 || step === 4 ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-700')
            }">
              ${timelineEvents[step].status}
            </span>
          </div>

          <p class="text-xs text-slate-700 leading-relaxed">
            ${timelineEvents[step].desc}
          </p>

          ${step === 2 ? `
            <div class="p-3.5 bg-red-50 border border-red-200 rounded-xl space-y-2">
              <div class="flex items-center gap-1.5 font-bold text-xs text-red-700">
                <span class="material-symbols-outlined text-[18px]">warning</span>
                <span>Critical Decision Gate: Dispatcher Clearance Required</span>
              </div>
              <p class="text-xs text-red-900 leading-relaxed">
                Unit Echo-7 maximum ground clearance is 60cm. Measured water crest at Hindmata is 85cm (+25cm deficit). Continued forward progress on Dr. Ambedkar Road will result in engine stall.
              </p>
              <div class="pt-1">
                <button 
                  onclick="window.app.openRerouteModal()" 
                  class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-card flex items-center gap-1.5 transition-colors"
                >
                  <span class="material-symbols-outlined text-[16px]">alt_route</span>
                  <span>Open Authorization Modal</span>
                </button>
              </div>
            </div>
          ` : ''}

          <div class="pt-3 border-t border-app-border flex items-center justify-between text-xs text-slate-500">
            <span>Simulated Telemetry Cycle: 60 sec intervals</span>
            <button onclick="window.app.navigate('live-network')" class="text-teal-700 font-semibold hover:underline flex items-center gap-1">
              <span>View On Tactical Map</span>
              <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>

        <!-- Vehicle Telemetry Status (1 Col) -->
        <div class="ui-card p-5 space-y-4">
          <h3 class="font-bold text-xs text-navy-900 uppercase tracking-wider border-b border-app-border pb-2.5">
            Unit Echo-7 Real-Time State
          </h3>

          <div class="space-y-3 text-xs font-mono">
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-500 font-sans">Current Waypoint:</span>
              <span class="font-bold text-navy-900">
                ${step === 0 ? 'BKC Depot' : (step === 1 ? 'King\'s Circle' : (step === 2 ? 'Dadar TT (Halted)' : (step === 3 ? 'Lalbaug Viaduct' : 'KEM Concourse')))}
              </span>
            </div>

            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-500 font-sans">Water Sensor Reading:</span>
              <span class="font-bold ${step >= 2 ? 'text-red-600' : 'text-teal-700'}">
                ${step === 0 ? '12 cm' : (step === 1 ? '45 cm' : (step === 2 ? '85 cm (Critical)' : '0 cm (Elevated)'))}
              </span>
            </div>

            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-500 font-sans">Chassis Clearance Margin:</span>
              <span class="font-bold ${step === 2 ? 'text-red-600' : 'text-teal-700'}">
                ${step === 0 ? '+48 cm Safe' : (step === 1 ? '+15 cm Caution' : (step === 2 ? '-25 cm DEFICIT' : '+14.5m Safe Deck'))}
              </span>
            </div>

            <div class="flex justify-between py-1.5">
              <span class="text-slate-500 font-sans">Speed & Telemetry:</span>
              <span class="font-bold text-navy-900">
                ${step === 2 ? '0 km/h (Halted)' : (step === 3 ? '52 km/h' : '44 km/h')}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  `;
}
