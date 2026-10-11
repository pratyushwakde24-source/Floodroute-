// Live Network & Tactical Route Screen with 3D Digital City & Amazon Bedrock AI Integration
import { store } from '../state/store.js';
import { RoutingEngine } from '../services/routingService.js';
import { formatIST } from '../models/provenance.js';

export function renderLiveNetworkView() {
  const state = store.getState();
  const city = store.getSelectedCity();
  const echo7 = state.vehicles.find(v => v.id === 'VEH-07');
  const step = state.scenario.step;
  const isSim = state.dataMode === 'SIMULATION';
  const isDiorama = state.mapLayer === 'diorama';
  const aiExplanation = state.latestBedrockExplanation || {};

  // Calculate route with real road network geometry
  const routeResult = RoutingEngine.calculateRoute(city, {
    vehicleClearanceCm: echo7.groundClearanceCm,
    isSimStep2Plus: isSim && step >= 2,
  });

  const activeCorridor = routeResult.activeCorridor;
  const primaryCorridor = routeResult.primaryCorridor;
  const bypassCorridor = routeResult.bypassCorridor;

  return `
    <div class="flex-1 flex flex-col lg:flex-row h-full min-h-[calc(100vh-7rem)] overflow-hidden bg-app-bg relative">
      
      <!-- LEFT / CENTER: Interactive 3D City Diorama & Tactical GIS Canvas -->
      <div class="relative flex-1 min-h-[460px] lg:min-h-full overflow-hidden bg-slate-950">
        
        <!-- 3D Digital City Diorama View Container -->
        <div id="liveNetwork3DCanvas" class="absolute inset-0 w-full h-full z-10 ${isDiorama ? 'block' : 'hidden'}">
          <!-- Mounts City3DScene instance -->
        </div>

        <!-- 2D Tactical Leaflet GIS Map Container -->
        <div id="liveNetworkMapCanvas" class="absolute inset-0 w-full h-full z-0 ${!isDiorama ? 'block' : 'hidden'}">
          <!-- Mounts Leaflet TacticalMap instance -->
        </div>

        <!-- Floating Origin & Destination Waypoint HUD (Top Left) -->
        <div class="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-auto">
          <div class="bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-sans text-slate-800 flex items-center gap-2 shadow-card">
            <span class="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-semibold block leading-none">DISPATCH ORIGIN</span>
              <span class="font-bold text-navy-900">${city.defaultOrigin.name}</span>
            </div>
          </div>

          <div class="bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-sans text-slate-800 flex items-center gap-2 shadow-card">
            <span class="w-2.5 h-2.5 rounded-full bg-navy-900"></span>
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-semibold block leading-none">TARGET DESTINATION</span>
              <span class="font-bold text-navy-900">${city.defaultDestination.name}</span>
            </div>
          </div>
        </div>

        <!-- Floating View Switcher & Map Controls (Bottom Left) -->
        <div class="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md p-1.5 rounded-lg border border-slate-200 shadow-card">
          <!-- View Layer Switcher -->
          <div class="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200">
            <button 
              onclick="window.app.setMapLayer('diorama')"
              class="px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all ${
                isDiorama ? 'bg-navy-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }"
            >
              <span class="material-symbols-outlined text-[14px]">view_in_ar</span>
              <span>3D Digital City</span>
            </button>
            <button 
              onclick="window.app.setMapLayer('vector')"
              class="px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all ${
                !isDiorama ? 'bg-navy-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }"
            >
              <span class="material-symbols-outlined text-[14px]">map</span>
              <span>2D Tactical GIS</span>
            </button>
          </div>

          <button 
            onclick="window.app.recenterMap()" 
            class="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <span class="material-symbols-outlined text-[15px] text-slate-500">my_location</span>
            <span>Recenter (${city.name})</span>
          </button>
          <span class="text-[11px] text-slate-500 px-2 border-l border-slate-200 font-mono">
            ${isSim ? 'SIMULATION OVERLAY' : 'LIVE SOURCED VECTORS'}
          </span>
        </div>

      </div>

      <!-- RIGHT: Tactical Telemetry, Bedrock AI Decisions & Corridor Detail Drawer -->
      <div class="w-full lg:w-[440px] bg-white border-l border-app-border p-5 overflow-y-auto space-y-4 flex-shrink-0 z-20 shadow-subtle">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-app-border pb-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full ${isSim && step === 2 ? 'bg-red-500 animate-pulse' : 'bg-teal-600'}"></span>
              <h2 class="text-sm font-bold text-navy-900">Tactical Corridor Telemetry</h2>
            </div>
            <span class="text-xs text-slate-500">${city.name} Emergency Relief Vector</span>
          </div>
          <span class="px-2 py-0.5 rounded text-[11px] font-semibold ${
            isSim && step === 2 ? 'bg-red-100 text-red-800' : 'bg-teal-100 text-teal-800'
          }">
            ${activeCorridor.name.split('[')[1]?.replace(']', '') || 'ACTIVE VECTOR'}
          </span>
        </div>

        <!-- AMAZON BEDROCK AI DECISION EXPLANATION CARD -->
        <div class="rounded-xl border ${
          aiExplanation.status === 'VERIFIED_BEDROCK' 
            ? 'bg-emerald-50/40 border-emerald-300' 
            : 'bg-amber-50/40 border-amber-300'
        } p-4 space-y-3 relative shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] ${
                aiExplanation.status === 'VERIFIED_BEDROCK' ? 'text-emerald-700' : 'text-amber-700'
              }">neurology</span>
              <span class="text-xs font-bold text-navy-900">Amazon Bedrock Decision AI</span>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
              aiExplanation.status === 'VERIFIED_BEDROCK'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                : 'bg-amber-100 text-amber-800 border-amber-200'
            }">
              ${aiExplanation.status === 'VERIFIED_BEDROCK' ? 'BEDROCK CONVERSE' : 'DETERMINISTIC FALLBACK'}
            </span>
          </div>

          <div class="space-y-2 text-xs">
            <div>
              <span class="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">SITUATION SUMMARY</span>
              <p class="text-slate-800 leading-relaxed font-sans mt-0.5">
                ${aiExplanation.summary || state.scenario.explanation}
              </p>
            </div>

            <div class="p-2.5 rounded-lg bg-white/80 border border-slate-200/80">
              <span class="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">PHYSICAL SAFETY REASON</span>
              <p class="text-slate-800 font-mono text-[11px] mt-0.5 leading-snug">
                ${aiExplanation.reason || 'Water level at Hindmata 85cm exceeds vehicle operating clearance (60cm).'}
              </p>
            </div>

            <div class="p-2.5 rounded-lg bg-teal-50/80 border border-teal-200">
              <span class="text-[10px] text-teal-800 uppercase font-bold tracking-wider block">VALIDATED ACTION</span>
              <p class="text-teal-900 font-sans text-xs mt-0.5 font-medium leading-snug">
                ${aiExplanation.recommendation || 'Divert to Lalbaug Elevated Viaduct bypass corridor.'}
              </p>
            </div>
          </div>

          <!-- Trade-off Summary Grid -->
          <div class="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-2 border-t border-slate-200/60">
            <div class="bg-white p-1.5 rounded border border-slate-200">
              <span class="text-[9px] text-slate-400 block font-sans">TIME IMPACT</span>
              <span class="font-bold text-navy-900 block mt-0.5">+3.7 mins</span>
            </div>
            <div class="bg-white p-1.5 rounded border border-slate-200">
              <span class="text-[9px] text-slate-400 block font-sans">SAFETY CONF.</span>
              <span class="font-bold text-teal-700 block mt-0.5">98.4%</span>
            </div>
            <div class="bg-white p-1.5 rounded border border-slate-200">
              <span class="text-[9px] text-slate-400 block font-sans">DECK GRADE</span>
              <span class="font-bold text-navy-900 block mt-0.5">+14.5m MSL</span>
            </div>
          </div>

          <!-- Emergency Simulation Trigger Controls -->
          <div class="pt-2 flex items-center gap-2">
            ${step < 2 ? `
              <button 
                onclick="window.app.triggerFloodBreach()" 
                class="flex-1 py-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-card flex items-center justify-center gap-1.5 transition-colors"
              >
                <span class="material-symbols-outlined text-[15px]">flood</span>
                <span>Simulate R-12 Flood Breach (85cm)</span>
              </button>
            ` : `
              <button 
                onclick="window.app.resetSimulationScenario()" 
                class="flex-1 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
              >
                <span class="material-symbols-outlined text-[15px]">restart_alt</span>
                <span>Reset Simulation</span>
              </button>
            `}
          </div>
        </div>

        <!-- Active Unit Card -->
        <div class="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-3">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-lg bg-navy-900 text-white flex items-center justify-center">
                <span class="material-symbols-outlined text-[20px]">directions_car</span>
              </div>
              <div>
                <div class="text-xs font-bold text-navy-900">${echo7.callsign}</div>
                <div class="text-[11px] text-slate-500 font-sans">${echo7.type}</div>
              </div>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              isSim && step === 2 ? 'bg-red-100 text-red-700' : 'bg-teal-100 text-teal-800'
            }">
              ${isSim && step === 2 ? 'REROUTE REQ' : echo7.status}
            </span>
          </div>

          <div class="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-2 border-t border-slate-200">
            <div class="bg-white p-2 rounded border border-slate-200">
              <span class="text-[10px] text-slate-400 block font-sans">CLEARANCE</span>
              <span class="font-bold text-navy-900 block mt-0.5">${echo7.groundClearanceCm} cm</span>
            </div>
            <div class="bg-white p-2 rounded border border-slate-200">
              <span class="text-[10px] text-slate-400 block font-sans">SPEED</span>
              <span class="font-bold text-navy-900 block mt-0.5">${echo7.speedKmh} km/h</span>
            </div>
            <div class="bg-white p-2 rounded border border-slate-200">
              <span class="text-[10px] text-slate-400 block font-sans">BATTERY/FUEL</span>
              <span class="font-bold text-teal-700 block mt-0.5">${echo7.batteryFuelPct}%</span>
            </div>
          </div>
        </div>

        <!-- Corridor Comparison Card -->
        <div class="ui-card p-4 space-y-3">
          <h3 class="text-xs font-bold text-navy-900 uppercase tracking-wider">
            Hydrological Transit Evaluation
          </h3>

          <!-- Primary Arterial -->
          <div class="p-3 rounded-lg border text-xs space-y-1.5 ${
            isSim && step >= 2 ? 'bg-red-50/50 border-red-200' : 'bg-teal-50/50 border-teal-200'
          }">
            <div class="flex items-center justify-between font-semibold">
              <span class="text-navy-900">1. ${primaryCorridor.name}</span>
              <span class="text-[10px] font-mono font-bold ${
                isSim && step >= 2 ? 'text-red-700' : 'text-teal-800'
              }">
                ${isSim && step >= 2 ? 'BLOCKED (85cm)' : 'PASSABLE (12cm)'}
              </span>
            </div>
            <div class="flex justify-between text-[11px] text-slate-600 font-mono">
              <span>Length: ${primaryCorridor.lengthKm} km</span>
              <span>ETA: ${primaryCorridor.estimatedMinutes} mins</span>
              <span>Elevation: ${primaryCorridor.deckElevationMsl}</span>
            </div>
          </div>

          <!-- Elevated Bypass Corridor -->
          <div class="p-3 rounded-lg border text-xs space-y-1.5 ${
            isSim && step >= 3 ? 'bg-teal-50/60 border-teal-500 shadow-sm' : 'bg-slate-50 border-slate-200'
          }">
            <div class="flex items-center justify-between font-semibold">
              <span class="text-navy-900">2. ${bypassCorridor.name}</span>
              <span class="text-[10px] font-mono font-bold text-teal-800">
                100% DRY ELEVATION
              </span>
            </div>
            <div class="flex justify-between text-[11px] text-slate-600 font-mono">
              <span>Length: ${bypassCorridor.lengthKm} km</span>
              <span>ETA: ${bypassCorridor.estimatedMinutes} mins</span>
              <span>Deck: ${bypassCorridor.deckElevationMsl}</span>
            </div>
          </div>

          <!-- Reroute Action Button if in simulation step 2 -->
          ${isSim && step === 2 ? `
            <div class="pt-2">
              <button 
                onclick="window.app.openRerouteModal()" 
                class="w-full py-2.5 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-card flex items-center justify-center gap-1.5 transition-colors"
              >
                <span class="material-symbols-outlined text-[16px]">alt_route</span>
                <span>Deploy Lalbaug Viaduct Reroute</span>
              </button>
            </div>
          ` : ''}
        </div>

        <!-- Waypoint Segment Breakdown -->
        <div class="ui-card p-4 space-y-2.5">
          <div class="flex items-center justify-between border-b border-app-border pb-2">
            <span class="text-xs font-bold text-navy-900">Waypoint Progression</span>
            <span class="text-[10px] text-slate-400 font-mono">4 Sectors</span>
          </div>

          <div class="space-y-2 text-xs">
            <div class="flex items-start gap-2.5">
              <div class="w-4 h-4 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center font-bold mt-0.5">1</div>
              <div>
                <div class="font-semibold text-navy-900">BKC Connector Arterial</div>
                <div class="text-[11px] text-slate-500">Pavement +6.2m MSL &bull; 0cm water &bull; Clear</div>
              </div>
            </div>

            <div class="flex items-start gap-2.5">
              <div class="w-4 h-4 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center font-bold mt-0.5">2</div>
              <div>
                <div class="font-semibold text-navy-900">Sion - King's Circle Basin</div>
                <div class="text-[11px] text-slate-500">Pavement +4.5m MSL &bull; Flow sensor nominal</div>
              </div>
            </div>

            <div class="flex items-start gap-2.5">
              <div class="w-4 h-4 rounded-full ${isSim && step >= 2 ? 'bg-red-600' : 'bg-teal-600'} text-white text-[10px] flex items-center justify-center font-bold mt-0.5">3</div>
              <div>
                <div class="font-semibold text-navy-900">Hindmata / Dadar TT Basin</div>
                <div class="text-[11px] ${isSim && step >= 2 ? 'text-red-600 font-bold' : 'text-slate-500'}">
                  ${isSim && step >= 2 ? '85cm watercrest (Exceeds clearance). Viaduct ramp diversion.' : 'Pavement +3.2m MSL &bull; 12cm water'}
                </div>
              </div>
            </div>

            <div class="flex items-start gap-2.5">
              <div class="w-4 h-4 rounded-full ${step >= 4 ? 'bg-teal-600' : 'bg-slate-300'} text-white text-[10px] flex items-center justify-center font-bold mt-0.5">4</div>
              <div>
                <div class="font-semibold text-navy-900">KEM Hospital Trauma Concourse</div>
                <div class="text-[11px] text-slate-500">High ground destination &bull; Critical intake ready</div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  `;
}
