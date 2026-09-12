import requests
import pandas as pd
import joblib
import math

# ============================================================
# LOCATION
# ============================================================
# Approximate center of Yamnampet, Ghatkesar, Telangana
latitude = 17.4547
longitude = 78.6611

# ============================================================
# FETCH WEATHER
# ============================================================
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

    "daily": [
        "temperature_2m_max",
        "temperature_2m_min",
        "relative_humidity_2m_mean",
        "wind_speed_10m_max",
        "shortwave_radiation_sum"
    ],

    "past_days": 6,
    "forecast_days": 2,
    "timezone": "Asia/Kolkata"
}

response = requests.get(url, params=params)
response.raise_for_status()

data = response.json()

# ============================================================
# PREPARE HOURLY DATA
# ============================================================
hourly = pd.DataFrame(data["hourly"])

hourly["time"] = pd.to_datetime(hourly["time"])
hourly["date"] = hourly["time"].dt.date

# ============================================================
# PREPARE DAILY DATA FOR ML
# ============================================================
daily_history = (
    hourly.groupby("date")
    .agg(
        temperature_2m_max=("temperature_2m", "max"),
        temperature_2m_min=("temperature_2m", "min"),
        temperature_2m_mean=("temperature_2m", "mean"),
        relative_humidity_2m_mean=("relative_humidity_2m", "mean"),
        wind_speed_10m_max=("wind_speed_10m", "max"),
        shortwave_radiation_sum=("shortwave_radiation", "sum")
    )
    .reset_index()
)

# ============================================================
# GET THE LAST 5 COMPLETED DAYS
# ============================================================
today = pd.Timestamp.now(tz="Asia/Kolkata").date()

completed_days = daily_history[
    daily_history["date"] < today
]

latest_5 = completed_days.tail(5)

if len(latest_5) < 5:
    raise ValueError("Not enough completed days available for ML prediction.")

# ============================================================
# LOAD TRAINED MODEL
# ============================================================
model = joblib.load("temperature_model.pkl")

# These MUST match the training dataset
features = [
    "temperature_2m_max",
    "temperature_2m_min",
    "temperature_2m_mean",
    "relative_humidity_2m_mean",
    "wind_speed_10m_max",
    "shortwave_radiation_sum"
]

# ============================================================
# CREATE ML INPUT
# ============================================================
input_data = {}

for day in range(5):

    row = latest_5.iloc[day]

    for feature in features:
        input_data[f"day_{day + 1}_{feature}"] = row[feature]

X = pd.DataFrame([input_data])

# ============================================================
# PREDICT TOMORROW'S MAXIMUM TEMPERATURE
# ============================================================
predicted_temperature = model.predict(X)[0]

# ============================================================
# TOMORROW'S DATE
# ============================================================
tomorrow = today + pd.Timedelta(days=1)

# ============================================================
# GET TOMORROW'S FORECAST HOURLY DATA
# ============================================================
tomorrow_data = hourly[
    hourly["date"] == tomorrow
].copy()

if tomorrow_data.empty:
    raise ValueError("Tomorrow's forecast data was not returned by Open-Meteo.")

# ============================================================
# FIND TOMORROW'S PEAK TEMPERATURE HOUR
# ============================================================
peak = tomorrow_data.loc[
    tomorrow_data["temperature_2m"].idxmax()
]

tomorrow_temperature = float(peak["temperature_2m"])
tomorrow_humidity = float(peak["relative_humidity_2m"])
tomorrow_wind = float(peak["wind_speed_10m"])
tomorrow_solar = float(peak["shortwave_radiation"])

# ============================================================
# NATURAL WET-BULB TEMPERATURE
# ============================================================
ta = tomorrow_temperature
rh = tomorrow_humidity
wind = tomorrow_wind
solar = tomorrow_solar

tnwb = (
    ta * math.atan(
        0.151977 * math.sqrt(rh + 8.313659)
    )
    + math.atan(ta + rh)
    - math.atan(rh - 1.676331)
    + 0.00391838 * rh ** 1.5
    * math.atan(0.023101 * rh)
    - 4.686035
)

# ============================================================
# ESTIMATED GLOBE TEMPERATURE
# ============================================================
tg = ta + (0.018 * solar) - (0.3 * wind)

# ============================================================
# ESTIMATED WBGT
# ============================================================
wbgt_value = (
    0.7 * tnwb
    + 0.2 * tg
    + 0.1 * ta
)

# ============================================================
# RISK CLASSIFICATION
# ============================================================
if wbgt_value < 27:
    risk = "LOW"
elif wbgt_value < 29:
    risk = "MODERATE"
elif wbgt_value < 31:
    risk = "HIGH"
else:
    risk = "EXTREME"

# ============================================================
# OUTPUT
# ============================================================
print("\n================================")
print(" UDSS TOMORROW HEAT RISK")
print("================================")

print("\nLOCATION")
print("Yamnampet, Ghatkesar, Telangana")

print("\nML PREDICTION")
print("----------------")
print(
    "Predicted tomorrow maximum temperature:",
    round(predicted_temperature, 2),
    "°C"
)

print("\nTOMORROW FORECAST CONDITIONS")
print("----------------------------")
print("Peak forecast time:", peak["time"])
print("Forecast temperature:", round(tomorrow_temperature, 2), "°C")
print("Humidity:", round(tomorrow_humidity, 2), "%")
print("Wind:", round(tomorrow_wind, 2), "km/h")
print("Solar Radiation:", round(tomorrow_solar, 2), "W/m²")

print("\nTHERMAL STRESS")
print("----------------")
print("Natural Wet-Bulb:", round(tnwb, 2), "°C")
print("Estimated Globe Temperature:", round(tg, 2), "°C")
print("Estimated WBGT:", round(wbgt_value, 2), "°C")
print("RISK LEVEL:", risk)

print("\n================================")
print(" TOMORROW DECISION COMPLETE")
print("================================")