// Vehicle Fleet & Relief Assets Screen
import { store } from '../state/store.js';

export function renderVehiclesView() {
  const state = store.getState();
  const vehicles = state.vehicles;

  return `
    <div class="p-4 lg:p-6 space-y-5 max-w-[1600px] w-full mx-auto">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-app-border pb-4">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-xl font-bold text-navy-900 tracking-tight">Vehicle Fleet & Relief Units</h1>
            <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-100 text-teal-800 border border-teal-200">
              ${vehicles.length} Active Assets
            </span>
          </div>
          <p class="text-xs text-slate-500 font-sans mt-0.5">
            High-Clearance Heavy Trucks, Amphibious Rescue Craft & Logistics Shuttles
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button 
            onclick="window.app.navigate('responder-hud')" 
            class="px-4 py-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-subtle flex items-center gap-1.5 transition-colors"
          >
            <span class="material-symbols-outlined text-[16px]">smartphone</span>
            <span>Open Field Responder HUD</span>
          </button>
        </div>
      </div>

      <!-- Fleet Metric Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div class="ui-card p-4">
          <span class="text-xs text-slate-500 font-medium block">Active Deployed</span>
          <span class="text-2xl font-bold text-teal-700 font-sans mt-1 block">3 Units</span>
          <span class="text-[11px] text-slate-500 font-mono block mt-1">High Water Rescue Operations</span>
        </div>

        <div class="ui-card p-4">
          <span class="text-xs text-slate-500 font-medium block">Depot Reserve</span>
          <span class="text-2xl font-bold text-navy-900 font-sans mt-1 block">1 Unit</span>
          <span class="text-[11px] text-slate-500 font-mono block mt-1">Potable Water Tender</span>
        </div>

        <div class="ui-card p-4">
          <span class="text-xs text-slate-500 font-medium block">Fleet Fuel / Battery</span>
          <span class="text-2xl font-bold text-navy-900 font-sans mt-1 block">87.8%</span>
          <span class="text-[11px] text-teal-700 font-medium block mt-1">Microgrid Staged</span>
        </div>

        <div class="ui-card p-4">
          <span class="text-xs text-slate-500 font-medium block">Water Clearance Limit</span>
          <span class="text-2xl font-bold text-navy-900 font-sans mt-1 block">60 - 250 cm</span>
          <span class="text-[11px] text-slate-500 font-mono block mt-1">Specialized Chassis</span>
        </div>
      </div>

      <!-- Vehicles Card Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${vehicles.map(v => {
          const isEcho7 = v.id === 'VEH-07';
          return `
            <div class="ui-card p-4 space-y-3.5 hover:shadow-card transition-shadow">
              
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-10 h-10 rounded-xl bg-navy-900 text-white flex items-center justify-center">
                    <span class="material-symbols-outlined text-[22px]">
                      ${v.type.includes('Amphibious') ? 'sailing' : 'local_shipping'}
                    </span>
                  </div>
                  <div>
                    <h3 class="font-bold text-sm text-navy-900">${v.callsign}</h3>
                    <span class="text-xs text-slate-500 font-sans block">${v.type}</span>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  v.status === 'DEPLOYED' ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-700'
                }">
                  ${v.status}
                </span>
              </div>

              <!-- Vehicle Specs -->
              <div class="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-2 border-t border-slate-100">
                <div class="bg-slate-50 p-2 rounded border border-slate-200">
                  <span class="text-[10px] text-slate-400 block font-sans">CLEARANCE</span>
                  <span class="font-bold text-navy-900 block mt-0.5">${v.groundClearanceCm} cm</span>
                </div>
                <div class="bg-slate-50 p-2 rounded border border-slate-200">
                  <span class="text-[10px] text-slate-400 block font-sans">CAPACITY</span>
                  <span class="font-bold text-navy-900 block mt-0.5">${v.capacityPersonnel || 6} crew</span>
                </div>
                <div class="bg-slate-50 p-2 rounded border border-slate-200">
                  <span class="text-[10px] text-slate-400 block font-sans">ENERGY</span>
                  <span class="font-bold text-teal-700 block mt-0.5">${v.batteryFuelPct}%</span>
                </div>
              </div>

              <div class="text-xs text-slate-600 space-y-1">
                <div><strong>Assigned Commander:</strong> ${v.crewCaptain}</div>
                <div><strong>Current Mission:</strong> ${v.assignedMission || 'Stationed at Depot'}</div>
              </div>

              <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button 
                  onclick="window.app.inspectVehicle('${v.id}')" 
                  class="text-xs text-teal-700 font-semibold hover:underline flex items-center gap-1"
                >
                  <span class="material-symbols-outlined text-[15px]">alt_route</span>
                  <span>Track on Map</span>
                </button>
                <button 
                  onclick="window.app.navigate('responder-hud')" 
                  class="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                >
                  Cockpit HUD
                </button>
              </div>

            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;
}
