# FloodRoute — Hackathon Demo Runbook

This runbook provides step-by-step instructions to run, verify, and screen-record a live demonstration of **FloodRoute** for judges and evaluators at the AWS Hackathon.

---

## 1. Quick Prerequisites Check

1. **Node.js:** Ensure Node.js v18+ or v20+ is installed (`node -v`).
2. **Environment File:**
   ```bash
   cp .env.example .env
   ```
3. **Dependencies:**
   ```bash
   npm install
   ```

---

## 2. Launching FloodRoute (Frontend + AWS Backend)

Run the backend server and Vite client concurrently in two terminal tabs, or launch both:

### Terminal 1 — Start the Backend Server (Port 4000)
```bash
npm run server
```
*Expected Console Output:*
```
[FloodRoute Backend] Running on http://0.0.0.0:4000
[FloodRoute Backend] AWS Region: ap-south-1 | Bedrock Model: anthropic.claude-3-haiku-20240307-v1:0
```

### Terminal 2 — Start the Vite Development Server (Port 3000)
```bash
npm run dev
```
*Access URL:* Open your browser at [http://localhost:3000](http://localhost:3000).

---

## 3. Step-by-Step Hackathon Video Demonstration Flow

### Scene 1: Platform Introduction & Command Center Overview (0:00 - 0:30)
1. Navigate to **Command Center Overview** (`http://localhost:3000`).
2. Point out:
   - Tagline: *"When Roads Fail. Relief Keeps Moving."*
   - City Grid: **Mumbai Metropolitan Area** with MCGM official GIS data sources.
   - Real-time metric cards: Passable Arterials (88%), Active Fleet, Emergency Incident Concourse.
   - Strict geospatial separation between Pavement Water Level (cm) and River Stage Datum (meters MSL).

### Scene 2: Live Network & 3D Digital City Diorama (0:30 - 1:15)
1. Click **Live Network** on the top navigation bar.
2. Highlight the **3D Digital City View**:
   - The photorealistic miniature city diorama with wet asphalt boulevards and illuminated civic headquarters.
   - Click the **3D Isometric / Top-Down 2D** tilt button to show camera perspective control.
   - Identify the two active units:
     * **Ambulance AMB-001 (Echo-7):** Carrying critical pediatric medication from BKC Depot toward KEM Hospital via Dr. Ambedkar Rd.
     * **Relief Supply Truck REL-001:** Navigating independently along the Grand East Causeway toward Sector 4 Relief Shelter.

### Scene 3: Acute Flood Event & Dynamic Rerouting (1:15 - 2:00)
1. On the right-hand **Tactical Corridor Telemetry** drawer, click:
   > **`[ Simulate R-12 Flood Breach (85cm) ]`**
2. Watch the synchronized physical changes:
   - Road R-12 at Hindmata Junction flashes red and becomes **BLOCKED / IMPASSABLE** with hazard stripes.
   - The flood inundation zone polygon deepens in red opacity.
   - **Ambulance AMB-001** halts before the breach and smoothly turns onto the **Lalbaug Elevated Viaduct Bypass (Corridor 07)** (+14.5m grade).
   - **Relief Truck REL-001** continues along its separate Causeway route completely unaffected.

### Scene 4: Amazon Bedrock AI Decision Briefing (2:00 - 2:30)
1. Direct attention to the **Amazon Bedrock AI Decision Card** in the right drawer:
   - Notice the structured operational briefing:
     * **Situation Summary:** Identifies the acute water breach on R-12.
     * **Physical Safety Reason:** Explicitly cites water depth (85cm) exceeding vehicle chassis clearance (60cm).
     * **Validated Action:** Recommends dispatcher authorization of the elevated viaduct bypass.
     * **Trade-Off Analysis:** Demonstrates the trade-off (+3.7 min travel time for +11.3m dry elevation margin and 98.4% safety score).
   - If AWS Bedrock credentials are live: displays `BEDROCK CONVERSE VERIFIED`.
   - If in offline simulation mode: displays `DETERMINISTIC FALLBACK (Safety Intact)`.

### Scene 5: Dual GIS Validation (2:30 - 2:50)
1. Click the **2D Tactical GIS** toggle button.
2. Show the Leaflet GIS layer with official MCGM flow sensors, CWC river hydrograph gauges, and shelter locations.

### Scene 6: Resetting & Repeating (2:50 - 3:00)
1. Click **Reset Simulation** to return the city to baseline nominal conditions.

---

## 4. Running the Automated Test Suite

To demonstrate test-driven engineering to evaluators:

```bash
npm test
```
*Expected Result:*
All 11 unit & integration tests passing (Dijkstra routing, blocked road exclusion, safety validation, Bedrock schema validation, credential fallbacks, and offline simulation).
