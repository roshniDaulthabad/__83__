import requests
import pandas as pd

# Yamnampet, Ghatkesar, Telangana
latitude = 17.4547
longitude = 78.6611

url = "https://api.open-meteo.com/v1/forecast"

params = {
    "latitude": latitude,
    "longitude": longitude,
    "current": [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "wind_speed_10m"
    ],
    "hourly": [
        "temperature_2m",
        "relative_humidity_2m",
        "wind_speed_10m",
        "apparent_temperature"
    ],
    "past_days": 5,
    "forecast_days": 1,
    "timezone": "Asia/Kolkata"
}

response = requests.get(url, params=params)
response.raise_for_status()

data = response.json()

# Current weather
current = data["current"]

print("\nCURRENT YAMNAMPET WEATHER")
print("-------------------------")
print("Time:", current["time"])
print("Temperature:", current["temperature_2m"], "°C")
print("Humidity:", current["relative_humidity_2m"], "%")
print("Apparent Temperature:", current["apparent_temperature"], "°C")
print("Wind Speed:", current["wind_speed_10m"], "km/h")

# Previous 5 days + today's hourly data
hourly = pd.DataFrame(data["hourly"])

hourly.to_csv("recent_weather.csv", index=False)

print("\nRecent weather data saved!")
print("Rows:", len(hourly))
print(hourly.tail(10))