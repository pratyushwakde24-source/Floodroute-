// Public Emergency Help & Shelter Directory Screen
import { store } from '../state/store.js';

export function renderPublicHelpView() {
  const state = store.getState();
  const city = store.getSelectedCity();
  const shelters = state.facilities.filter(f => f.type === 'PUBLIC_SHELTER');

  return `
    <div class="flex-1 flex justify-center p-3 sm:p-6 bg-app-bg min-h-[calc(100vh-7rem)]">
      <div class="max-w-lg w-full space-y-4 self-start">
        
        <!-- Public Emergency Banner -->
        <div class="bg-navy-900 text-white p-4 rounded-2xl shadow-subtle flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
              <span class="material-symbols-outlined text-[24px]">flood</span>
            </div>
            <div>
              <h1 class="text-sm font-bold leading-tight">Public Flood Emergency Portal</h1>
              <span class="text-xs text-slate-300 font-sans">${city.name} Civic Resilience Network</span>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono font-bold text-teal-300">
            CITIZEN AID
          </span>
        </div>

        <!-- Emergency Hotlines Quick Dial -->
        <div class="grid grid-cols-2 gap-2 text-center font-sans">
          <a 
            href="tel:112" 
            class="bg-red-50 border border-red-200 p-3 rounded-xl flex items-center justify-center gap-2 text-red-700 font-bold text-xs hover:bg-red-100 transition-colors shadow-subtle"
          >
            <span class="material-symbols-outlined text-[18px]">call</span>
            <span>Emergency: 112 / 101</span>
          </a>
          <a 
            href="tel:1916" 
            class="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-center gap-2 text-navy-900 font-bold text-xs hover:bg-slate-50 transition-colors shadow-subtle"
          >
            <span class="material-symbols-outlined text-[18px] text-teal-600">support_agent</span>
            <span>Disaster Helpline: 1916</span>
          </a>
        </div>

        <!-- Citizen SOS Request Form -->
        <div class="ui-card p-5 space-y-3.5 shadow-card">
          <div class="flex items-center gap-2 border-b border-app-border pb-2.5">
            <span class="material-symbols-outlined text-red-600 text-[20px]">sos</span>
            <h2 class="text-xs font-bold text-navy-900 uppercase tracking-wider">Request Emergency Flood Assistance</h2>
          </div>

          <form id="publicSosForm" onsubmit="window.app.handlePublicSos(event)" class="space-y-3 text-xs">
            <div>
              <label class="text-slate-600 font-medium block mb-1">Your Full Name</label>
              <input 
                type="text" 
                id="citizenName" 
                required 
                placeholder="e.g. Maria Gonzalez / Priya Sharma" 
                class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-navy-900 outline-none focus:border-teal-500 focus:bg-white"
              >
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-slate-600 font-medium block mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  id="citizenPhone" 
                  required 
                  placeholder="+91 98765 43210" 
                  class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-navy-900 outline-none focus:border-teal-500 focus:bg-white font-mono"
                >
              </div>
              <div>
                <label class="text-slate-600 font-medium block mb-1">Number of People</label>
                <input 
                  type="number" 
                  id="citizenHeadcount" 
                  value="2" 
                  min="1" 
                  max="25" 
                  class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-navy-900 outline-none focus:border-teal-500 focus:bg-white font-mono"
                >
              </div>
            </div>

            <div>
              <label class="text-slate-600 font-medium block mb-1">Location / Landmarks</label>
              <input 
                type="text" 
                id="citizenAddress" 
                required 
                placeholder="Building name, road, or nearest intersection" 
                class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-navy-900 outline-none focus:border-teal-500 focus:bg-white"
              >
            </div>

            <div>
              <label class="text-slate-600 font-medium block mb-1">Critical Assistance Required</label>
              <select 
                id="citizenNeed" 
                class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-navy-900 outline-none focus:border-teal-500 focus:bg-white"
              >
                <option value="Drinking Water & Food Rations">Drinking Water & Food Rations</option>
                <option value="Medical Oxygen / Power Outage Support">Medical Oxygen / Power Outage Support</option>
                <option value="High-Water Rescue Boat Extraction">High-Water Rescue Boat Extraction</option>
                <option value="Infant Formula & Elderly Assistance">Infant Formula & Elderly Assistance</option>
              </select>
            </div>

            <button 
              type="submit" 
              class="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-card flex items-center justify-center gap-1.5 transition-colors"
            >
              <span class="material-symbols-outlined text-[18px]">send</span>
              <span>Transmit SOS Request to Dispatch</span>
            </button>
          </form>
        </div>

        <!-- Designated High-Ground Evacuation Shelters -->
        <div class="space-y-3">
          <h2 class="text-xs font-bold text-navy-900 uppercase tracking-wider">
            Verified Safe Ground Shelters
          </h2>

          <div class="space-y-2.5">
            ${shelters.map(s => {
              const occPct = Math.round((s.capacityOccupied / s.capacityTotal) * 100);
              return `
                <div class="ui-card p-4 space-y-2">
                  <div class="flex items-start justify-between">
                    <div>
                      <h3 class="font-bold text-xs text-navy-900">${s.name}</h3>
                      <div class="text-[11px] text-slate-500">${s.location} &bull; <strong class="text-teal-700 font-mono">+${s.elevationM}m MSL</strong></div>
                    </div>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-100 text-teal-800">
                      OPEN
                    </span>
                  </div>

                  <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-teal-600 h-full rounded-full" style="width: ${occPct}%"></div>
                  </div>

                  <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Capacity: ${s.capacityOccupied} / ${s.capacityTotal} (${occPct}%)</span>
                    <button 
                      onclick="window.app.getDirections('${s.id}')" 
                      class="text-teal-700 font-semibold hover:underline flex items-center gap-0.5"
                    >
                      <span>Safe Route</span>
                      <span class="material-symbols-outlined text-[13px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    </div>
  `;
}
