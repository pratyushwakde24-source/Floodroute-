// Interactive Modals and Toast Notifications Container
import { store } from '../state/store.js';

export function renderModals() {
  const state = store.getState();
  let html = '';

  // 1. New Incident Modal
  if (state.showNewIncidentModal) {
    html += `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
        <div class="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-modal relative animate-slideDown">
          
          <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div class="flex items-center gap-2 text-red-600">
              <span class="material-symbols-outlined text-[22px]">add_alert</span>
              <h3 class="text-base font-bold text-navy-900">Log New Emergency Flood Incident</h3>
            </div>
            <button onclick="window.app.closeNewIncidentModal()" class="text-slate-400 hover:text-slate-600 p-1">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <form onsubmit="window.app.handleCreateIncident(event)" class="space-y-3.5 text-xs">
            <div>
              <label class="text-slate-600 font-medium block mb-1">Incident Headline / Title</label>
              <input 
                type="text" 
                id="incTitle" 
                required 
                placeholder="e.g. Underpass Inundation at Dadar TT Circle" 
                class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition-colors"
              >
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-slate-600 font-medium block mb-1">Severity Level</label>
                <select 
                  id="incSeverity" 
                  class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition-colors"
                >
                  <option value="CRITICAL">CRITICAL (Immediate Danger)</option>
                  <option value="HIGH" selected>HIGH (Rapid Surge Threat)</option>
                  <option value="MEDIUM">MEDIUM (Caution / Monitoring)</option>
                </select>
              </div>
              <div>
                <label class="text-slate-600 font-medium block mb-1">Municipal Ward / Zone</label>
                <input 
                  type="text" 
                  id="incZone" 
                  value="Ward F-North (Dadar / Matunga)" 
                  class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition-colors"
                >
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-slate-600 font-medium block mb-1">Water Depth (Meters)</label>
                <input 
                  type="number" 
                  id="incDepth" 
                  step="0.05" 
                  value="0.65" 
                  class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition-colors font-mono"
                >
              </div>
              <div>
                <label class="text-slate-600 font-medium block mb-1">Trapped Civilians</label>
                <input 
                  type="number" 
                  id="incTrapped" 
                  value="4" 
                  min="0" 
                  class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition-colors font-mono"
                >
              </div>
            </div>

            <div>
              <label class="text-slate-600 font-medium block mb-1">Location / Landmarks</label>
              <input 
                type="text" 
                id="incLocation" 
                required 
                placeholder="e.g. Dr. Ambedkar Rd & Hindmata Flyover Entrance" 
                class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition-colors"
              >
            </div>

            <div>
              <label class="text-slate-600 font-medium block mb-1">Field Description & Access Constraints</label>
              <textarea 
                id="incDesc" 
                rows="2" 
                placeholder="Details regarding stalled vehicles, storm drain backflow, or power line hazards..." 
                class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition-colors"
              ></textarea>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button 
                type="button" 
                onclick="window.app.closeNewIncidentModal()" 
                class="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:text-navy-900 hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors flex items-center gap-1.5 shadow-subtle"
              >
                <span class="material-symbols-outlined text-[16px]">publish</span>
                <span>Log Incident Record</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    `;
  }

  // 2. Invite Team Member Modal
  if (state.showInviteModal) {
    html += `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
        <div class="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-modal relative animate-slideDown">
          
          <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div class="flex items-center gap-2 text-teal-700">
              <span class="material-symbols-outlined text-[22px]">person_add</span>
              <h3 class="text-base font-bold text-navy-900">Provision Disaster Personnel</h3>
            </div>
            <button onclick="window.app.closeInviteModal()" class="text-slate-400 hover:text-slate-600 p-1">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <form onsubmit="window.app.handleInviteMember(event)" class="space-y-3.5 text-xs">
            <div>
              <label class="text-slate-600 font-medium block mb-1">Official Municipal Email</label>
              <input 
                type="email" 
                id="inviteEmail" 
                required 
                placeholder="officer.name@mcgm.gov.in" 
                class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition-colors"
              >
            </div>

            <div>
              <label class="text-slate-600 font-medium block mb-1">Operational Role (RBAC)</label>
              <select 
                id="inviteRole" 
                class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition-colors"
              >
                <option value="DISPATCHER">Tactical Dispatcher (Route Approval Authority)</option>
                <option value="FIELD_RESPONDER">Field Responder (Vehicle Mobile Cockpit HUD)</option>
                <option value="ANALYST">Hydrology / GIS Analyst (Read-Only)</option>
                <option value="ORG_ADMIN">Organization Commander (Full Administration)</option>
              </select>
            </div>

            <div>
              <label class="text-slate-600 font-medium block mb-1">Assigned Station / Unit Call</label>
              <input 
                type="text" 
                id="inviteUnit" 
                placeholder="e.g. Dadar Fire Sub-Station 4" 
                class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition-colors"
              >
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button 
                type="button" 
                onclick="window.app.closeInviteModal()" 
                class="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:text-navy-900 hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors flex items-center gap-1.5 shadow-subtle"
              >
                <span class="material-symbols-outlined text-[16px]">send</span>
                <span>Send Credential Invite</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    `;
  }

  // 3. Floating Toast Notifications
  if (state.toasts && state.toasts.length > 0) {
    html += `
      <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        ${state.toasts.map(toast => {
          let badgeBg = 'bg-white text-navy-900 border-slate-200';
          let icon = 'info';
          let iconColor = 'text-teal-600';

          if (toast.type === 'error') {
            badgeBg = 'bg-red-50 text-red-900 border-red-200';
            icon = 'error';
            iconColor = 'text-red-600';
          } else if (toast.type === 'warning') {
            badgeBg = 'bg-amber-50 text-amber-900 border-amber-200';
            icon = 'warning';
            iconColor = 'text-amber-600';
          } else if (toast.type === 'success') {
            badgeBg = 'bg-teal-50 text-teal-900 border-teal-200';
            icon = 'check_circle';
            iconColor = 'text-teal-600';
          }

          return `
            <div class="pointer-events-auto p-3 rounded-xl border shadow-float flex items-center gap-3 animate-slideDown ${badgeBg}">
              <span class="material-symbols-outlined text-[20px] ${iconColor} flex-shrink-0">${icon}</span>
              <div class="text-xs flex-1 font-medium leading-tight">${toast.message}</div>
              <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600 p-0.5">
                <span class="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  return html;
}
