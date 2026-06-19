# Atmos – Full Stack Weather Application

## 👤 Author

Shubhika Pradeep

## 📌 Overview

Atmos is a full-stack weather application that provides real-time weather insights for any location. It combines a responsive frontend with a robust backend to deliver accurate weather data, persistent storage, and intelligent user-focused features.

The application is designed not just to display weather, but to enhance user decision-making through contextual insights and improved search experience.

---

## 🚀 Features

### 🌦️ Core Functionality

* Search weather by city name
* Real-time weather data using OpenWeatherMap API
* 5-day weather forecast
* Displays temperature, humidity, wind speed, and "feels like" temperature

### 🔍 Smart Search (Autocomplete)

* Debounced autocomplete suggestions
* Uses OpenWeather Geocoding API
* Displays city + country for accuracy
* Prevents incorrect location mapping

### 🧠 Intelligent Insights

* Contextual suggestions based on weather:

  * Hot → Stay hydrated
  * Rain → Carry an umbrella
  * Cold → Wear warm clothes

### 🗄️ Backend & Database (MongoDB)

* Stores user search history
* RESTful API architecture

### 🔄 CRUD Operations

* Create: Save weather searches
* Read: View search history
* Update: Modify saved entries
* Delete: Remove search records

### ⚠️ Error Handling

* Invalid city handling
* API failure fallback
* User-friendly frontend error messages

---

## 🏗️ Tech Stack

**Frontend**

* Next.js (React)
* Tailwind CSS

**Backend**

* Node.js
* Express.js

**Database**

* MongoDB (Mongoose)

**APIs**

* OpenWeatherMap API
* OpenWeather Geocoding API

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash
git clone <your-repo-link>
cd weather-app
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create `.env` file:

```env
OPENWEATHER_API_KEY=your_api_key
MONGODB_URI=your_mongodb_uri
PORT=5001
```

Run backend:

```bash
npm run dev
```

---

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

---

### 4. Open App

```
http://localhost:4000
```

---

## 🧠 Design Thinking

This project focuses on improving user experience by:

* Reducing input friction through autocomplete
* Preventing ambiguous location selection
* Providing contextual weather insights
* Ensuring resilience with fallback handling

---

## 📹 Demo

(Insert your demo video link here)

---

## 🏢 About PM Accelerator

This project was built as part of the PM Accelerator AI Engineer Technical Assessment. PM Accelerator focuses on helping aspiring product managers and engineers build real-world, impactful products.
