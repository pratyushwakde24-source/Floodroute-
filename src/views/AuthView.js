// Tactical Sign In & Authentication Screen
import { store } from '../state/store.js';

export function renderAuthView() {
  return `
    <div class="flex-1 flex items-center justify-center p-4 lg:p-8 bg-app-bg min-h-[calc(100vh-7rem)]">
      <div class="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 space-y-6 shadow-modal relative">
        
        <!-- Logo & Title -->
        <div class="text-center space-y-2">
          <div class="w-12 h-12 rounded-xl bg-navy-900 text-white flex items-center justify-center mx-auto shadow-subtle">
            <span class="material-symbols-outlined text-[28px]">flood</span>
          </div>
          <h1 class="text-lg font-bold text-navy-900 tracking-tight">FloodRoute Enterprise</h1>
          <p class="text-xs text-slate-500 font-sans">Civic Mobility & Emergency Operations Gateway</p>
        </div>

        <!-- 1-Click Persona Logins -->
        <div class="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <span class="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">
            1-Click Operational Persona Logins
          </span>
          
          <div class="space-y-1.5 text-xs">
            <button 
              onclick="window.app.quickLogin('ORG_ADMIN')" 
              class="w-full p-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-left flex items-center justify-between group transition-colors shadow-subtle"
            >
              <div>
                <div class="font-bold text-navy-900 group-hover:text-teal-700">Dir. Sarah Chen</div>
                <div class="text-[10px] text-slate-500 font-sans">Organization Commander / Emergency Lead</div>
              </div>
              <span class="material-symbols-outlined text-slate-400 group-hover:text-teal-700 text-[18px]">login</span>
            </button>

            <button 
              onclick="window.app.quickLogin('DISPATCHER')" 
              class="w-full p-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-left flex items-center justify-between group transition-colors shadow-subtle"
            >
              <div>
                <div class="font-bold text-navy-900 group-hover:text-teal-700">Marcus Vance</div>
                <div class="text-[10px] text-slate-500 font-sans">Tactical Dispatcher (Reroute Approval Authority)</div>
              </div>
              <span class="material-symbols-outlined text-slate-400 group-hover:text-teal-700 text-[18px]">login</span>
            </button>

            <button 
              onclick="window.app.quickLogin('FIELD_RESPONDER')" 
              class="w-full p-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-left flex items-center justify-between group transition-colors shadow-subtle"
            >
              <div>
                <div class="font-bold text-navy-900 group-hover:text-teal-700">Capt. James Rodriguez</div>
                <div class="text-[10px] text-slate-500 font-sans">Field Responder (Echo-7 Cockpit HUD)</div>
              </div>
              <span class="material-symbols-outlined text-slate-400 group-hover:text-teal-700 text-[18px]">login</span>
            </button>

            <button 
              onclick="window.app.quickLogin('ANALYST')" 
              class="w-full p-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-left flex items-center justify-between group transition-colors shadow-subtle"
            >
              <div>
                <div class="font-bold text-navy-900 group-hover:text-teal-700">Liam Gallagher</div>
                <div class="text-[10px] text-slate-500 font-sans">Hydrologist & GIS Analyst (Read-Only)</div>
              </div>
              <span class="material-symbols-outlined text-slate-400 group-hover:text-teal-700 text-[18px]">login</span>
            </button>

            <button 
              onclick="window.app.quickLogin('PUBLIC')" 
              class="w-full p-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-left flex items-center justify-between group transition-colors shadow-subtle"
            >
              <div>
                <div class="font-bold text-navy-900 group-hover:text-teal-700">Citizen Public User</div>
                <div class="text-[10px] text-slate-500 font-sans">Public Shelter Directory & SOS Requests</div>
              </div>
              <span class="material-symbols-outlined text-slate-400 group-hover:text-teal-700 text-[18px]">login</span>
            </button>
          </div>
        </div>

        <div class="text-center text-[11px] text-slate-400 font-sans">
          Encrypted Municipal FirstNet Relay &bull; TLS 1.3 Certified
        </div>

      </div>
    </div>
  `;
}
