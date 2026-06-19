"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Cloud, MapPin, Droplets, Wind, Thermometer, Trash2, Edit2, Check, X } from 'lucide-react';
import { format } from 'date-fns';

export default function WeatherDashboard() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [editCityName, setEditCityName] = useState('');
  
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/history`);
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (!city.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_URL}/cities`, { params: { q: city } });
        setSuggestions(res.data);
        setShowDropdown(true);
      } catch (err) {
        console.error('Failed to fetch suggestions');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [city]);

  const handleSearch = async (e, searchCity = city) => {
    if (e) e.preventDefault();
    if (!searchCity.trim()) return;

    setLoading(true);
    setError('');
    setShowDropdown(false);
    
    try {
      const res = await axios.get(`${API_URL}/weather`, { params: { city: searchCity } });
      setWeatherData(res.data);
      setCity('');
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/history/${id}`);
      fetchHistory();
    } catch (err) {
      console.error('Failed to delete history', err);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditCityName(item.cityName);
  };

  const handleUpdate = async (id) => {
    if (!editCityName.trim()) return;
    try {
      await axios.put(`${API_URL}/history/${id}`, { cityName: editCityName });
      setEditingId(null);
      fetchHistory();
    } catch (err) {
      console.error('Failed to update history', err);
    }
  };

  const current = weatherData?.current;

  const getInsight = (temp, condition) => {
    if (temp > 30) return "Feels hotter than usual, stay hydrated! 💧";
    if (temp < 10) return "Quite cold out there, bundle up! ❄️";
    if (temp >= 20 && temp <= 28 && condition.toLowerCase().includes('clear')) return "Good weather for outdoor activities! ☀️";
    if (condition.toLowerCase().includes('rain')) return "Don't forget your umbrella! ☔";
    return "Have a great day ahead! 🌤️";
  };
  // OpenWeatherMap 5-day forecast returns data every 3 hours (40 items). We pick one per day (every 8th item)
  const forecast = weatherData?.forecast?.list?.filter((item, index) => index % 8 === 0) || [];

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 flex flex-col gap-6">
        <div className="relative w-full">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Search for a city..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-500"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <button 
              type="submit" 
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Search size={20} />}
            </button>
          </form>
          {showDropdown && suggestions.length > 0 && (
            <ul className="absolute top-full left-0 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden z-50 shadow-xl">
              {suggestions.map((s, idx) => (
                <li 
                  key={idx} 
                  onClick={() => {
                    const cityName = `${s.name}${s.state ? `, ${s.state}` : ''}, ${s.country}`;
                    setCity(cityName);
                    handleSearch(null, cityName);
                  }}
                  className="px-4 py-3 hover:bg-slate-700 cursor-pointer text-slate-200 border-b border-slate-700/50 last:border-none flex items-center justify-between"
                >
                  <span>{s.name}{s.state ? `, ${s.state}` : ''}</span>
                  <span className="text-xs text-slate-500 bg-slate-900/50 px-2 py-1 rounded">{s.country}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
            {error}
          </div>
        )}

        {current && (
          <div className="glass-panel rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="flex flex-col gap-2 z-10 text-center md:text-left">
              <div className="flex items-center gap-2 text-slate-300 justify-center md:justify-start">
                <MapPin size={20} className="text-blue-400" />
                <h2 className="text-2xl font-semibold">{current.name}, {current.sys.country}</h2>
              </div>
              <div className="text-7xl font-bold tracking-tighter mt-4">
                {Math.round(current.main.temp)}°
              </div>
              <p className="text-xl text-blue-300 capitalize flex items-center gap-2 justify-center md:justify-start mt-2">
                <Cloud size={24} />
                {current.weather[0].description}
              </p>
              <div className="mt-4 inline-block bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium border border-blue-500/30 w-fit mx-auto md:mx-0">
                ✨ {getInsight(current.main.temp, current.weather[0].main)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 z-10 w-full md:w-auto">
              <div className="bg-slate-800/50 p-4 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400"><Droplets size={24} /></div>
                <div>
                  <p className="text-slate-400 text-sm">Humidity</p>
                  <p className="text-xl font-semibold">{current.main.humidity}%</p>
                </div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><Wind size={24} /></div>
                <div>
                  <p className="text-slate-400 text-sm">Wind Speed</p>
                  <p className="text-xl font-semibold">{current.wind.speed} m/s</p>
                </div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-2xl flex items-center gap-4 col-span-2">
                <div className="p-3 bg-orange-500/20 rounded-xl text-orange-400"><Thermometer size={24} /></div>
                <div className="flex justify-between w-full pr-2">
                  <div>
                    <p className="text-slate-400 text-sm">Feels Like</p>
                    <p className="text-xl font-semibold">{Math.round(current.main.feels_like)}°</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-sm">Min / Max</p>
                    <p className="text-md font-semibold">{Math.round(current.main.temp_min)}° / {Math.round(current.main.temp_max)}°</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {forecast.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-slate-200">5-Day Forecast</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {forecast.map((item, idx) => (
                <div key={idx} className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform duration-300">
                  <p className="text-slate-400 mb-2">{format(new Date(item.dt * 1000), 'EEE, MMM d')}</p>
                  <img 
                    src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`} 
                    alt="weather icon"
                    className="w-16 h-16"
                  />
                  <p className="text-2xl font-bold my-1">{Math.round(item.main.temp)}°</p>
                  <p className="text-sm text-slate-400 capitalize">{item.weather[0].main}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="glass-panel rounded-3xl p-6 h-fit">
        <h3 className="text-lg font-semibold mb-4 text-slate-200 flex items-center gap-2">
          <MapPin size={18} className="text-emerald-400" />
          Recent Searches
        </h3>
        <div className="flex flex-col gap-3">
          {history.length === 0 ? (
            <p className="text-slate-500 text-sm italic">No recent searches.</p>
          ) : (
            history.map((item) => (
              <div key={item._id} className="flex flex-col gap-2 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-700/50 transition-colors">
                {editingId === item._id ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={editCityName}
                      onChange={(e) => setEditCityName(e.target.value)}
                      className="flex-1 bg-slate-900/50 border border-slate-600 rounded-lg px-2 py-1 text-sm text-white focus:outline-none"
                      autoFocus
                    />
                    <button onClick={() => handleUpdate(item._id)} className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded"><Check size={16} /></button>
                    <button onClick={() => setEditingId(null)} className="p-1 text-slate-400 hover:bg-slate-500/20 rounded"><X size={16} /></button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between group">
                    <button onClick={() => handleSearch(null, item.cityName)} className="flex-1 text-left flex justify-between items-center pr-2">
                      <div>
                        <p className="font-medium text-slate-200">{item.cityName}</p>
                        <p className="text-xs text-slate-400 capitalize">{item.condition}</p>
                      </div>
                      <div className="text-lg font-semibold text-blue-300">
                        {Math.round(item.temperature)}°
                      </div>
                    </button>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(item)} className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(item._id)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
