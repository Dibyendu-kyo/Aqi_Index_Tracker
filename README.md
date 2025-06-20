🌫️ AQI Radar – Know Your Air Quality
AQI Radar is a real-time, location-based React application that visualizes air quality using the AQICN API. It alerts users about hazardous air conditions and shows nearby pollution hotspots on an interactive map using Leaflet.js.

<br>
📸 Demo Preview

Interactive map with AQI markers and top polluted areas sidebar.

🚀 Features
✅ Real-time AQI visualization using official AQICN API.

✅ Map-based display with color-coded markers (green to purple based on AQI levels).

✅ Voice alert for AQI > 200 — warns users to wear masks.

✅ Top 5 polluted areas sidebar sorted dynamically.

✅ Search any city manually via OpenCage Geocoding API.

✅ Responsive layout – works on both desktop and mobile.

✅ Custom branding header and styled UI for clean presentation.

🛠️ Tech Stack
Frontend	APIs Used	Libraries
React (CRA)	AQICN API	Leaflet.js
HTML/CSS	OpenCage Geocoding API	React Leaflet
JavaScript		Axios, Web Speech API

📦 Installation Guide
1. Clone the Repository
bash
Copy
Edit
git clone https://github.com/your-username/aqi-radar.git
cd aqi-radar
2. Install Dependencies
bash
Copy
Edit
npm install
3. Setup Environment Variables
Create a .env file in the root directory:

env
Copy
Edit
REACT_APP_AQICN_TOKEN=your_aqicn_api_key_here
REACT_APP_GEOCODE_API_KEY=your_opencage_api_key_here
Get your AQICN API Key from: https://aqicn.org/data-platform/token/

Get OpenCage API Key from: https://opencagedata.com/

4. Run the App
bash
Copy
Edit
npm start
Visit http://localhost:3000 in your browser.

🔍 How It Works
Component	Responsibility
AqiMap.jsx	Fetches AQI and geolocation data, renders map and UI
AQICircle.jsx	Renders custom circle markers with popups
MapAutoCenter	Automatically zooms to user or searched city
AqiMap.css	Responsive, styled layout and design

🎯 Marker Legend
AQI Range	Color	Health Meaning
0–50	Green	Excellent
51–100	Yellow	Good
101–150	Orange	Moderate
151–200	Red	Unhealthy
201+	Purple	Very Unhealthy

🔊 Audio Alerts
Once any nearby AQI > 200, users will hear a voice alert.

The alert plays only once per region to avoid spam.

Resets when location changes.
