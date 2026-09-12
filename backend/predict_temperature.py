import requests
import pandas as pd
import joblib
from datetime import datetime

# Yamnampet, Ghatkesar, Telangana
latitude = 17.4547
longitude = 78.6611

# Open-Meteo API
url = "https://api.open-meteo.com/v1/forecast"

params = {
    "latitude": latitude,
    "longitude": longitude,
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

# Convert hourly data to DataFrame
df = pd.DataFrame(data["hourly"])
df["time"] = pd.to_datetime(df["time"])
df["date"] = df["time"].dt.date

# Today's date
today = datetime.now().date()

# Use only completed previous days
df = df[df["date"] < today]

# Daily weather summary
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

# Take the latest 5 completed days
latest_5 = daily.tail(5)

print("\nLATEST 5 DAYS")
print("-------------")
print(latest_5)

# Load trained model
model = joblib.load("temperature_model.pkl")

# Create input in exactly the same format used during training
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

# Predict next day's maximum temperature
prediction = model.predict(X)[0]

print("\nTEMPERATURE PREDICTION")
print("----------------------")
print("Location: Yamnampet, Ghatkesar")
print("Predicted next-day maximum temperature:",
      round(prediction, 2), "°C")