import { useEffect, useState } from "react";
import "./App.css";
import { cityStatus, weatherData, healthData } from "./data/mockdata";

function App() {
  const [activeLayer, setActiveLayer] = useState("heat");
  const [message, setMessage] = useState("");
  const [alertOverride, setAlertOverride] = useState(null);
  // const [alertLevel, setAlertLevel] = useState(cityStatus.alertLevel);

  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live condition data: strictly uses live sensor readings
  const currentRisk = liveData?.current?.risk || weatherData.riskLevel;
  const tomorrowRisk = liveData?.thermal_stress?.risk || weatherData.riskLevel;

  const liveWBGT =
    liveData?.current?.wbgt ??
    weatherData.wbgt;

  // Standardized 4-tier alert mapping: LOW -> GREEN, MODERATE -> YELLOW, HIGH -> ORANGE, EXTREME -> RED
  const riskToAlert = (risk) => {
    const value = String(risk || "").toUpperCase();
    if (value.includes("EXTREME")) return "RED";
    if (value.includes("HIGH")) return "ORANGE";
    if (value.includes("MODERATE")) return "YELLOW";
    return "GREEN";
  };

  const overviewAlert =
    alertOverride || riskToAlert(currentRisk);

  const formatPeakTime = (timeStr) => {
    if (!timeStr) return "--";
    try {
      const match = String(timeStr).match(/(?:T|\s)(\d{1,2}):(\d{2})/);
      if (match) {
        const hour = parseInt(match[1], 10);
        const min = match[2];
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${String(hour).padStart(2, "0")}:${min} (${hour12}:${min} ${ampm})`;
      }
      const date = new Date(timeStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
      }
      return String(timeStr);
    } catch {
      return String(timeStr);
    }
  };

  /* ---------------------------------------------------------
     EXISTING API — DO NOT CHANGE
  --------------------------------------------------------- */

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/heat-risk")
      .then((response) => response.json())
      .then((data) => {
        console.log("UDSS API:", data);
        setLiveData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("API error:", error);
        setLoading(false);
      });
  }, []);

  /* ---------------------------------------------------------
     NAVIGATION
  --------------------------------------------------------- */

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /* ---------------------------------------------------------
     ACTIONS
  --------------------------------------------------------- */

  const handleAction = (action) => {
    setMessage(action);
  };

  /* ---------------------------------------------------------
     RISK
  --------------------------------------------------------- */

  const getRiskClass = (risk) => {
    const value = String(risk || "").toUpperCase();

    if (value.includes("EXTREME")) return "risk-red";
    if (value.includes("HIGH")) return "risk-orange";
    if (value.includes("MODERATE")) return "risk-yellow";

    return "risk-green";
  };

  const getRiskLabel = (risk) => {
    const value = String(risk || "").toUpperCase();

    if (value.includes("EXTREME")) return "EXTREME";
    if (value.includes("HIGH")) return "HIGH";
    if (value.includes("MODERATE")) return "MODERATE";

    return "LOW";
  };

  return (
    <div className="app">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="brand-mark">U</div>

          <div className="brand-text">
            <strong>UDSS</strong>
            <span>COMMAND CENTER</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          <button
            className="nav-item active"
            onClick={() => scrollToSection("current")}
          >
            <span className="nav-icon">⌂</span>
            <span>Overview</span>
          </button>

          <button
            className="nav-item"
            onClick={() => scrollToSection("current")}
          >
            <span className="nav-icon">⌖</span>
            <span>Live Situation</span>
          </button>

          <button
            className="nav-item"
            onClick={() => scrollToSection("prediction")}
          >
            <span className="nav-icon">↗</span>
            <span>Prediction</span>
          </button>

          <button
            className="nav-item"
            onClick={() => scrollToSection("health")}
          >
            <span className="nav-icon">+</span>
            <span>Health Risk</span>
          </button>

          <button
            className="nav-item"
            onClick={() => scrollToSection("response")}
          >
            <span className="nav-icon">!</span>
            <span>Response</span>
          </button>

        </nav>

        <div className="sidebar-bottom">
          <span className="system-dot"></span>
          <span>System Online</span>
        </div>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="main-content">

        {/* HEADER */}

        <header className="header">

          <div className="header-title">

            <div>
              <h1>
                UNIFIED DECISION SUPPORT SYSTEM
              </h1>

              <p className="header-subtitle">
                UDSS COMMAND CENTER
              </p>
            </div>

            <div className="location">
              <span>📍</span>
              <div>
                <strong>Yamnampet</strong>
                <small>Ghatkesar, Telangana</small>
              </div>
            </div>

          </div>


          <div className="status-bar">

            <div className="status-item">
              <span>Area Status</span>
              <span className={`alert-pill ${overviewAlert.toLowerCase()}`}>
                <span className="status-indicator-dot"></span>
                {overviewAlert}
              </span>
            </div>

            <div className="status-item">
              <span>Live WBGT</span>
              <strong>{Number(liveWBGT).toFixed(1)}°C</strong>
            </div>

            <div className="status-item">
              <span>Projected Admissions (+3D)</span>
              <strong>
                +{cityStatus.projectedAdmissions}
                <small className="status-subtext">Demo Baseline</small>
              </strong>
            </div>

          </div>

        </header>


        {/* =====================================================
            DASHBOARD
        ===================================================== */}

        <main className="dashboard">


          {/* ===================================================
              01 CURRENT SITUATION
          =================================================== */}

          <section
            id="current"
            className="dashboard-section"
          >

            <div className="section-divider">
              <span>01</span>
              <strong>CURRENT SITUATION</strong>
            </div>


            <div className="current-grid">

              {/* MAP */}

              <section className="map-panel">

                <div className="panel-heading">
                  <div>
                    <h2>GIS MAP</h2>
                    <span>
                      Yamnampet • Ghatkesar • Telangana
                    </span>
                  </div>

                  <span className="map-status">
                    LIVE AREA
                  </span>
                </div>


                <div className="layers">

                  <strong>Map Layers</strong>

                  <label className={activeLayer === "heat" ? "layer-label active" : "layer-label"}>
                    <input
                      type="radio"
                      name="layer"
                      checked={activeLayer === "heat"}
                      onChange={() => setActiveLayer("heat")}
                    />
                    Ward Heat Index
                  </label>

                  <label className={activeLayer === "health" ? "layer-label active" : "layer-label"}>
                    <input
                      type="radio"
                      name="layer"
                      checked={activeLayer === "health"}
                      onChange={() => setActiveLayer("health")}
                    />
                    Health Risk Overlay
                  </label>

                  <label className={activeLayer === "power" ? "layer-label active" : "layer-label"}>
                    <input
                      type="radio"
                      name="layer"
                      checked={activeLayer === "power"}
                      onChange={() => setActiveLayer("power")}
                    />
                    Power Grid Vulnerability
                  </label>

                </div>


                <div className="map-box">

                  {/* Real OpenStreetMap Base */}
                  <iframe
                    title="Yamnampet Ghatkesar Map"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=78.62%2C17.42%2C78.71%2C17.49&layer=mapnik&marker=17.4547%2C78.6611"
                    className="real-map"
                  />

                  {/* Reactive Map Layer 1: Heat Index */}
                  {activeLayer === "heat" && (
                    <>
                      <div className="map-overlay heat-map-overlay">
                        <div className="overlay-header">
                          <span className="overlay-badge-dot heat"></span>
                          <strong>WARD HEAT INDEX • PILOT SECTOR</strong>
                        </div>
                        <span className="overlay-sub">
                          Live WBGT: {Number(liveWBGT).toFixed(1)}°C • Status: {getRiskLabel(currentRisk)}
                        </span>
                      </div>

                      <div className={`map-visual-layer heat-layer ${getRiskClass(currentRisk)}`}>
                        <div className="thermal-halo"></div>
                        <div className="thermal-pulse"></div>
                        <div className="sensor-marker-pin">
                          <span className="sensor-pin-icon">📡</span>
                          <span className="sensor-pin-label">
                            Yamnampet AWS ({liveData ? `${liveData.current.temperature}°C` : `${weatherData.temperature}°C`})
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Reactive Map Layer 2: Health Risk Overlay */}
                  {activeLayer === "health" && (
                    <>
                      <div className="map-overlay health-map-overlay">
                        <div className="overlay-header">
                          <span className="overlay-badge-dot health"></span>
                          <strong>HEALTH SURVEILLANCE OVERLAY</strong>
                        </div>
                        <span className="overlay-sub">
                          Prototype Facilities • Surge Buffer Zone
                        </span>
                      </div>

                      <div className="map-visual-layer health-layer">
                        <div className="facility-marker hospital-marker">
                          <span className="facility-icon">🏥</span>
                          <span className="facility-label">Ghatkesar PHC / Hospital</span>
                        </div>
                        <div className="facility-marker cooling-marker">
                          <span className="facility-icon">❄️</span>
                          <span className="facility-label">Designated Cooling Shelter</span>
                        </div>
                        <div className="vulnerability-zone"></div>
                      </div>
                    </>
                  )}

                  {/* Reactive Map Layer 3: Power Grid Vulnerability */}
                  {activeLayer === "power" && (
                    <>
                      <div className="map-overlay power-map-overlay">
                        <div className="overlay-header">
                          <span className="overlay-badge-dot power"></span>
                          <strong>POWER GRID VULNERABILITY</strong>
                        </div>
                        <span className="overlay-sub">
                          Prototype Feeder Circuits • Peak Cooling Load
                        </span>
                      </div>

                      <div className="map-visual-layer power-layer">
                        <div className="facility-marker substation-marker">
                          <span className="facility-icon">⚡</span>
                          <span className="facility-label">Ghatkesar 33/11kV Substation</span>
                        </div>
                        <div className="feeder-circuit feeder-north"></div>
                        <div className="feeder-circuit feeder-east"></div>
                        <div className="grid-stress-zone"></div>
                      </div>
                    </>
                  )}

                  {/* Pilot Area Location Marker */}
                  <div className="location-marker">
                    <span>📍</span>
                    <div>
                      <strong>Yamnampet</strong>
                      <small>Pilot Command Node</small>
                    </div>
                  </div>

                  {/* Dynamic Map Legend */}
                  <div className="map-legend">

                    <strong>
                      {activeLayer === "heat" && "MAP LEGEND • HEAT INDEX"}
                      {activeLayer === "health" && "MAP LEGEND • HEALTH OVERLAY"}
                      {activeLayer === "power" && "MAP LEGEND • POWER GRID"}
                    </strong>

                    {activeLayer === "heat" && (
                      <>
                        <div>
                          <span className={`legend-dot ${getRiskClass(currentRisk)}`}></span>
                          Thermal Stress Zone ({getRiskLabel(currentRisk)})
                        </div>
                        <div>
                          <span className="legend-dot station"></span>
                          Pilot AWS Sensor Station
                        </div>
                        <div>
                          <span className="legend-dot hotspot"></span>
                          Thermal Hotspot Radius
                        </div>
                      </>
                    )}

                    {activeLayer === "health" && (
                      <>
                        <div>
                          <span className="legend-dot hospital"></span>
                          Primary Health Centre (Ghatkesar)
                        </div>
                        <div>
                          <span className="legend-dot cooling"></span>
                          Designated Cooling Shelter
                        </div>
                        <div>
                          <span className="legend-dot surge-zone"></span>
                          Surge Vulnerability Sector (Demo)
                        </div>
                      </>
                    )}

                    {activeLayer === "power" && (
                      <>
                        <div>
                          <span className="legend-dot substation"></span>
                          33/11kV Distribution Substation
                        </div>
                        <div>
                          <span className="legend-dot feeder"></span>
                          High-Load Feeder Circuit
                        </div>
                        <div>
                          <span className="legend-dot grid-alert"></span>
                          Peak Load Stress Buffer (Demo)
                        </div>
                      </>
                    )}

                  </div>

                </div>

              </section>


              {/* CURRENT WEATHER */}

              <section className="analytics">

                <div className="card">

                  <div className="card-header-with-badge">
                    <h3>METEOROLOGICAL ENGINE</h3>
                    <span className="live-sensor-badge">
                      <span className="live-dot"></span> LIVE TELEMETRY
                    </span>
                  </div>

                  <div className="metrics">

                    <div className="metric">
                      <span>Current Temp</span>
                      <strong>
                        {liveData
                          ? `${liveData.current.temperature}°C`
                          : `${weatherData.temperature}°C`}
                      </strong>
                      <small className="metric-tag">Station Sensor</small>
                    </div>

                    <div className="metric">
                      <span>Relative Humidity</span>
                      <strong>
                        {liveData
                          ? `${liveData.current.humidity}%`
                          : `${weatherData.humidity}%`}
                      </strong>
                      <small className="metric-tag">Relative 2m</small>
                    </div>

                    <div className="metric">
                      <span>Current WBGT</span>
                      <strong>
                        {liveData
                          ? `${liveData.current.wbgt}°C`
                          : `${weatherData.wbgt}°C`}
                      </strong>
                      <small className="metric-tag">Live Sensor WBGT</small>
                    </div>

                    <div className="metric">
                      <span>Est. UTCI</span>
                      <strong>
                        {weatherData.utci}°C
                      </strong>
                      <small className="metric-tag">Biometeorology Model</small>
                    </div>

                  </div>


                  {/* DYNAMIC RISK */}

                  <div className="risk-panel">

                    <div
                      className={`risk-circle ${getRiskClass(
                        currentRisk
                      )}`}
                    >
                      <span></span>
                    </div>

                    <div className="risk-text">

                      <span>THERMAL RISK (LIVE)</span>

                      <strong>
                        {getRiskLabel(currentRisk)}
                      </strong>

                      <small>
                        Calculated from live station conditions
                      </small>

                    </div>

                  </div>


                  {loading && (
                    <small className="connection-status">
                      Connecting to UDSS engine...
                    </small>
                  )}

                </div>

              </section>

            </div>

          </section>


          {/* ===================================================
              02 PREDICTION & ANALYTICS
          =================================================== */}

          <section
            id="prediction"
            className="dashboard-section"
          >

            <div className="section-divider">
              <span>02</span>
              <strong>PREDICTION & ANALYTICS</strong>
            </div>


            <div className="analytics-grid">

              {/* ML */}

              <div className="card ml-card">

                <div className="card-header-with-badge">
                  <h3>ML TEMPERATURE PREDICTION</h3>
                  <span className="ai-badge">AI FORECAST MODEL</span>
                </div>

                <div className="metrics">

                  <div className="metric">
                    <span>Predicted Tomorrow Max</span>

                    <strong>
                      {liveData
                        ? `${liveData.prediction.temperature}°C`
                        : "--"}
                    </strong>
                    <small className="metric-tag">Random Forest Model</small>
                  </div>

                  <div className="metric">
                    <span>Peak Forecast</span>

                    <strong>
                      {liveData
                        ? `${liveData.forecast.temperature}°C`
                        : "--"}
                    </strong>
                    <small className="metric-tag">Meteo Daily Max</small>
                  </div>

                  <div className="metric">
                    <span>Forecast Humidity</span>

                    <strong>
                      {liveData
                        ? `${liveData.forecast.humidity}%`
                        : "--"}
                    </strong>
                    <small className="metric-tag">At Peak Hour</small>
                  </div>

                </div>

              </div>


              {/* TOMORROW */}

              <div className="card tomorrow-card">

                <div className="card-header-with-badge">
                  <h3>TOMORROW THERMAL STRESS</h3>
                  <span className="forecast-badge">PEAK DAY FORECAST</span>
                </div>

                <div className="metrics">

                  <div className="metric">
                    <span>Tomorrow Peak WBGT</span>

                    <strong>
                      {liveData
                        ? `${liveData.thermal_stress.wbgt}°C`
                        : "--"}
                    </strong>
                    <small className="metric-tag">Peak Forecast</small>
                  </div>

                  <div className="metric">
                    <span>Risk Level</span>

                    <strong>
                      <span className={`risk-pill ${getRiskClass(tomorrowRisk)}`}>
                        {getRiskLabel(tomorrowRisk)}
                      </span>
                    </strong>
                    <small className="metric-tag">NDMA Threshold</small>
                  </div>

                  <div className="metric">
                    <span>Peak Time</span>

                    <strong>
                      {liveData?.forecast?.peak_time
                        ? formatPeakTime(liveData.forecast.peak_time)
                        : "--"}
                    </strong>
                    <small className="metric-tag">Peak Thermal Hour</small>
                  </div>

                </div>

              </div>

            </div>


            {/* HEALTH */}

            <div
              id="health"
              className="health-section"
            >

              <div className="card health-card">

                <div className="card-header-with-badge">
                  <div>
                    <h3>HEALTH SURVEILLANCE & SURGE BUFFER</h3>
                    <span className="card-subheading">
                      Pilot Reference Estimates (Demonstration Baseline)
                    </span>
                  </div>
                  <span className="prototype-badge">DEMO PROJECTION BASELINE</span>
                </div>

                <div className="metrics">

                  <div className="metric">
                    <span>Projected ICU Demand</span>
                    <strong>
                      {healthData.projectedICUDemand}%
                    </strong>
                    <small className="metric-tag">Surge Estimate</small>
                  </div>

                  <div className="metric">
                    <span>ER Heatstroke Logs</span>
                    <strong>
                      {healthData.erHeatstrokeLogs}
                    </strong>
                    <small className="metric-tag">24h Surveillance Baseline</small>
                  </div>

                  <div className="metric">
                    <span>Ambulance Anomaly</span>
                    <strong>
                      {healthData.ambulanceAnomaly}%
                    </strong>
                    <small className="metric-tag">Deviation Index</small>
                  </div>

                </div>

              </div>

            </div>

          </section>


          {/* ===================================================
              03 RESPONSE & ACTION
          =================================================== */}

          <section
            id="response"
            className="dashboard-section"
          >

            <div className="section-divider">
              <span>03</span>
              <strong>RESPONSE & ACTION</strong>
            </div>


            <div className="response-grid">

              <div className="card action-card">

                <div className="card-header-with-badge">
                  <h3>ACTION DISPATCH MATRIX</h3>
                  <span className="command-badge">COMMAND ACTIONS</span>
                </div>

                <div className="actions">

                  <button
                    className="action-btn-danger"
                    onClick={() => {
                      setAlertOverride("RED");
                      handleAction("HAP Stage 2 activated — Emergency heat alert broadcast dispatched");
                    }}
                  >
                    <span className="action-btn-icon">⚠️</span>
                    Trigger HAP Stage 2
                  </button>

                  <button
                    className="action-btn-tactical"
                    onClick={() =>
                      handleAction(
                        "IVR Broadcast queued — 1,240 vulnerable users in Yamnampet sector"
                      )
                    }
                  >
                    <span className="action-btn-icon">📢</span>
                    Send IVR Broadcast
                  </button>

                  <button
                    className="action-btn-tactical"
                    onClick={() =>
                      handleAction(
                        "47 ASHA field workers notified in Ghatkesar cluster"
                      )
                    }
                  >
                    <span className="action-btn-icon">👥</span>
                    Notify ASHA Network
                  </button>

                  <button
                    className="action-btn-tactical"
                    onClick={() =>
                      handleAction(
                        "Grid response request dispatched — Substation load caps enabled"
                      )
                    }
                  >
                    <span className="action-btn-icon">⚡</span>
                    Adjust Grid Caps
                  </button>

                  <button
                    className="action-btn-reset"
                    onClick={() => {
                      setAlertOverride(null);
                      setMessage("Alert level reset to live station status");
                    }}
                  >
                    <span className="action-btn-icon">↺</span>
                    Reset Alert
                  </button>

                </div>

                {message && (
                  <div className="action-message">
                    <span className="message-icon">✓</span>
                    <span>{message}</span>
                  </div>
                )}

              </div>


              {/* RISK SCALE */}

              <div className="card risk-scale-card">

                <h3>RISK SCALE</h3>

                <div className="risk-scale">

                  <div>
                    <span className="scale-circle green"></span>
                    <span>LOW</span>
                  </div>

                  <div>
                    <span className="scale-circle yellow"></span>
                    <span>MODERATE</span>
                  </div>

                  <div>
                    <span className="scale-circle orange"></span>
                    <span>HIGH</span>
                  </div>

                  <div>
                    <span className="scale-circle red"></span>
                    <span>EXTREME</span>
                  </div>

                </div>

              </div>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default App;