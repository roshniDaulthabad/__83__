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
  const liveRisk =
  liveData?.current?.risk ||
  liveData?.thermal_stress?.risk ||
  "LOW";

const liveWBGT =
  liveData?.current?.wbgt ??
  liveData?.thermal_stress?.wbgt ??
  cityStatus.avgWBGT;

const riskToAlert = (risk) => {
  if (risk === "EXTREME RISK" || risk === "HIGH") return "RED";
  if (risk === "MODERATE") return "YELLOW";
  return "GREEN";
};

const overviewAlert =
  alertOverride || riskToAlert(liveRisk);

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

  const currentRisk = liveData
    ? liveData.thermal_stress?.risk
    : weatherData.riskLevel;

  const getRiskClass = (risk) => {
    const value = String(risk).toUpperCase();

    if (value.includes("EXTREME")) return "risk-red";
    if (value.includes("HIGH")) return "risk-orange";
    if (value.includes("MODERATE")) return "risk-yellow";

    return "risk-green";
  };

  const getRiskLabel = (risk) => {
    const value = String(risk).toUpperCase();

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
  Area Status:{" "}
  <span className={`alert ${overviewAlert.toLowerCase()}`}>
    {overviewAlert}
  </span>
</div>

            <div className="status-item">
              <span>Avg WBGT</span>
              <strong>{Number(liveWBGT).toFixed(1)}°C</strong>
            </div>

            <div className="status-item">
              <span>Projected Admissions (+3D)</span>
              <strong>
                +{cityStatus.projectedAdmissions}
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

                  <label>
                    <input
                      type="radio"
                      name="layer"
                      checked={activeLayer === "heat"}
                      onChange={() => setActiveLayer("heat")}
                    />
                    Ward Heat Index
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="layer"
                      checked={activeLayer === "health"}
                      onChange={() => setActiveLayer("health")}
                    />
                    Health Risk Overlay
                  </label>

                  <label>
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

                  {/* Real OpenStreetMap */}
                  <iframe
                    title="Yamnampet Ghatkesar Map"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=78.62%2C17.42%2C78.71%2C17.49&layer=mapnik&marker=17.4547%2C78.6611"
                    className="real-map"
                  />

                  {/* Map overlay */}

                  {activeLayer === "heat" && (
                    <div className="map-overlay heat-map-overlay">
                      <span>HEAT STRESS MONITORING</span>
                    </div>
                  )}

                  {activeLayer === "health" && (
                    <div className="map-overlay health-map-overlay">
                      <span>HEALTH RISK OVERLAY</span>
                    </div>
                  )}

                  {activeLayer === "power" && (
                    <div className="map-overlay power-map-overlay">
                      <span>POWER GRID VULNERABILITY</span>
                    </div>
                  )}

                  <div className="location-marker">
                    <span>●</span>
                    <div>
                      <strong>Yamnampet</strong>
                      <small>Ghatkesar</small>
                    </div>
                  </div>

                  <div className="map-legend">

                    <strong>MAP LEGEND</strong>

                    <div>
                      <span className="legend-dot heat"></span>
                      Heat Stress
                    </div>

                    <div>
                      <span className="legend-dot hospital"></span>
                      Hospital
                    </div>

                    <div>
                      <span className="legend-dot cooling"></span>
                      Cooling Center
                    </div>

                  </div>

                </div>

              </section>


              {/* CURRENT WEATHER */}

              <section className="analytics">

                <div className="card">

                  <h3>METEOROLOGICAL ENGINE</h3>

                  <div className="metrics">

                    <div className="metric">
                      <span>Current Temp</span>
                      <strong>
                        {liveData
                          ? `${liveData.current.temperature}°C`
                          : `${weatherData.temperature}°C`}
                      </strong>
                    </div>

                    <div className="metric">
                      <span>Relative Humidity</span>
                      <strong>
                        {liveData
                          ? `${liveData.current.humidity}%`
                          : `${weatherData.humidity}%`}
                      </strong>
                    </div>

                    <div className="metric">
                      <span>Current WBGT</span>
                      <strong>
                        {liveData
                          ? `${liveData.thermal_stress.wbgt}°C`
                          : `${weatherData.wbgt}°C`}
                      </strong>
                    </div>

                    <div className="metric">
                      <span>UTCI</span>
                      <strong>
                        {weatherData.utci}°C
                      </strong>
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

                      <span>THERMAL RISK</span>

                      <strong>
                        {getRiskLabel(currentRisk)}
                      </strong>

                      <small>
                        Based on current conditions
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

              <div className="card">

                <h3>ML TEMPERATURE PREDICTION</h3>

                <div className="metrics">

                  <div className="metric">
                    <span>Predicted Tomorrow Max</span>

                    <strong>
                      {liveData
                        ? `${liveData.prediction.temperature}°C`
                        : "--"}
                    </strong>
                  </div>

                  <div className="metric">
                    <span>Peak Forecast</span>

                    <strong>
                      {liveData
                        ? `${liveData.forecast.temperature}°C`
                        : "--"}
                    </strong>
                  </div>

                  <div className="metric">
                    <span>Forecast Humidity</span>

                    <strong>
                      {liveData
                        ? `${liveData.forecast.humidity}%`
                        : "--"}
                    </strong>
                  </div>

                </div>

              </div>


              {/* TOMORROW */}

              <div className="card">

                <h3>TOMORROW THERMAL STRESS</h3>

                <div className="metrics">

                  <div className="metric">
                    <span>Tomorrow WBGT</span>

                    <strong>
                      {liveData
                        ? `${liveData.thermal_stress.wbgt}°C`
                        : "--"}
                    </strong>
                  </div>

                  <div className="metric">
                    <span>Risk Level</span>

                    <strong>
                      {liveData
                        ? liveData.thermal_stress.risk
                        : weatherData.riskLevel}
                    </strong>
                  </div>

                  <div className="metric">
                    <span>Peak Time</span>

                    <strong>
                      {liveData
                        ? liveData.peak_time
                        : "--"}
                    </strong>
                  </div>

                </div>

              </div>

            </div>


            {/* HEALTH */}

            <div
              id="health"
              className="health-section"
            >

              <div className="card">

                <h3>HEALTH & SURGE PREDICTION</h3>

                <div className="metrics">

                  <div className="metric">
                    <span>Projected ICU Demand</span>
                    <strong>
                      {healthData.projectedICUDemand}%
                    </strong>
                  </div>

                  <div className="metric">
                    <span>ER Heatstroke Logs</span>
                    <strong>
                      {healthData.erHeatstrokeLogs}
                    </strong>
                  </div>

                  <div className="metric">
                    <span>Ambulance Anomaly</span>
                    <strong>
                      {healthData.ambulanceAnomaly}%
                    </strong>
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

                <h3>ACTION DISPATCH MATRIX</h3>

                <div className="actions">

<button
  onClick={() => {
    setAlertOverride("RED");
    handleAction("HAP Stage 2 activated");
  }}
>
  Trigger HAP Stage 2
</button>

                  <button
                    onClick={() =>
                      handleAction(
                        "IVR Broadcast queued — 1,240 users"
                      )
                    }
                  >
                    Send IVR Broadcast
                  </button>

                  <button
                    onClick={() =>
                      handleAction(
                        "47 ASHA field workers notified"
                      )
                    }
                  >
                    Notify ASHA Network
                  </button>

                  <button
                    onClick={() =>
                      handleAction(
                        "Grid response request dispatched"
                      )
                    }
                  >
                    Adjust Grid Caps
                  </button>

 <button
  onClick={() => {
    setAlertOverride(null);
    setMessage("Alert level reset to live status");
  }}
>
  Reset Alert
</button>

                </div>

                {message && (
                  <div className="action-message">
                    {message}
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