// Interactive Tactical GIS Map Component for FloodRoute
// Powered by Leaflet & CartoDB Dark Matter / OpenStreetMap vector layers
// Complies with strict data classification, accurate units, and source citations

import L from 'leaflet';
import { DATA_CATEGORY, CONFIDENCE_LEVEL, formatIST, checkFreshness } from '../models/provenance.js';

export class TacticalMap {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.options = options;
    this.map = null;
    this.layers = {
      boundary: null,
      roads: null,
      staticRisk: null,
      liveSensors: null,
      forecasts: null,
      facilities: null,
      community: null,
      simulation: null,
    };
    this.activeFilters = {
      roads: true,
      staticRisk: true,
      liveSensors: true,
      forecasts: true,
      facilities: true,
      community: true,
    };
    this.currentCity = null;
    this.initMap();
  }

  initMap() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    this.map = L.map(this.containerId, {
      center: [19.0176, 72.8462], // Default Mumbai
      zoom: 12,
      minZoom: 9,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
    });

    // Clean, unwatermarked operational dark basemap (Esri World Dark Gray Canvas)
    const baseTileUrl = window.MAP_TILE_URL || 
      (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_MAP_TILE_URL) ||
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';

    const baseTileLayer = L.tileLayer(baseTileUrl, {
      attribution: '&copy; Esri, OpenStreetMap contributors',
      maxZoom: 16,
      errorTileUrl: ''
    }).addTo(this.map);

    // Muted reference label overlay
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      opacity: 0.85
    }).addTo(this.map);

    L.control.attribution({
      position: 'bottomright',
      prefix: false
    }).addAttribution('<span class="text-[10px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded shadow">Esri &bull; OpenStreetMap &bull; Official Municipal GIS</span>').addTo(this.map);

    this.layers.boundary = L.layerGroup().addTo(this.map);
    this.layers.roads = L.layerGroup().addTo(this.map);
    this.layers.staticRisk = L.layerGroup().addTo(this.map);
    this.layers.liveSensors = L.layerGroup().addTo(this.map);
    this.layers.forecasts = L.layerGroup().addTo(this.map);
    this.layers.facilities = L.layerGroup().addTo(this.map);
    this.layers.community = L.layerGroup().addTo(this.map);
    this.layers.simulation = L.layerGroup().addTo(this.map);
  }

  setCity(cityData, simulationState = null) {
    if (!this.map || !cityData) return;
    this.currentCity = cityData;

    this.map.flyTo(cityData.center, cityData.zoom, {
      duration: 1.0,
      easeLinearity: 0.25
    });

    Object.values(this.layers).forEach(layerGroup => layerGroup && layerGroup.clearLayers());

    // 1. Boundary Polygon
    if (cityData.boundary && cityData.boundary.length > 0) {
      const boundaryPolygon = L.polygon(cityData.boundary, {
        color: '#00a572',
        weight: 1.5,
        dashArray: '5, 5',
        fillColor: '#00a572',
        fillOpacity: 0.04,
      });
      boundaryPolygon.bindTooltip(`
        <div class="font-mono text-xs font-bold text-emerald-400">
          ${cityData.name} Municipal Boundary
          <div class="text-[9px] text-zinc-400 font-normal">${cityData.tagline}</div>
        </div>
      `, { sticky: true });
      this.layers.boundary.addLayer(boundaryPolygon);
    }

    // 2. Road Network
    this.renderRoads(cityData.roads, simulationState);

    // 3. Static Flood Risk Spots
    this.renderStaticRisk(cityData.staticRiskSpots);

    // 4. Live Sensor Telemetry
    this.renderLiveSensors(cityData.liveObservations);

    // 5. Forecasts & River Gauge Stations
    this.renderForecasts(cityData.forecasts);

    // 6. Facilities (Hospitals, Shelters)
    this.renderFacilities(cityData.facilities);

    // 7. Community Reports
    this.renderCommunityReports(cityData.communityReports);

    // 8. Simulation Overlay if simulation mode is active
    if (simulationState && simulationState.isSimMode) {
      this.renderSimulationOverlay(cityData, simulationState);
    }
  }

  renderRoads(roads, simulationState) {
    if (!roads) return;
    const isSimStep2Plus = simulationState && simulationState.isSimMode && simulationState.step >= 2;
    const isSimStep3Plus = simulationState && simulationState.isSimMode && simulationState.step >= 3;

    roads.forEach(road => {
      const isBlockedInSim = road.id === 'rd-ambedkar-dr' && isSimStep2Plus;
      const isElevatedBypass = road.type === 'Elevated Expressway' || road.type === 'Elevated Connector';

      let strokeColor = '#4edea3';
      let weight = 4.5;
      let dashArray = null;
      let opacity = 0.85;

      if (isBlockedInSim) {
        strokeColor = '#ff6762';
        weight = 6;
        dashArray = '10, 8';
        opacity = 0.95;
      } else if (isElevatedBypass) {
        strokeColor = isSimStep3Plus ? '#00f59b' : '#6ffbbe';
        weight = isSimStep3Plus ? 6 : 4.5;
        opacity = 0.9;
      }

      const polyline = L.polyline(road.path, {
        color: strokeColor,
        weight: weight,
        dashArray: dashArray,
        opacity: opacity,
        lineCap: 'round',
        lineJoin: 'round',
      });

      polyline.bindPopup(`
        <div class="bg-zinc-950 text-zinc-100 p-2 font-sans min-w-[260px] rounded-lg border border-zinc-800">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-2">
            <span class="font-bold text-xs text-white">${road.name}</span>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
              isBlockedInSim ? 'bg-red-950 text-red-400 border border-red-700/50' : 'bg-emerald-950 text-emerald-300 border border-emerald-700/40'
            }">
              ${isBlockedInSim ? 'SIMULATED IMPASSABLE' : (road.passable ? 'PASSABLE' : 'CAUTION')}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-1.5 text-[10px] font-mono mb-2">
            <div class="bg-zinc-900 p-1.5 rounded">
              <span class="text-zinc-400 block text-[9px]">CLASSIFICATION</span>
              <span class="text-emerald-400 font-bold">${road.type}</span>
            </div>
            <div class="bg-zinc-900 p-1.5 rounded">
              <span class="text-zinc-400 block text-[9px]">PAVEMENT GRADE</span>
              <span class="text-white font-bold">+${road.roadElevationMetersMsl}m MSL</span>
            </div>
            <div class="bg-zinc-900 p-1.5 rounded">
              <span class="text-zinc-400 block text-[9px]">LENGTH</span>
              <span class="text-white">${road.lengthKm} km</span>
            </div>
            <div class="bg-zinc-900 p-1.5 rounded">
              <span class="text-zinc-400 block text-[9px]">SPEED LIMIT</span>
              <span class="text-white">${road.speedKmh} km/h</span>
            </div>
          </div>

          <div class="text-[9px] font-mono text-zinc-400 border-t border-zinc-800/80 pt-1 flex items-center justify-between">
            <span>LIVE OBSERVATION STATUS:</span>
            <span class="text-amber-400 font-bold">${road.condition}</span>
          </div>
          <div class="text-[8px] text-zinc-500 font-mono mt-1">
            Source: OpenStreetMap Road Geometry (ODbL) • No live water sensor on pavement
          </div>
        </div>
      `, { className: 'dark-tactical-popup' });

      this.layers.roads.addLayer(polyline);
    });
  }

  renderStaticRisk(spots) {
    if (!spots) return;

    spots.forEach(spot => {
      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="absolute -inset-2 rounded-full bg-amber-500/20 animate-pulse"></div>
          <div class="w-7 h-7 rounded-full bg-zinc-950/95 border-2 border-amber-500 text-amber-400 flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform">
            <span class="material-symbols-outlined text-[15px]">warning</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-static-risk-pin',
        html: markerHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker(spot.coords, { icon: customIcon });

      marker.bindPopup(`
        <div class="bg-zinc-950 text-zinc-100 p-2.5 font-sans min-w-[280px] max-w-[320px] rounded-lg border border-amber-500/40 shadow-2xl">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-2">
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-amber-400"></span>
              <span class="font-bold text-xs text-amber-300">Historical / Static Risk Layer</span>
            </div>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700/50">
              STATIC RISK
            </span>
          </div>

          <h4 class="font-bold text-xs text-white leading-tight mb-1">${spot.name}</h4>
          <div class="text-[10px] font-mono text-zinc-400 mb-2">Ward / Zone: ${spot.ward}</div>

          <div class="bg-amber-950/40 border border-amber-600/30 rounded p-1.5 text-[9px] text-amber-200 font-mono mb-2">
            <strong>DATA GOVERNANCE RULE:</strong> This record documents chronic historical inundation. A static hotspot NEVER automatically marks adjacent roads as FLOODED or BLOCKED without a verified live observation.
          </div>

          <div class="space-y-1 text-[10px] mb-2 text-zinc-300">
            <div><strong class="text-zinc-400">Chronic Reason:</strong> ${spot.chronicReason}</div>
            ${spot.roadElevationMetersMsl ? `<div><strong class="text-zinc-400">Ground Elevation:</strong> +${spot.roadElevationMetersMsl}m MSL</div>` : ''}
            ${spot.chronicRecordedDepthMeters ? `<div><strong class="text-zinc-400">Historical Recorded Depth:</strong> ${spot.chronicRecordedDepthMeters} m</div>` : ''}
            ${spot.mitigationStatus ? `<div><strong class="text-emerald-400">Mitigation:</strong> ${spot.mitigationStatus}</div>` : ''}
          </div>

          <div class="border-t border-zinc-800 pt-1.5 text-[9px] font-mono text-zinc-400 space-y-0.5">
            <div class="flex justify-between">
              <span>Source Org:</span>
              <span class="text-zinc-200 font-bold">${spot.sourceOrg}</span>
            </div>
            <div class="flex justify-between">
              <span>Source Layer / Doc:</span>
              <span class="text-zinc-300 truncate max-w-[170px]">${spot.layerName || spot.referenceDoc || 'Official Source'}</span>
            </div>
            <div class="flex justify-between">
              <span>Publication Date:</span>
              <span class="text-zinc-300">${spot.publicationDate}</span>
            </div>
            <div class="flex justify-between">
              <span>Confidence:</span>
              <span class="text-emerald-400 font-bold">${spot.confidence}</span>
            </div>
            ${spot.spatialUncertainty ? `<div class="text-[8px] text-zinc-400 italic mt-0.5">Note: ${spot.spatialUncertainty}</div>` : ''}
          </div>
        </div>
      `, { className: 'dark-tactical-popup' });

      this.layers.staticRisk.addLayer(marker);
    });
  }

  renderLiveSensors(sensors) {
    if (!sensors) return;

    sensors.forEach(sensor => {
      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="absolute -inset-2 rounded-full bg-emerald-500/20 animate-pulse"></div>
          <div class="w-8 h-8 rounded-full bg-zinc-950/95 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center shadow-xl group-hover:scale-125 transition-transform">
            <span class="material-symbols-outlined text-[16px]">sensors</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-live-sensor-pin',
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker(sensor.coords, { icon: customIcon });

      marker.bindPopup(`
        <div class="bg-zinc-950 text-zinc-100 p-2.5 font-sans min-w-[280px] rounded-lg border border-emerald-500/40 shadow-2xl">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-2">
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span class="font-bold text-xs text-emerald-300">MCGM Waterway Sensor Metadata</span>
            </div>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
              LAYER 345
            </span>
          </div>

          <h4 class="font-bold text-xs text-white mb-0.5">${sensor.name}</h4>
          <div class="text-[10px] font-mono text-zinc-400 mb-2">${sensor.location} • Ward ${sensor.ward}</div>

          <div class="bg-zinc-900 p-2 rounded border border-zinc-800 text-[10px] font-mono mb-2 space-y-1">
            <div class="flex justify-between">
              <span class="text-zinc-400">Sensor Classification:</span>
              <span class="text-emerald-400 font-bold">${sensor.gaugeType}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-zinc-400">AWS Station ID:</span>
              <span class="text-white">${sensor.awsId}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-zinc-400">Operational State:</span>
              <span class="text-emerald-400 font-bold">${sensor.active ? 'Active Telemetry Station' : 'Inactive'}</span>
            </div>
          </div>

          <p class="text-[10px] text-zinc-300 mb-2">${sensor.notes}</p>

          <div class="border-t border-zinc-800 pt-1.5 text-[9px] font-mono text-zinc-400 space-y-0.5">
            <div class="flex justify-between">
              <span>Source Agency:</span>
              <span class="text-zinc-200">${sensor.sourceOrg}</span>
            </div>
            <div class="flex justify-between">
              <span>Source Layer:</span>
              <span class="text-emerald-400">${sensor.layerName}</span>
            </div>
          </div>
        </div>
      `, { className: 'dark-tactical-popup' });

      this.layers.liveSensors.addLayer(marker);
    });
  }

  renderForecasts(forecasts) {
    if (!forecasts) return;

    forecasts.forEach(fc => {
      const isRiverGauge = fc.forecastType === 'RIVER_STATION_FORECAST';

      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="w-8 h-8 rounded-full bg-zinc-950/95 border-2 border-sky-400 text-sky-400 flex items-center justify-center shadow-xl group-hover:scale-115 transition-transform">
            <span class="material-symbols-outlined text-[16px]">water</span>
          </div>
        </div>
      `;

      // Center coords near forecast station
      const coords = [this.currentCity.center[0] + 0.03, this.currentCity.center[1] + 0.04];
      const customIcon = L.divIcon({
        className: 'custom-forecast-pin',
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker(coords, { icon: customIcon });

      marker.bindPopup(`
        <div class="bg-zinc-950 text-zinc-100 p-2.5 font-sans min-w-[280px] rounded-lg border border-sky-500/50 shadow-2xl">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-2">
            <span class="font-bold text-xs text-sky-300">CWC River Gauge Forecast</span>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-700/50">
              RIVER STAGE (MSL)
            </span>
          </div>

          <h4 class="font-bold text-xs text-white mb-1">${fc.title}</h4>
          <div class="text-[10px] font-mono text-zinc-400 mb-2">Station: ${fc.stationName} (Datum: ${fc.datum})</div>

          <div class="grid grid-cols-3 gap-1 text-center font-mono text-[9px] mb-2">
            <div class="bg-zinc-900 p-1.5 rounded">
              <span class="text-zinc-400 block">CURRENT</span>
              <span class="text-white font-bold block mt-0.5">${fc.currentRiverStageMetersMsl} m MSL</span>
            </div>
            <div class="bg-zinc-900 p-1.5 rounded">
              <span class="text-zinc-400 block">WARNING</span>
              <span class="text-amber-400 font-bold block mt-0.5">${fc.warningLevelMetersMsl} m MSL</span>
            </div>
            <div class="bg-zinc-900 p-1.5 rounded">
              <span class="text-zinc-400 block">DANGER</span>
              <span class="text-red-400 font-bold block mt-0.5">${fc.dangerLevelMetersMsl} m MSL</span>
            </div>
          </div>

          <p class="text-[10px] text-zinc-300 leading-relaxed mb-2">${fc.forecastDetail}</p>

          <div class="border-t border-zinc-800 pt-1.5 text-[9px] font-mono text-zinc-400 flex justify-between">
            <span>Source Portal:</span>
            <span class="text-sky-400">${fc.sourceOrg}</span>
          </div>
        </div>
      `, { className: 'dark-tactical-popup' });

      this.layers.forecasts.addLayer(marker);
    });
  }

  renderFacilities(facilities) {
    if (!facilities) return;

    facilities.forEach(fac => {
      const isHospital = fac.type === 'HOSPITAL';
      const iconName = isHospital ? 'local_hospital' : 'night_shelter';
      const iconColor = isHospital ? '#38bdf8' : '#4edea3';

      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="w-8 h-8 rounded-full bg-zinc-950/95 border flex items-center justify-center shadow-xl group-hover:scale-120 transition-transform" style="border-color: ${iconColor}; color: ${iconColor};">
            <span class="material-symbols-outlined text-[16px]">${iconName}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-fac-pin',
        html: markerHtml,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker(fac.coords, { icon: customIcon });

      marker.bindPopup(`
        <div class="bg-zinc-950 text-zinc-100 p-2.5 font-sans min-w-[260px] rounded-lg border border-zinc-700 shadow-2xl">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-2">
            <span class="font-bold text-xs" style="color: ${iconColor};">${fac.category}</span>
            ${fac.isCritical ? '<span class="px-1 py-0.5 rounded text-[8px] font-mono bg-red-950 text-red-400 font-bold">CRITICAL</span>' : ''}
          </div>

          <h4 class="font-bold text-xs text-white leading-tight mb-1">${fac.name}</h4>
          <div class="text-[10px] text-zinc-400 mb-2">${fac.address}</div>

          <div class="text-[8px] font-mono text-zinc-500 pt-1 border-t border-zinc-800">
            Source: ${fac.sourceOrg || fac.source || 'Municipal Records'}
          </div>
        </div>
      `, { className: 'dark-tactical-popup' });

      this.layers.facilities.addLayer(marker);
    });
  }

  renderCommunityReports(reports) {
    if (!reports) return;

    reports.forEach(rep => {
      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="w-7 h-7 rounded-full bg-zinc-950/95 border-2 border-purple-500 text-purple-400 flex items-center justify-center shadow-lg group-hover:scale-120 transition-transform">
            <span class="material-symbols-outlined text-[14px]">person_pin</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-community-pin',
        html: markerHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker(rep.coords, { icon: customIcon });
      this.layers.community.addLayer(marker);
    });
  }

  renderSimulationOverlay(cityData, simState) {
    if (!this.layers.simulation) return;
    this.layers.simulation.clearLayers();

    const step = simState.step;

    // Simulated Inundation Hazard Polygon at Hindmata Junction
    const hazardPolygonCoords = [
      [19.0100, 72.8405],
      [19.0060, 72.8445],
      [19.0040, 72.8415],
      [19.0080, 72.8385]
    ];

    const hazardPolygon = L.polygon(hazardPolygonCoords, {
      color: '#ff6762',
      weight: 2,
      dashArray: '6, 4',
      fillColor: '#93000a',
      fillOpacity: step >= 2 ? 0.45 : 0.2,
    });

    hazardPolygon.bindTooltip(`
      <div class="font-mono text-xs font-bold text-red-400">
        [SIMULATED FLOOD CREST: ${step >= 2 ? '85cm' : (step === 1 ? '45cm' : '12cm')}]
        <div class="text-[9px] text-zinc-400">Deterministic Pilot Scenario Overlay</div>
      </div>
    `, { sticky: true });
    this.layers.simulation.addLayer(hazardPolygon);

    // Simulated Moving Unit Echo-7
    let vehCoords = [19.0607, 72.8685]; // BKC Depot (Step 0)
    if (step === 1) vehCoords = [19.0275, 72.8520]; // King's Circle
    else if (step === 2) vehCoords = [19.0185, 72.8455]; // Dadar TT (Halts before Hindmata)
    else if (step === 3) vehCoords = [19.0060, 72.8425]; // Ascending Lalbaug Flyover
    else if (step === 4) vehCoords = [19.0028, 72.8415]; // Arrived at KEM Hospital

    const vehHtml = `
      <div class="relative flex items-center justify-center cursor-pointer group">
        <div class="absolute -inset-3 rounded-full ${step >= 2 && step < 3 ? 'bg-red-500/40 animate-ping' : 'bg-emerald-400/30 animate-pulse'}"></div>
        <div class="px-2.5 py-1 rounded-full bg-zinc-950/95 border-2 ${step === 2 ? 'border-red-500 text-red-400' : 'border-emerald-400 text-emerald-300'} flex items-center gap-1.5 shadow-2xl">
          <span class="material-symbols-outlined text-[16px]">directions_car</span>
          <span class="font-mono text-[10px] font-bold">ECHO-7</span>
        </div>
      </div>
    `;

    const vehIcon = L.divIcon({
      className: 'custom-veh-pin',
      html: vehHtml,
      iconSize: [85, 32],
      iconAnchor: [42, 16]
    });

    const vehMarker = L.marker(vehCoords, { icon: vehIcon });
    vehMarker.bindPopup(`
      <div class="bg-zinc-950 text-zinc-100 p-2.5 font-sans min-w-[240px] rounded-lg border border-emerald-500 shadow-2xl">
        <div class="flex items-center justify-between border-b border-zinc-800 pb-1 mb-1.5">
          <span class="font-bold text-xs text-white">Unit Echo-7 (High-Water Heavy)</span>
          <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${step === 2 ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-300'}">
            ${step === 2 ? 'REROUTE REQ' : (step === 3 ? 'BYPASS ACTIVE' : (step === 4 ? 'ARRIVED' : 'EN ROUTE'))}
          </span>
        </div>
        <div class="text-[10px] font-mono space-y-1">
          <div>Mission: Pediatric Medical Shipment</div>
          <div>Ground Clearance: 60 cm</div>
          <div>Speed: ${step === 2 ? '0 km/h (Halted at Crest)' : (step === 3 ? '52 km/h (Elevated)' : '48 km/h')}</div>
        </div>
      </div>
    `);
    this.layers.simulation.addLayer(vehMarker);
  }

  toggleLayer(layerKey, isVisible) {
    if (this.layers[layerKey]) {
      if (isVisible) {
        this.map.addLayer(this.layers[layerKey]);
      } else {
        this.map.removeLayer(this.layers[layerKey]);
      }
    }
  }

  recenter() {
    if (this.currentCity && this.map) {
      this.map.flyTo(this.currentCity.center, this.currentCity.zoom, { duration: 0.8 });
    }
  }

  zoom(delta) {
    if (this.map) {
      this.map.setZoom(this.map.getZoom() + delta);
    }
  }

  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
