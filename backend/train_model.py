import pandas as pd
import joblib

from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Load training dataset
df = pd.read_csv("historical_ml_training_data.csv")

# Remove date column
X = df.drop(columns=["target_temperature", "target_date"])
y = df["target_temperature"]

# Split data
# shuffle=False keeps the time order, which is important for weather data
split = int(len(df) * 0.8)

X_train = X.iloc[:split]
X_test = X.iloc[split:]

y_train = y.iloc[:split]
y_test = y.iloc[split:]

# Create model
model = RandomForestRegressor(
    n_estimators=200,
    random_state=42
)

# Train
model.fit(X_train, y_train)

# Predict test data
predictions = model.predict(X_test)

# Evaluation
mae = mean_absolute_error(y_test, predictions)
rmse = mean_squared_error(y_test, predictions) ** 0.5
r2 = r2_score(y_test, predictions)

print("\nMODEL TRAINING COMPLETE")
print("-----------------------")
print("Training examples:", len(X_train))
print("Testing examples:", len(X_test))

print("\nMODEL PERFORMANCE")
print("-----------------")
print("MAE:", round(mae, 2), "°C")
print("RMSE:", round(rmse, 2), "°C")
print("R² Score:", round(r2, 3))

# Save trained model
joblib.dump(model, "temperature_model.pkl")

print("\nModel saved as: temperature_model.pkl")