import pandas as pd

# Load recent hourly weather data
df = pd.read_csv("recent_weather.csv")

# Convert time to datetime
df["time"] = pd.to_datetime(df["time"])

# Create date column
df["date"] = df["time"].dt.date

# Convert hourly data into daily features
daily = (
    df.groupby("date")
    .agg(
        max_temperature=("temperature_2m", "max"),
        min_temperature=("temperature_2m", "min"),
        avg_temperature=("temperature_2m", "mean"),
        avg_humidity=("relative_humidity_2m", "mean"),
        max_wind_speed=("wind_speed_10m", "max"),
        avg_apparent_temperature=("apparent_temperature", "mean"),
    )
    .reset_index()
)

# Save daily dataset
daily.to_csv("daily_weather.csv", index=False)

print("\nDaily weather dataset created!")
print("Rows:", len(daily))
print("\nLatest daily records:")
print(daily.tail())