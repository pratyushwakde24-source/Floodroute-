/**
 * FloodRoute 3D Digital City Diorama Component
 * High-fidelity 3D tilt perspective city diorama with smooth waypoint-following vehicle animations,
 * dynamic flood inundation zones, and real-time rerouting synchronization.
 */

export class City3DScene {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.options = options;
    this.container = null;
    this.is3DTilted = true;
    this.animationFrameId = null;

    // Simulation & Vehicle State
    this.state = {
      step: 0,
      floodActive: false,
      waterDepthCm: 12,
      // Waypoint paths in SVG 1920x1080 coordinate space
      routes: {
        // Route Alpha (through R-12 Hindmata)
        alpha: [
          [180, 820], // Depot
          [440, 810], // Connector
          [560, 740], // Sion
          [610, 480], // Hindmata (R-12)
          [730, 550],
          [1710, 390], // Hospital
        ],
        // Route Beta (Safe Viaduct Bypass Corridor 07)
        beta: [
          [180, 820], // Depot
          [440, 810], // Connector
          [560, 740], // Sion Circle
          [690, 660], // Viaduct Approach
          [960, 600], // North Viaduct Ramp (+14.5m)
          [1140, 490], // Viaduct Deck Span
          [1420, 420], // Highland Bypass
          [1710, 390], // Hospital
        ],
        // Independent Relief Truck Route (Grand East Causeway)
        relief: [
          [180, 820], // Depot
          [500, 880],
          [730, 830],
          [920, 810], // East Connector
          [1320, 830],
          [1620, 860], // Relief Shelter
        ],
      },
      // Vehicle dynamic positions
      amb: {
        id: 'AMB-001',
        name: 'Echo-7 (Ambulance)',
        pos: [180, 820],
        angle: 0,
        progress: 0, // 0 to 1 along active route
        speed: 0.0007,
        routeType: 'alpha', // 'alpha' or 'beta'
        status: 'EN_ROUTE',
      },
      rel: {
        id: 'REL-001',
        name: 'Supply-12 (Relief Truck)',
        pos: [180, 820],
        angle: 0,
        progress: 0,
        speed: 0.0005,
        routeType: 'relief',
        status: 'EN_ROUTE',
      },
    };

    this.init();
  }

  init() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) return;

    this.renderDOM();
    this.startAnimationLoop();
  }

  renderDOM() {
    if (!this.container) return;

    // High quality diorama background image
    const bgUrl = '/assets/city-diorama.png';

    this.container.innerHTML = `
      <div class="relative w-full h-full overflow-hidden bg-slate-950 select-none perspective-[1200px]">
        <!-- 3D Transform Layer Container -->
        <div id="${this.containerId}-stage" class="w-full h-full origin-center transition-transform duration-700 ease-out" style="transform: ${this.is3DTilted ? 'rotateX(24deg) scale(0.96) translateY(-2%)' : 'rotateX(0deg) scale(1)'}">
          
          <!-- Background Diorama Canvas -->
          <div class="absolute inset-0 w-full h-full bg-cover bg-center" style="background-image: url('${bgUrl}'), radial-gradient(circle at 50% 50%, #1e293b 0%, #090d16 100%);">
            <!-- Scrim gradient for contrast -->
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/50 pointer-events-none"></div>
          </div>

          <!-- SVG Vector Routes & Flood Overlay Layer -->
          <svg id="${this.containerId}-svg" class="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 1920 1080" preserveAspectRatio="none">
            <defs>
              <linearGradient id="safeBypassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#4edea3" stop-opacity="0.95"/>
                <stop offset="100%" stop-color="#00a572" stop-opacity="0.85"/>
              </linearGradient>
              <linearGradient id="reliefGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.9"/>
                <stop offset="100%" stop-color="#0284c7" stop-opacity="0.8"/>
              </linearGradient>
              <pattern id="blockedHazardStripe" width="16" height="16" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="16" stroke="#ff6762" stroke-width="4" stroke-opacity="0.8"/>
              </pattern>
            </defs>

            <!-- Flood Inundation Hazard Polygon (Hindmata Trench) -->
            <polygon 
              id="${this.containerId}-flood-poly"
              points="480,440 680,430 750,560 510,610 420,530" 
              fill="#93000a" 
              fill-opacity="${this.state.floodActive ? '0.45' : '0.15'}" 
              stroke="#ff6762" 
              stroke-width="2" 
              stroke-dasharray="${this.state.floodActive ? '6,4' : 'none'}"
              class="transition-all duration-700"
            />

            <!-- Road R-12: Dr. Ambedkar Rd / Hindmata Trench -->
            <path 
              id="${this.containerId}-r12-road" 
              d="M 560,740 L 610,480 L 730,550" 
              fill="none" 
              stroke="${this.state.floodActive ? '#ff6762' : '#ea580c'}" 
              stroke-width="${this.state.floodActive ? '7' : '4'}" 
              stroke-dasharray="${this.state.floodActive ? '10,6' : 'none'}" 
              stroke-linecap="round" 
              opacity="0.9"
            />

            <!-- Safe Bypass Corridor 07 (Elevated Viaduct) -->
            <path 
              id="${this.containerId}-corridor07" 
              d="M 180,820 C 440,810 560,740 690,660 S 960,600 1140,490 S 1420,420 1710,390" 
              fill="none" 
              stroke="url(#safeBypassGrad)" 
              stroke-width="5" 
              stroke-linecap="round" 
              class="drop-shadow-[0_0_12px_rgba(78,222,163,0.85)]"
            />

            <!-- Relief Truck Corridor (Grand East Causeway) -->
            <path 
              id="${this.containerId}-relief-corridor" 
              d="M 180,820 C 500,880 730,830 920,810 S 1320,830 1620,860" 
              fill="none" 
              stroke="url(#reliefGrad)" 
              stroke-width="4" 
              stroke-linecap="round" 
              stroke-dasharray="6,4"
              opacity="0.8"
            />
          </svg>

          <!-- Interactive Facility Pins -->
          <!-- Pin: Central Logistics Depot -->
          <div class="absolute top-[76%] left-[9.5%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto cursor-pointer group">
            <div class="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700 px-2.5 py-1 rounded-full shadow-xl">
              <span class="w-2 h-2 rounded-full bg-teal-400"></span>
              <span class="text-[10px] font-mono font-bold text-white">BKC DEPOT</span>
            </div>
          </div>

          <!-- Pin: KEM Hospital Trauma Concourse -->
          <div class="absolute top-[36%] left-[89%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto cursor-pointer group">
            <div class="flex items-center gap-1.5 bg-slate-900/90 border border-emerald-500/80 px-2.5 py-1 rounded-full shadow-xl">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span class="text-[10px] font-mono font-bold text-white">KEM HOSPITAL</span>
            </div>
          </div>

          <!-- Pin: Sector 4 Relief Shelter -->
          <div class="absolute top-[80%] left-[84%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto cursor-pointer group">
            <div class="flex items-center gap-1.5 bg-slate-900/90 border border-sky-500/80 px-2.5 py-1 rounded-full shadow-xl">
              <span class="w-2 h-2 rounded-full bg-sky-400"></span>
              <span class="text-[10px] font-mono font-bold text-white">RELIEF SHELTER</span>
            </div>
          </div>

          <!-- Pin: Flooded Breach Zone at Hindmata (R-12) -->
          <div class="absolute top-[48%] left-[32%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto cursor-pointer">
            <div class="flex items-center gap-1.5 ${this.state.floodActive ? 'bg-red-950/90 border-red-500 text-red-300' : 'bg-amber-950/80 border-amber-500 text-amber-300'} border px-2.5 py-1 rounded-full shadow-xl">
              <span class="w-2 h-2 rounded-full ${this.state.floodActive ? 'bg-red-500 animate-ping' : 'bg-amber-400'}"></span>
              <span class="text-[10px] font-mono font-bold">${this.state.floodActive ? 'R-12 BLOCKED (85cm)' : 'HINDMATA (12cm)'}</span>
            </div>
          </div>

          <!-- Moving Vehicle 1: Ambulance AMB-001 (Echo-7) -->
          <div 
            id="${this.containerId}-veh-amb"
            class="absolute z-30 pointer-events-auto cursor-pointer -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
            style="top: ${(this.state.amb.pos[1] / 1080) * 100}%; left: ${(this.state.amb.pos[0] / 1920) * 100}%;"
          >
            <div class="flex items-center gap-1.5 bg-slate-900/95 border-2 ${this.state.floodActive ? 'border-emerald-400 text-emerald-300' : 'border-amber-400 text-amber-300'} px-2.5 py-1 rounded-full shadow-2xl">
              <span class="material-symbols-outlined text-[14px] ${this.state.floodActive ? 'text-emerald-400' : 'text-amber-400'}">emergency</span>
              <span class="font-mono text-[10px] font-bold">AMB-001</span>
              <span class="text-[9px] text-slate-400 font-mono">${this.state.floodActive ? 'VIADUCT' : '45 km/h'}</span>
            </div>
          </div>

          <!-- Moving Vehicle 2: Relief Supply Truck REL-001 -->
          <div 
            id="${this.containerId}-veh-rel"
            class="absolute z-30 pointer-events-auto cursor-pointer -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
            style="top: ${(this.state.rel.pos[1] / 1080) * 100}%; left: ${(this.state.rel.pos[0] / 1920) * 100}%;"
          >
            <div class="flex items-center gap-1.5 bg-slate-900/95 border-2 border-sky-400 text-sky-300 px-2.5 py-1 rounded-full shadow-2xl">
              <span class="material-symbols-outlined text-[14px] text-sky-400">local_shipping</span>
              <span class="font-mono text-[10px] font-bold">REL-001</span>
              <span class="text-[9px] text-slate-400 font-mono">50 km/h</span>
            </div>
          </div>

        </div>

        <!-- 3D Diorama Perspective Floating Controls -->
        <div class="absolute top-4 right-4 z-40 flex items-center gap-2">
          <button 
            id="${this.containerId}-btn-tilt"
            class="px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 shadow-xl transition-all"
            title="Toggle 3D Perspective Tilt"
          >
            <span class="material-symbols-outlined text-[16px]">${this.is3DTilted ? 'view_in_ar' : 'layers'}</span>
            <span>${this.is3DTilted ? '3D Isometric' : 'Top-Down 2D'}</span>
          </button>
        </div>

      </div>
    `;

    // Hook tilt button
    const btnTilt = document.getElementById(`${this.containerId}-btn-tilt`);
    if (btnTilt) {
      btnTilt.onclick = () => this.toggleTilt();
    }
  }

  toggleTilt() {
    this.is3DTilted = !this.is3DTilted;
    const stage = document.getElementById(`${this.containerId}-stage`);
    if (stage) {
      stage.style.transform = this.is3DTilted 
        ? 'rotateX(24deg) scale(0.96) translateY(-2%)' 
        : 'rotateX(0deg) scale(1)';
    }
    const btnTilt = document.getElementById(`${this.containerId}-btn-tilt`);
    if (btnTilt) {
      btnTilt.innerHTML = `
        <span class="material-symbols-outlined text-[16px]">${this.is3DTilted ? 'view_in_ar' : 'layers'}</span>
        <span>${this.is3DTilted ? '3D Isometric' : 'Top-Down 2D'}</span>
      `;
    }
  }

  /**
   * Update 3D scene from backend simulation state
   */
  updateFromSimulation(simState) {
    if (!simState) return;

    this.state.step = simState.step || 0;
    this.state.floodActive = simState.floodEventActive || simState.step >= 2;

    // If flood active, switch ambulance route to beta bypass
    if (this.state.floodActive && this.state.amb.routeType !== 'beta') {
      this.state.amb.routeType = 'beta';
      // Smoothly transition progress onto the new route near the same junction
      this.state.amb.progress = Math.min(this.state.amb.progress, 0.45);
    } else if (!this.state.floodActive && this.state.amb.routeType !== 'alpha') {
      this.state.amb.routeType = 'alpha';
    }

    // Update DOM visual styles for road and flood polygon
    const floodPoly = document.getElementById(`${this.containerId}-flood-poly`);
    if (floodPoly) {
      floodPoly.setAttribute('fill-opacity', this.state.floodActive ? '0.45' : '0.15');
      floodPoly.setAttribute('stroke-dasharray', this.state.floodActive ? '6,4' : 'none');
    }

    const r12Road = document.getElementById(`${this.containerId}-r12-road`);
    if (r12Road) {
      r12Road.setAttribute('stroke', this.state.floodActive ? '#ff6762' : '#ea580c');
      r12Road.setAttribute('stroke-width', this.state.floodActive ? '7' : '4');
      r12Road.setAttribute('stroke-dasharray', this.state.floodActive ? '10,6' : 'none');
    }
  }

  /**
   * Animation loop to move vehicles along waypoints
   */
  startAnimationLoop() {
    const interpolateAlongPoints = (points, t) => {
      if (!points || points.length === 0) return [0, 0];
      if (points.length === 1) return points[0];

      // Total path length
      let totalLength = 0;
      const segLengths = [];
      for (let i = 0; i < points.length - 1; i++) {
        const dx = points[i + 1][0] - points[i][0];
        const dy = points[i + 1][1] - points[i][1];
        const dist = Math.hypot(dx, dy);
        segLengths.push(dist);
        totalLength += dist;
      }

      let targetDist = t * totalLength;
      for (let i = 0; i < segLengths.length; i++) {
        if (targetDist <= segLengths[i]) {
          const segT = targetDist / segLengths[i];
          const x = points[i][0] + (points[i + 1][0] - points[i][0]) * segT;
          const y = points[i][1] + (points[i + 1][1] - points[i][1]) * segT;
          return [x, y];
        }
        targetDist -= segLengths[i];
      }
      return points[points.length - 1];
    };

    const animate = () => {
      // 1. Advance AMB-001 along active route
      this.state.amb.progress += this.state.amb.speed;
      if (this.state.amb.progress > 1) this.state.amb.progress = 0;

      const activeAmbPoints = this.state.amb.routeType === 'beta' 
        ? this.state.routes.beta 
        : this.state.routes.alpha;
      this.state.amb.pos = interpolateAlongPoints(activeAmbPoints, this.state.amb.progress);

      // 2. Advance REL-001 independently along relief route
      this.state.rel.progress += this.state.rel.speed;
      if (this.state.rel.progress > 1) this.state.rel.progress = 0;
      this.state.rel.pos = interpolateAlongPoints(this.state.routes.relief, this.state.rel.progress);

      // 3. Update DOM positions
      const ambEl = document.getElementById(`${this.containerId}-veh-amb`);
      if (ambEl) {
        ambEl.style.left = `${(this.state.amb.pos[0] / 1920) * 100}%`;
        ambEl.style.top = `${(this.state.amb.pos[1] / 1080) * 100}%`;
      }

      const relEl = document.getElementById(`${this.containerId}-veh-rel`);
      if (relEl) {
        relEl.style.left = `${(this.state.rel.pos[0] / 1920) * 100}%`;
        relEl.style.top = `${(this.state.rel.pos[1] / 1080) * 100}%`;
      }

      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
