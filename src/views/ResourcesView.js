// Community Relief & Shelter Resources Screen
import { store } from '../state/store.js';

export function renderResourcesView() {
  const state = store.getState();
  const shelters = state.facilities.filter(f => f.type === 'PUBLIC_SHELTER');
  const depot = state.facilities.find(f => f.type === 'LOGISTICS_HUB') || state.facilities[2];
  const requests = state.communityRequests;

  return `
    <div class="p-4 lg:p-6 space-y-5 max-w-[1600px] w-full mx-auto">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-app-border pb-4">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-xl font-bold text-navy-900 tracking-tight">Community Relief & Shelters</h1>
            <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              Safe Ground Facilities
            </span>
          </div>
          <p class="text-xs text-slate-500 font-sans mt-0.5">
            Designated High-Elevation Shelters, Potable Water Stockpiles & Citizen Needs Triage
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button 
            onclick="window.app.navigate('public-directory')" 
            class="px-4 py-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-subtle flex items-center gap-1.5 transition-colors"
          >
            <span class="material-symbols-outlined text-[16px]">public</span>
            <span>Open Public Citizen Portal</span>
          </button>
        </div>
      </div>

      <!-- Designated Safe Ground Shelters -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-xs font-bold text-navy-900 uppercase tracking-wider">
            Designated High-Ground Shelters
          </h2>
          <span class="text-xs text-slate-500 font-mono">${shelters.length} Facilities Operational</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${shelters.map(s => {
            const occPct = Math.round((s.capacityOccupied / s.capacityTotal) * 100);
            return `
              <div class="ui-card p-4 space-y-3 hover:shadow-card transition-shadow">
                <div class="flex items-start justify-between">
                  <div>
                    <h3 class="font-bold text-sm text-navy-900">${s.name}</h3>
                    <div class="text-xs text-slate-500 font-sans mt-0.5">
                      ${s.location} &bull; <strong class="text-teal-700 font-mono">+${s.elevationM}m MSL Elevation</strong>
                    </div>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-100 text-teal-800">
                    OPEN &bull; ACCEPTING
                  </span>
                </div>

                <!-- Occupancy Bar -->
                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-slate-500 font-medium">Occupancy Capacity:</span>
                    <span class="font-bold text-navy-900 font-mono">${s.capacityOccupied} / ${s.capacityTotal} (${occPct}%)</span>
                  </div>
                  <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div class="bg-teal-600 h-full rounded-full transition-all" style="width: ${occPct}%"></div>
                  </div>
                </div>

                <!-- Amenities -->
                <div class="flex items-center gap-2 text-[11px] text-slate-600 flex-wrap pt-2 border-t border-slate-100">
                  <span class="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    <span class="material-symbols-outlined text-[14px] text-teal-600">water_drop</span>
                    <span>Potable Water</span>
                  </span>
                  <span class="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    <span class="material-symbols-outlined text-[14px] text-blue-600">medical_services</span>
                    <span>First Aid Post</span>
                  </span>
                  <span class="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    <span class="material-symbols-outlined text-[14px] text-amber-500">bolt</span>
                    <span>Backup Microgrid</span>
                  </span>
                </div>

                <div class="pt-1 flex justify-end">
                  <button 
                    onclick="window.app.getDirections('${s.id}')" 
                    class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-navy-900 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <span>Route Safe Corridor to Shelter</span>
                    <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Citizen SOS Assistance Queue -->
      <div class="ui-card p-4 space-y-3">
        <div class="flex items-center justify-between border-b border-app-border pb-2.5">
          <div>
            <h3 class="text-xs font-bold text-navy-900 uppercase tracking-wider">
              Citizen Emergency Needs Queue
            </h3>
            <p class="text-[11px] text-slate-500 font-sans mt-0.5">
              Live SOS Submissions verified through Citizen Emergency Portal
            </p>
          </div>
          <span class="text-xs font-mono font-bold text-slate-600">${requests.length} Requests Active</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs ui-table">
            <thead>
              <tr>
                <th class="py-2.5 px-3">Citizen Contact</th>
                <th class="py-2.5 px-3">Location / Ward</th>
                <th class="py-2.5 px-3">Headcount</th>
                <th class="py-2.5 px-3">Critical Needs</th>
                <th class="py-2.5 px-3">Urgency</th>
                <th class="py-2.5 px-3 text-right">Dispatch Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${requests.map(req => `
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="py-2.5 px-3 font-semibold text-navy-900">
                    <div>${req.citizenName}</div>
                    <div class="text-[10px] text-slate-400 font-mono">${req.phone}</div>
                  </td>
                  <td class="py-2.5 px-3 text-slate-700">${req.neighborhood}</td>
                  <td class="py-2.5 px-3 font-mono font-bold text-navy-900">${req.headcount} people</td>
                  <td class="py-2.5 px-3 text-slate-700">${req.needs.join(', ')}</td>
                  <td class="py-2.5 px-3">
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      req.urgency === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }">
                      ${req.urgency}
                    </span>
                  </td>
                  <td class="py-2.5 px-3 text-right">
                    <button 
                      onclick="window.app.assignRequest('${req.id}', 'VEH-07')" 
                      class="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-[11px] font-semibold transition-colors"
                    >
                      Assign Rescue Unit
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}
