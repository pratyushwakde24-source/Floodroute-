// Team Directory & Role Governance Screen
import { store } from '../state/store.js';
import { USER_ROLES } from '../data/seedData.js';

export function renderTeamView() {
  const state = store.getState();
  const members = state.teamMembers;

  return `
    <div class="p-4 lg:p-6 space-y-5 max-w-[1600px] w-full mx-auto">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-app-border pb-4">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-xl font-bold text-navy-900 tracking-tight">Team Directory & Role Governance</h1>
            <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-100 text-teal-800 border border-teal-200">
              ${members.length} Credentialed Personnel
            </span>
          </div>
          <p class="text-xs text-slate-500 font-sans mt-0.5">
            Multi-Agency Dispatchers, Command Leads & Field Units RBAC Permissions
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button 
            onclick="window.app.openInviteModal()" 
            class="px-4 py-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-subtle flex items-center gap-1.5 transition-colors"
          >
            <span class="material-symbols-outlined text-[16px]">person_add</span>
            <span>Invite Officer / Crew</span>
          </button>
        </div>
      </div>

      <!-- Role Governance Overview Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
        ${Object.keys(USER_ROLES).map(k => {
          const r = USER_ROLES[k];
          const count = members.filter(m => m.role === k).length;
          return `
            <div class="ui-card p-3 text-center">
              <span class="text-[10px] text-slate-400 uppercase font-mono block">${r.badge}</span>
              <span class="text-xl font-bold text-navy-900 block mt-1">${count}</span>
              <span class="text-[10px] text-teal-700 font-medium block mt-1">
                ${r.canDispatch ? 'Dispatch Authority' : (r.canViewSensitive ? 'Field Terminal' : 'Public Safe')}
              </span>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Team Personnel Table -->
      <div class="ui-card overflow-hidden shadow-card">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs ui-table">
            <thead>
              <tr>
                <th class="py-3 px-4">Name & Title</th>
                <th class="py-3 px-4">Role Assignment</th>
                <th class="py-3 px-4">Station / Unit</th>
                <th class="py-3 px-4">Terminal Status</th>
                <th class="py-3 px-4">Location</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${members.map(m => `
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="py-3 px-4 font-semibold text-navy-900">
                    <div>${m.name}</div>
                    <div class="text-[10px] text-slate-400 font-mono">${m.email}</div>
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      ${m.role}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-slate-700 font-medium">${m.unit}</td>
                  <td class="py-3 px-4">
                    <span class="flex items-center gap-1.5 text-[11px] font-medium text-teal-700">
                      <span class="w-2 h-2 rounded-full bg-teal-600"></span>
                      <span>Active</span>
                    </span>
                  </td>
                  <td class="py-3 px-4 text-slate-500 font-mono text-[11px]">${m.location || 'Command Central'}</td>
                  <td class="py-3 px-4 text-right">
                    <button class="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors">
                      Manage
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
