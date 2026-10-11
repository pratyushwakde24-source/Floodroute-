// Agency Setup & Onboarding Wizard
import { store } from '../state/store.js';

export function renderOnboardingView() {
  return `
    <div class="flex-1 flex items-center justify-center p-4 lg:p-8 bg-app-bg min-h-[calc(100vh-7rem)]">
      <div class="max-w-xl w-full bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 space-y-6 shadow-modal">
        
        <!-- Header -->
        <div class="border-b border-app-border pb-4">
          <div class="flex items-center gap-2 text-teal-700 text-xs font-bold mb-1">
            <span class="w-2 h-2 rounded-full bg-teal-600"></span>
            <span class="uppercase tracking-wider">AGENCY PROVISIONING WIZARD</span>
          </div>
          <h1 class="text-lg font-bold text-navy-900">Provision Disaster Emergency Workspace</h1>
          <p class="text-xs text-slate-500 font-sans mt-0.5">
            Configure multi-agency GIS boundaries, river telemetry feeds, and initial relief assets.
          </p>
        </div>

        <!-- Form -->
        <form onsubmit="window.app.handleCreateOrg(event)" class="space-y-4 text-xs font-sans">
          <div>
            <label class="text-slate-600 font-medium block mb-1">Emergency Taskforce / Agency Name</label>
            <input 
              type="text" 
              id="newOrgName" 
              required 
              placeholder="e.g. Coastal Riverfront Mutual Aid Command" 
              class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-navy-900 outline-none focus:border-teal-500 focus:bg-white"
            >
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-slate-600 font-medium block mb-1">Operational Sector</label>
              <input 
                type="text" 
                id="newOrgSector" 
                required 
                placeholder="e.g. Sector 9 Estuary" 
                class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-navy-900 outline-none focus:border-teal-500 focus:bg-white"
              >
            </div>
            <div>
              <label class="text-slate-600 font-medium block mb-1">Hydrological Basin Code</label>
              <input 
                type="text" 
                id="newOrgBasin" 
                value="CWC-BASIN-MITHI-04" 
                class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-navy-900 outline-none focus:border-teal-500 focus:bg-white font-mono"
              >
            </div>
          </div>

          <div>
            <label class="text-slate-600 font-medium block mb-1">Satellite & Hydrometric Preset</label>
            <select class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-navy-900 outline-none focus:border-teal-500 focus:bg-white">
              <option>MCGM ArcGIS Master + CWC Mithi River Gauges (Mumbai Pilot)</option>
              <option>Greater Chennai Corporation GIS Collaboration Cluster</option>
              <option>BBMP Hydrological Valley Model (Bengaluru BCAP)</option>
              <option>ASDMA Urban Flood Lowlands (Guwahati Study)</option>
            </select>
          </div>

          <div class="pt-4 border-t border-app-border flex items-center justify-between">
            <button 
              type="button" 
              onclick="window.app.navigate('overview')" 
              class="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:text-navy-900 hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="px-5 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs shadow-subtle flex items-center gap-2 transition-colors"
            >
              <span class="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Deploy Taskforce Workspace</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  `;
}
