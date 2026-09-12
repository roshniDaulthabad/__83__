import requests
import pandas as pd
import joblib
import math

# -----------------------------
# LOCATION
# -----------------------------
# Yamnampet, Ghatkesar, Telangana
latitude = 17.4547
longitude = 78.6611

# -----------------------------
# FETCH WEATHER
# -----------------------------
url = "https://api.open-meteo.com/v1/forecast"

params = {
    "latitude": latitude,
    "longitude": longitude,

    # CURRENT WEATHER
    "current": [
        "temperature_2m",
        "relative_humidity_2m",
        "wind_speed_10m",
        "shortwave_radiation"
    ],

    # HOURLY WEATHER
    "hourly": [
        "temperature_2m",
        "relative_humidity_2m",
        "wind_speed_10m",
        "shortwave_radiation"
    ],

    "past_days": 6,
    "forecast_days": 1,
    "timezone": "Asia/Kolkata"
}

response = requests.get(url, params=params)
response.raise_for_status()

data = response.json()

# -----------------------------
# HOURLY DATA
# -----------------------------
df = pd.DataFrame(data["hourly"])

df["time"] = pd.to_datetime(df["time"])
df["date"] = df["time"].dt.date

# -----------------------------
# DAILY DATA FOR ML
# -----------------------------
daily = (
    df.groupby("date")
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

# -----------------------------
# LATEST 5 COMPLETED DAYS
# -----------------------------
# The API returns past days + today.
# Exclude the final/current day for ML input.

latest_5 = daily.iloc[-6:-1]

print("\nLATEST 5 DAYS USED FOR ML")
print("-------------------------")
print(latest_5)

# -----------------------------
# ML PREDICTION
# -----------------------------
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
        input_data[f"day_{day + 1}_{feature}"] = row[feature]

X = pd.DataFrame([input_data])

# Load trained model
model = joblib.load("temperature_model.pkl")

# Predict next-day maximum temperature
predicted_temperature = model.predict(X)[0]

# -----------------------------
# CURRENT WEATHER
# -----------------------------
# Use Open-Meteo's CURRENT data directly.
# Do NOT select the hottest hour from the past 6 days.

current = data["current"]

current_time = current["time"]

ta = float(current["temperature_2m"])
rh = float(current["relative_humidity_2m"])
wind = float(current["wind_speed_10m"])
solar = float(current["shortwave_radiation"])

# -----------------------------
# NATURAL WET-BULB ESTIMATE
# -----------------------------
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

# -----------------------------
# GLOBE TEMPERATURE ESTIMATE
# -----------------------------
tg = ta + (0.018 * solar) - (0.3 * wind)

# -----------------------------
# WBGT
# -----------------------------
wbgt_value = (
    0.7 * tnwb
    + 0.2 * tg
    + 0.1 * ta
)

# -----------------------------
# RISK CLASSIFICATION
# -----------------------------
if wbgt_value < 27:
    risk = "LOW"
elif wbgt_value < 29:
    risk = "MODERATE"
elif wbgt_value < 31:
    risk = "HIGH"
else:
    risk = "EXTREME"

# -----------------------------
# FINAL OUTPUT
# -----------------------------
print("\n================================")
print(" UDSS HEAT RISK ENGINE")
print("================================")

print("\nLOCATION")
print("Yamnampet, Ghatkesar, Telangana")

print("\nML PREDICTION")
print("----------------")
print(
    "Predicted next-day maximum temperature:",
    round(predicted_temperature, 2),
    "°C"
)

print("\nCURRENT HEAT CONDITIONS")
print("-----------------------")
print("Time:", current_time)
print("Temperature:", round(ta, 2), "°C")
print("Humidity:", round(rh, 2), "%")
print("Wind:", round(wind, 2), "km/h")
print("Solar Radiation:", round(solar, 2), "W/m²")

print("\nTHERMAL STRESS")
print("----------------")
print("Natural Wet-Bulb:", round(tnwb, 2), "°C")
print("Estimated Globe Temperature:", round(tg, 2), "°C")
print("Estimated WBGT:", round(wbgt_value, 2), "°C")
print("RISK LEVEL:", risk)

print("\n================================")
print(" DECISION ENGINE COMPLETE")
print("================================")