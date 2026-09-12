from flask import Flask, jsonify
from flask_cors import CORS
import requests
import pandas as pd
import joblib
import math

app = Flask(__name__)
CORS(app)

latitude = 17.4547
longitude = 78.6611


@app.route("/api/heat-risk", methods=["GET"])
def heat_risk():

    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": [
            "temperature_2m",
            "relative_humidity_2m",
            "wind_speed_10m",
            "shortwave_radiation"
        ],
        "hourly": [
            "temperature_2m",
            "relative_humidity_2m",
            "wind_speed_10m",
            "shortwave_radiation"
        ],
        "past_days": 6,
        "forecast_days": 2,
        "timezone": "Asia/Kolkata"
    }

    response = requests.get(url, params=params)
    response.raise_for_status()

    data = response.json()

    # ==========================================
    # CURRENT CONDITIONS
    # ==========================================

    current = data["current"]

    current_temperature = float(
        current["temperature_2m"]
    )

    current_humidity = float(
        current["relative_humidity_2m"]
    )

    current_wind = float(
        current["wind_speed_10m"]
    )

    current_solar = float(
        current["shortwave_radiation"]
    )

    current_time = current["time"]

    # ==========================================
    # CURRENT WBGT
    # ==========================================

    current_tnwb = (
        current_temperature * math.atan(
            0.151977 * math.sqrt(
                current_humidity + 8.313659
            )
        )
        + math.atan(
            current_temperature + current_humidity
        )
        - math.atan(
            current_humidity - 1.676331
        )
        + 0.00391838
        * current_humidity ** 1.5
        * math.atan(
            0.023101 * current_humidity
        )
        - 4.686035
    )

    current_globe_temperature = (
        current_temperature
        + (0.018 * current_solar)
        - (0.3 * current_wind)
    )

    current_wbgt = (
        0.7 * current_tnwb
        + 0.2 * current_globe_temperature
        + 0.1 * current_temperature
    )

    if current_wbgt < 27:
        current_risk = "LOW"
    elif current_wbgt < 29:
        current_risk = "MODERATE"
    elif current_wbgt < 31:
        current_risk = "HIGH"
    else:
        current_risk = "EXTREME"

    # ==========================================
    # PREPARE 5-DAY ML INPUT
    # ==========================================

    hourly = pd.DataFrame(data["hourly"])

    hourly["time"] = pd.to_datetime(
        hourly["time"]
    )

    hourly["date"] = hourly["time"].dt.date

    daily_history = (
        hourly.groupby("date")
        .agg(
            temperature_2m_max=(
                "temperature_2m",
                "max"
            ),
            temperature_2m_min=(
                "temperature_2m",
                "min"
            ),
            temperature_2m_mean=(
                "temperature_2m",
                "mean"
            ),
            relative_humidity_2m_mean=(
                "relative_humidity_2m",
                "mean"
            ),
            wind_speed_10m_max=(
                "wind_speed_10m",
                "max"
            ),
            shortwave_radiation_sum=(
                "shortwave_radiation",
                "sum"
            )
        )
        .reset_index()
    )

    today = pd.Timestamp.now(
        tz="Asia/Kolkata"
    ).date()

    completed_days = daily_history[
        daily_history["date"] < today
    ]

    latest_5 = completed_days.tail(5)

    if len(latest_5) < 5:
        return jsonify({
            "success": False,
            "error": "Not enough completed days for ML prediction."
        }), 500

    features = [
        "temperature_2m_max",
        "temperature_2m_min",
        "temperature_2m_mean",
        "relative_humidity_2m_mean",
        "wind_speed_10m_max",
        "shortwave_radiation_sum"
    ]

    input_data = {}

    for day in range(5):

        row = latest_5.iloc[day]

        for feature in features:

            input_data[
                f"day_{day + 1}_{feature}"
            ] = row[feature]

    X = pd.DataFrame([input_data])

    model = joblib.load(
        "temperature_model.pkl"
    )

    predicted_temperature = float(
        model.predict(X)[0]
    )

    # ==========================================
    # TOMORROW FORECAST
    # ==========================================

    tomorrow = today + pd.Timedelta(
        days=1
    )

    tomorrow_data = hourly[
        hourly["date"] == tomorrow
    ].copy()

    if tomorrow_data.empty:
        return jsonify({
            "success": False,
            "error": "Tomorrow forecast not available."
        }), 500

    peak = tomorrow_data.loc[
        tomorrow_data["temperature_2m"].idxmax()
    ]

    tomorrow_temperature = float(
        peak["temperature_2m"]
    )

    tomorrow_humidity = float(
        peak["relative_humidity_2m"]
    )

    tomorrow_wind = float(
        peak["wind_speed_10m"]
    )

    tomorrow_solar = float(
        peak["shortwave_radiation"]
    )

    # ==========================================
    # TOMORROW THERMAL STRESS
    # ==========================================

    tnwb = (
        tomorrow_temperature * math.atan(
            0.151977 * math.sqrt(
                tomorrow_humidity + 8.313659
            )
        )
        + math.atan(
            tomorrow_temperature
            + tomorrow_humidity
        )
        - math.atan(
            tomorrow_humidity - 1.676331
        )
        + 0.00391838
        * tomorrow_humidity ** 1.5
        * math.atan(
            0.023101 * tomorrow_humidity
        )
        - 4.686035
    )

    globe_temperature = (
        tomorrow_temperature
        + (0.018 * tomorrow_solar)
        - (0.3 * tomorrow_wind)
    )

    wbgt = (
        0.7 * tnwb
        + 0.2 * globe_temperature
        + 0.1 * tomorrow_temperature
    )

    if wbgt < 27:
        risk = "LOW"
    elif wbgt < 29:
        risk = "MODERATE"
    elif wbgt < 31:
        risk = "HIGH"
    else:
        risk = "EXTREME"

    # ==========================================
    # FINAL JSON RESPONSE
    # ==========================================

    return jsonify({

        "success": True,

        "location": {
            "name": "Yamnampet, Ghatkesar, Telangana",
            "latitude": latitude,
            "longitude": longitude
        },

        "current": {
            "time": current_time,
            "temperature": round(
                current_temperature,
                2
            ),
            "humidity": round(
                current_humidity,
                2
            ),
            "wind": round(
                current_wind,
                2
            ),
            "solar_radiation": round(
                current_solar,
                2
            ),
            "wbgt": round(
                current_wbgt,
                2
            ),
            "risk": current_risk
        },

        "prediction": {
            "date": str(tomorrow),
            "temperature": round(
                predicted_temperature,
                2
            )
        },

        "forecast": {
            "peak_time": str(
                peak["time"]
            ),
            "temperature": round(
                tomorrow_temperature,
                2
            ),
            "humidity": round(
                tomorrow_humidity,
                2
            ),
            "wind": round(
                tomorrow_wind,
                2
            ),
            "solar_radiation": round(
                tomorrow_solar,
                2
            )
        },

        "thermal_stress": {
            "natural_wet_bulb": round(
                tnwb,
                2
            ),
            "globe_temperature": round(
                globe_temperature,
                2
            ),
            "wbgt": round(
                wbgt,
                2
            ),
            "risk": risk
        }
    })


@app.route("/api/health", methods=["GET"])
def health():

    return jsonify({
        "status": "UDSS backend running"
    })
@app.route("/api/temperature-history", methods=["GET"])
def temperature_history():

    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": [
            "temperature_2m"
        ],
        "past_days": 6,
        "forecast_days": 1,
        "timezone": "Asia/Kolkata"
    }

    response = requests.get(url, params=params)
    response.raise_for_status()

    data = response.json()

    hourly = pd.DataFrame(data["hourly"])
    hourly["time"] = pd.to_datetime(hourly["time"])
    hourly["date"] = hourly["time"].dt.date

    today = pd.Timestamp.now(
        tz="Asia/Kolkata"
    ).date()

    completed_days = hourly[
        hourly["date"] < today
    ]

    daily = (
        completed_days
        .groupby("date")
        .agg(
            max_temperature=("temperature_2m", "max")
        )
        .reset_index()
        .tail(5)
    )

    return jsonify({
        "success": True,
        "history": [
            {
                "date": str(row["date"]),
                "temperature": round(
                    float(row["max_temperature"]), 2
                )
            }
            for _, row in daily.iterrows()
        ]
    })


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )