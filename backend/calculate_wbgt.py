import requests
import pandas as pd
from pythermalcomfort.models import wbgt

# Yamnampet, Ghatkesar, Telangana
latitude = 17.4547
longitude = 78.6611

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
    "forecast_days": 1,
    "timezone": "Asia/Kolkata"
}

response = requests.get(url, params=params)
response.raise_for_status()

data = response.json()

df = pd.DataFrame(data["hourly"])

# Find today's hottest hour
hottest = df.loc[df["temperature_2m"].idxmax()]

ta = float(hottest["temperature_2m"])
rh = float(hottest["relative_humidity_2m"])
solar = float(hottest["shortwave_radiation"])
wind = float(hottest["wind_speed_10m"])

# Estimate globe temperature from solar radiation and wind.
# This is an approximation because we do not have a measured globe thermometer.
tg = ta + (0.018 * solar) - (0.3 * wind)

# Estimate natural wet-bulb temperature using Stull's approximation.
import math

import math

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
# Outdoor WBGT
wbgt_value = (
    0.7 * tnwb
    + 0.2 * tg
    + 0.1 * ta
)

print("\nOUTDOOR HEAT STRESS")
print("-------------------")
print("Time:", hottest["time"])
print("Temperature:", round(ta, 2), "°C")
print("Humidity:", round(rh, 2), "%")
print("Wind Speed:", round(wind, 2), "km/h")
print("Solar Radiation:", round(solar, 2), "W/m²")

print("\nTHERMAL CALCULATION")
print("-------------------")
print("Estimated Natural Wet-Bulb:", round(tnwb, 2), "°C")
print("Estimated Globe Temperature:", round(tg, 2), "°C")
print("Estimated WBGT:", round(wbgt_value, 2), "°C")

if wbgt_value < 27:
    risk = "LOW"
elif wbgt_value < 29:
    risk = "MODERATE"
elif wbgt_value < 31:
    risk = "HIGH"
else:
    risk = "EXTREME"

print("Risk Level:", risk)