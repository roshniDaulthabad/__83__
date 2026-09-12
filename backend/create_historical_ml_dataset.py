import pandas as pd

# Load historical weather data
df = pd.read_csv("yamnampet_weather.csv")

# Convert date column
df["time"] = pd.to_datetime(df["time"])

# Sort by date
df = df.sort_values("time").reset_index(drop=True)

features = [
    "temperature_2m_max",
    "temperature_2m_min",
    "temperature_2m_mean",
    "relative_humidity_2m_mean",
    "wind_speed_10m_max",
    "shortwave_radiation_sum"
]

rows = []

# 5 previous days -> next day
for i in range(5, len(df)):
    row = {}

    # Use previous 5 days as input
    for day in range(5):
        previous = df.iloc[i - 5 + day]

        for feature in features:
            row[f"day_{day + 1}_{feature}"] = previous[feature]

    # Next day's maximum temperature = target
    row["target_temperature"] = df.iloc[i]["temperature_2m_max"]
    row["target_date"] = df.iloc[i]["time"].date()

    rows.append(row)

ml_df = pd.DataFrame(rows)

# Save training dataset
ml_df.to_csv("historical_ml_training_data.csv", index=False)

print("\nHistorical ML dataset created!")
print("Training examples:", len(ml_df))
print("Features + target:", len(ml_df.columns))

print("\nFirst example:")
print(ml_df.iloc[0])

print("\nLatest example:")
print(ml_df.iloc[-1])