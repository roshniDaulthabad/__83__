import pandas as pd

# Load daily weather data
df = pd.read_csv("daily_weather.csv")

# Make sure data is sorted by date
df = df.sort_values("date").reset_index(drop=True)

features = [
    "max_temperature",
    "min_temperature",
    "avg_temperature",
    "avg_humidity",
    "max_wind_speed",
    "avg_apparent_temperature"
]

rows = []

# 5 previous days -> next day
for i in range(5, len(df)):
    row = {}

    # Previous 5 days
    for day in range(5):
        previous = df.iloc[i - 5 + day]

        for feature in features:
            row[f"day_{day + 1}_{feature}"] = previous[feature]

    # Target = next day's maximum temperature
    row["target_temperature"] = df.iloc[i]["max_temperature"]
    row["target_date"] = df.iloc[i]["date"]

    rows.append(row)

ml_df = pd.DataFrame(rows)

ml_df.to_csv("ml_training_data.csv", index=False)

print("\nML training dataset created!")
print("Rows:", len(ml_df))
print("Columns:", len(ml_df.columns))

print("\nFirst training example:")
print(ml_df.iloc[0])

print("\nLatest training example:")
print(ml_df.iloc[-1])