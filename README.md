# 🌡️ UDSS — Unified Decision Support System

> **Localized heat-risk intelligence for vulnerable communities.**
>
> UDSS combines real-time weather data, machine-learning temperature forecasting, thermal-stress analysis, and an interactive command-center dashboard to support heatwave preparedness and response.

---

## 🚨 Overview

**Unified Decision Support System (UDSS)** is a prototype decision-support platform designed to help authorities and emergency-response teams understand and act on localized heat stress.

The system combines:

- 🌦️ Real-time and forecast weather data
- 🤖 Machine-learning temperature prediction
- 🌡️ WBGT-based thermal-stress estimation
- 🗺️ Interactive GIS visualization
- 🏥 Health-risk decision support
- ⚡ Power-grid vulnerability visualization
- 🚑 Emergency action dispatch controls

The pilot prototype focuses on **Yamnampet, Ghatkesar, Telangana**.

---

## 🎯 Problem

Extreme heat can affect communities differently depending on:

- Temperature
- Humidity
- Wind conditions
- Solar radiation
- Population vulnerability
- Healthcare capacity
- Electricity demand

Traditional weather dashboards mainly show weather conditions. They do not provide a unified operational view connecting **weather → thermal stress → risk → response actions**.

UDSS attempts to bridge this gap.

---

## 💡 Our Approach

```text
Weather Data
     ↓
Data Processing
     ↓
5-Day Historical Window
     ↓
Random Forest ML Model
     ↓
Tomorrow's Temperature Prediction
     ↓
Thermal Stress Calculation
     ↓
WBGT-Based Risk Classification
     ↓
UDSS Command Center
     ↓
Decision & Response Actions
