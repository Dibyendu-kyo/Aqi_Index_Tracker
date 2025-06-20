import React, { useEffect, useState, useRef } from "react";
import { CircleMarker } from "react-leaflet";
import "./AqiMap.css"

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import axios from "axios";

// Color-coded icons
const getAqiIcon = (aqi) => {
  let iconUrl = "";
  if (aqi <= 50) iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png";
  else if (aqi <= 100) iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png";
  else if (aqi <= 150) iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png";
  else if (aqi <= 200) iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png";
  else iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png";

  return new L.Icon({
    iconUrl,
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

const AQICircle = ({ station }) => {
  const map = useMap();

  const center = [station.lat, station.lon];
  const color =
    station.aqi > 200 ? "purple" :
    station.aqi > 150 ? "red" :
    station.aqi > 100 ? "orange" :
    station.aqi > 50 ? "yellow" : "green";

  const handleZoom = () => {
    map.setView(center, 15, { animate: true }); // 🎯 Zoom-in on click
  };

  return (
    <>
    
      {/* Outer ring */}
      <CircleMarker
        center={center}
        radius={25}
        pathOptions={{ color, fillOpacity: 0.2, weight: 2 }}
        eventHandlers={{ click: handleZoom }}
      />

      {/* Inner core */}
      <CircleMarker
        center={center}
        radius={8}
        pathOptions={{ color, fillColor: color, fillOpacity: 0.9, weight: 1 }}
        eventHandlers={{ click: handleZoom }}
      >
        <Popup>
  <div style={{ textAlign: "center" }}>
    <b>{station.station.name}</b><br />
    AQI: {station.aqi}<br />
    <span className="aqi-badge" style={{
      backgroundColor:
        station.aqi > 200 ? "#800080" :
        station.aqi > 150 ? "#cc0000" :
        station.aqi > 100 ? "#ff8c00" :
        station.aqi > 50 ? "#ffcc00" : "#2ecc71",
      color: "white"
    }}>
      {station.aqi > 200 ? "Very Unhealthy" :
       station.aqi > 150 ? "Unhealthy" :
       station.aqi > 100 ? "Moderate" :
       station.aqi > 50 ? "Good" : "Excellent"}
    </span>
  </div>
</Popup>

      </CircleMarker>
    </>
  );
};

// Auto-center on location change
const MapAutoCenter = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 12);
  }, [coords, map]);
  return null;
};

const AqiMap = () => {
  const [aqiStations, setAqiStations] = useState([]);
  const [userLocation, setUserLocation] = useState([28.6139, 77.209]); // Default Delhi
  const [manualLocation, setManualLocation] = useState("");
  const audioPlayedRef = useRef(false); // Avoid repeating audio

  const playAudioAlert = () => {
    if (!audioPlayedRef.current) {
      const msg = new SpeechSynthesisUtterance("Warning! The air quality is very unhealthy. Please wear a mask.");
      msg.lang = "en-IN";
      speechSynthesis.speak(msg);
      audioPlayedRef.current = true;
    }
  };

  const fetchAQI = async (lat, lon) => {
    const token = process.env.REACT_APP_AQICN_TOKEN;
    const radius = 1.0;

    const url = `https://api.waqi.info/map/bounds/?token=${token}&latlng=${lat - radius},${lon - radius},${lat + radius},${lon + radius}`;

    try {
      const res = await axios.get(url);
      if (res.data?.data) {
        const validStations = res.data.data
          .filter((station) => station.aqi !== "-" && !isNaN(Number(station.aqi)))
          .map((station) => ({
            ...station,
            aqi: Number(station.aqi),
          }))
          .filter((station) => station.aqi > 100);

        setAqiStations(validStations);

        // 🔊 Audio alert if AQI > 200
        if (validStations.some((s) => s.aqi > 200)) {
          playAudioAlert();
        } else {
          audioPlayedRef.current = false; // Reset if no extreme pollution
        }
      }
    } catch (error) {
      console.error("AQI Fetch Error:", error);
    }
  };

  const fetchCoordinatesFromCity = async (city) => {
  const apiKey = process.env.REACT_APP_GEOCODE_API_KEY;
  try {
    const res = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${apiKey}`
    );

    if (res.data?.results?.length > 0) {
      const { lat, lng } = res.data.results[0].geometry;
      const coords = [lat, lng];
      setUserLocation(coords);
      audioPlayedRef.current = false; // ✅ Reset speech flag
      fetchAQI(lat, lng);
    } else {
      alert("Location not found");
    }
  } catch (error) {
    console.error("Geocoding Error:", error);
    alert("Failed to fetch location");
  }
};


  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const coords = [latitude, longitude];
        setUserLocation(coords);
        fetchAQI(latitude, longitude);
      },
      () => {
        fetchAQI(userLocation[0], userLocation[1]); // fallback default
      }
    );
  }, []);

  // ⏳ Auto-refresh AQI every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAQI(userLocation[0], userLocation[1]);
    }, 300000); // 5 min = 300000ms

    return () => clearInterval(interval);
  }, [userLocation]);

  // 🧾 Top 5 most polluted
  const topStations = [...aqiStations]
    .sort((a, b) => b.aqi - a.aqi)
    .slice(0, 5);

  return (
    <>
    <div className="app-header">
  🌫️ <span className="brand-name">AQI Radar</span> – Know Your Air Quality
</div>

    <div className="app-container">
      {/* 🧾 Sidebar */}
      <div className="sidebar">
  <h3>😷 Top 5 Polluted Areas</h3>
  {topStations.length > 0 ? (
    <ul>
      {topStations.map((station, i) => (
        <li key={i}>
          <b>{station.station.name}</b><br />
          AQI: <span style={{ color: station.aqi > 200 ? "red" : "orange" }}>{station.aqi}</span>
        </li>
      ))}
    </ul>
  ) : (
    <p style={{ textAlign: "center" }}>Loading...</p>
  )}

  <div className="search-bar">
    <input
      type="text"
      placeholder="Search city (e.g., Bengaluru)"
      value={manualLocation}
      onChange={(e) => setManualLocation(e.target.value)}
    />
    <button onClick={() => fetchCoordinatesFromCity(manualLocation)}>
      🔍 Search
    </button>
  </div>
</div>

      {/* 🗺️ Map */}
      <div style={{ flex: 1 }}>
        <MapContainer center={userLocation} zoom={11} style={{ height: "100%", width: "100%" }}>
          <MapAutoCenter coords={userLocation} />
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {aqiStations.map((station, index) => (
  <AQICircle key={index} station={station} />
))}

        </MapContainer>
      </div>
    </div>
    </>
  );
};

export default AqiMap;
