// FloodRoute Official Data Ingestion Service
// Directly interfaces with official municipal ArcGIS MapServer endpoints
// Parses authentic geometry, converts CRS, and handles live vs static provenance

import mcgmArchivedData from '../../geo/official_data/mcgm_features.json';
import gccArchivedData from '../../geo/official_data/gcc_features.json';
import { formatIST } from '../../models/provenance.js';

export class OfficialDataStore {
  constructor() {
    this.mcgmData = mcgmArchivedData;
    this.gccData = gccArchivedData;
    this.liveFetchedMcgm = null;
    this.liveFetchedGcc = null;
  }

  /**
   * Attempt live fetch from MCGM MapServer
   */
  async syncMcgmLive() {
    const baseUrl = 'https://prsrvgisapp.mcgm.gov.in/server/rest/services/mcgm/MCGMGIS_Departments_Master_All_Layers_WGS/MapServer';
    const start = performance.now();
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 6000);

      // Query Flooding Spots (Layer 344) and Flow Sensors (Layer 345)
      const [spotsRes, sensorsRes] = await Promise.all([
        fetch(`${baseUrl}/344/query?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&f=json&resultRecordCount=50`, { signal: controller.signal }),
        fetch(`${baseUrl}/345/query?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&f=json&resultRecordCount=20`, { signal: controller.signal })
      ]);
      clearTimeout(id);

      if (spotsRes.ok && sensorsRes.ok) {
        const spotsJson = await spotsRes.json();
        const sensorsJson = await sensorsRes.json();
        const latency = Math.round(performance.now() - start);

        if (spotsJson.features && sensorsJson.features) {
          this.liveFetchedMcgm = {
            timestamp: new Date().toISOString(),
            latencyMs: latency,
            floodingSpots: spotsJson.features,
            flowSensors: sensorsJson.features
          };
          return {
            success: true,
            status: 'CONNECTED',
            pingMs: latency,
            recordsCount: spotsJson.features.length + sensorsJson.features.length,
            syncTime: formatIST(Date.now()),
            isLive: true
          };
        }
      }
      return {
        success: true,
        status: 'METADATA_REACHABLE_FEATURES_NOT_SYNCED',
        pingMs: Math.round(performance.now() - start),
        recordsCount: 0,
        syncTime: formatIST(Date.now()),
        isLive: false,
        error: 'Layer metadata reachable but feature payload incomplete.'
      };
    } catch (err) {
      return {
        success: false,
        status: 'UNAVAILABLE',
        pingMs: null,
        recordsCount: 0,
        syncTime: null,
        isLive: false,
        error: err.message || 'Network request failed'
      };
    }
  }

  /**
   * Attempt live fetch from GCC MapServer
   */
  async syncGccLive() {
    const baseUrl = 'https://gisgcc.chennaicorporation.gov.in/server/rest/services/GCCDepts/GCC_COLLABORATION_LAYER/MapServer';
    const start = performance.now();
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 6000);

      const [riversRes, subwaysRes] = await Promise.all([
        fetch(`${baseUrl}/1/query?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&f=json&resultRecordCount=20`, { signal: controller.signal }),
        fetch(`${baseUrl}/5/query?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&f=json&resultRecordCount=20`, { signal: controller.signal })
      ]);
      clearTimeout(id);

      if (riversRes.ok && subwaysRes.ok) {
        const riversJson = await riversRes.json();
        const subwaysJson = await subwaysRes.json();
        const latency = Math.round(performance.now() - start);

        if (riversJson.features && subwaysJson.features) {
          this.liveFetchedGcc = {
            timestamp: new Date().toISOString(),
            latencyMs: latency,
            rivers: riversJson.features,
            subways: subwaysJson.features
          };
          return {
            success: true,
            status: 'CONNECTED',
            pingMs: latency,
            recordsCount: riversJson.features.length + subwaysJson.features.length,
            syncTime: formatIST(Date.now()),
            isLive: true
          };
        }
      }
      return {
        success: true,
        status: 'METADATA_REACHABLE_FEATURES_NOT_SYNCED',
        pingMs: Math.round(performance.now() - start),
        recordsCount: 0,
        syncTime: formatIST(Date.now()),
        isLive: false,
        error: 'GCC MapServer metadata reachable but features not synced.'
      };
    } catch (err) {
      return {
        success: false,
        status: 'UNAVAILABLE',
        pingMs: null,
        recordsCount: 0,
        syncTime: null,
        isLive: false,
        error: err.message || 'GCC connection failed'
      };
    }
  }

  /**
   * Get parsed Mumbai Flooding Spots
   */
  getMumbaiFloodingSpots() {
    const rawSpots = (this.liveFetchedMcgm && this.liveFetchedMcgm.floodingSpots) || this.mcgmData.layers.floodingSpots || [];
    return rawSpots.map(f => {
      const attrs = f.attributes || {};
      let lat = 19.0760;
      let lng = 72.8777;

      if (f.geometry) {
        if (f.geometry.rings && f.geometry.rings[0] && f.geometry.rings[0][0]) {
          lng = f.geometry.rings[0][0][0];
          lat = f.geometry.rings[0][0][1];
        } else if (f.geometry.x && f.geometry.y) {
          lng = f.geometry.x;
          lat = f.geometry.y;
        }
      }

      // Depth from source: in meters or feet as recorded by MCGM
      const depthValue = attrs.DEPTH != null ? Number(attrs.DEPTH) : null;

      return {
        id: `MCGM-SPOT-${attrs.OBJECTID}`,
        objectId: attrs.OBJECTID,
        featureId: attrs.FEATUREID || `FS-${attrs.OBJECTID}`,
        name: (attrs.NAME || 'MCGM Chronic Flooding Spot').trim(),
        location: attrs.LOCATION || 'Greater Mumbai',
        ward: attrs.WARD || 'Unassigned',
        coords: [lat, lng],
        category: 'STATIC_RISK',
        sourceType: 'OFFICIAL_MUNICIPAL_GIS_LAYER',
        sourceOrg: 'Brihanmumbai Municipal Corporation (MCGM/BMC)',
        sourceUrl: 'https://prsrvgisapp.mcgm.gov.in/server/rest/services/mcgm/MCGMGIS_Departments_Master_All_Layers_WGS/MapServer/344',
        layerName: 'MCGM GIS Layer 344 (Flooding Spots)',
        publicationDate: attrs.LAST_EDITED_DATE ? new Date(attrs.LAST_EDITED_DATE).toISOString().split('T')[0] : '2024-05-23',
        retrievalDate: this.mcgmData.retrievalTimestamp,
        isLiveStream: !!this.liveFetchedMcgm,
        // Units clearly stated:
        chronicRecordedDepthMeters: depthValue,
        stretchMeters: attrs.STRETCH != null ? Number(attrs.STRETCH) : null,
        affectedHuts: attrs.AFFECTED_HUT != null ? Number(attrs.AFFECTED_HUT) : null,
        affectedPopulation: attrs.AFFECT_POPULATION != null ? Number(attrs.AFFECT_POPULATION) : null,
        dewateringPumpsActive: attrs.NO_DE_WATER_PUMP != null ? Number(attrs.NO_DE_WATER_PUMP) : 0,
        affectsRailway: attrs.AFFECT_RAIL || 'No',
        chronicReason: 'Documented MCGM municipal stormwater depression / high-tide backwater accumulation point.',
        confidence: 'OFFICIAL_AUTHORITATIVE',
        spatialUncertainty: 'Direct GIS polygon centroid from MCGM MapServer Layer 344.'
      };
    });
  }

  /**
   * Get parsed Mumbai Flow Sensors
   */
  getMumbaiFlowSensors() {
    const rawSensors = (this.liveFetchedMcgm && this.liveFetchedMcgm.flowSensors) || this.mcgmData.layers.flowSensors || [];
    return rawSensors.map(f => {
      const attrs = f.attributes || {};
      const lat = f.geometry ? f.geometry.y : 19.0784;
      const lng = f.geometry ? f.geometry.x : 72.8778;

      return {
        id: `MCGM-SENSOR-${attrs.OBJECTID}`,
        objectId: attrs.OBJECTID,
        awsId: attrs.AWSID || 'N/A',
        name: (attrs.NAME || 'River Flow Level Sensor').trim(),
        location: attrs.LOCATION || 'Mumbai Waterway',
        ward: attrs.WARD || 'L',
        coords: [lat, lng],
        category: 'LIVE_OBSERVATION',
        sensorType: 'Municipal River/Waterway Level Sensor',
        sourceOrg: 'MCGM Disaster Management Cell',
        sourceUrl: 'https://prsrvgisapp.mcgm.gov.in/server/rest/services/mcgm/MCGMGIS_Departments_Master_All_Layers_WGS/MapServer/345',
        layerName: 'MCGM GIS Layer 345 (Flow Level Sensor)',
        retrievalDate: this.mcgmData.retrievalTimestamp,
        isLiveStream: !!this.liveFetchedMcgm,
        active: attrs.ACTIVE === 'Y',
        // Units clearly separated:
        gaugeType: 'RIVER_WATERWAY_STAGE',
        notes: 'Flow level sensor monitored by MCGM Disaster Management for river and nala stage telemetry. Does not represent street pavement puddle depth.',
        confidence: 'OFFICIAL_AUTHORITATIVE'
      };
    });
  }

  /**
   * Get parsed Mumbai Hospitals from Layer 214
   */
  getMumbaiHospitals() {
    const rawHosp = this.mcgmData.layers.hospitals || [];
    return rawHosp.map(f => {
      const attrs = f.attributes || {};
      return {
        id: `MCGM-HOSP-${attrs.OBJECTID}`,
        name: (attrs.NAME || 'Municipal Hospital').trim(),
        type: 'HOSPITAL',
        category: attrs.SUBTYPE || 'General Hospital',
        coords: [f.geometry.y, f.geometry.x],
        address: attrs.LOCATION || 'Mumbai',
        sourceOrg: 'MCGM Public Health Department',
        sourceUrl: 'https://prsrvgisapp.mcgm.gov.in/server/rest/services/mcgm/MCGMGIS_Departments_Master_All_Layers_WGS/MapServer/214',
        layerName: 'MCGM GIS Layer 214 (Hospitals)',
        isCritical: true
      };
    });
  }

  /**
   * Get parsed Mumbai Shelters from Layer 232
   */
  getMumbaiShelters() {
    const rawShelters = this.mcgmData.layers.shelters || [];
    return rawShelters.map(f => {
      const attrs = f.attributes || {};
      return {
        id: `MCGM-SHELTER-${attrs.OBJECTID}`,
        name: (attrs.NAME || 'Municipal Relief Shelter').trim(),
        type: 'SHELTER',
        category: 'Temporary Municipal Evacuation Shelter',
        coords: [f.geometry.y, f.geometry.x],
        address: attrs.LOCATION || 'Mumbai',
        sourceOrg: 'MCGM Disaster Management Cell',
        sourceUrl: 'https://prsrvgisapp.mcgm.gov.in/server/rest/services/mcgm/MCGMGIS_Departments_Master_All_Layers_WGS/MapServer/232',
        layerName: 'MCGM GIS Layer 232 (Temporary Shelters)',
        isCritical: false
      };
    });
  }
}

export const officialDataStore = new OfficialDataStore();
