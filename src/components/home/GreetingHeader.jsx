'use client';
import { useState, useEffect } from "react";
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, CloudDrizzle, CloudFog } from "lucide-react";

export default function GreetingHeader({ account }) {
  const [weatherData, setWeatherData] = useState({ baku: null, london: null });
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAllWeather = async () => {
      setLoadingWeather(true);
      try {
        const [bakuRes, londonRes] = await Promise.allSettled([
          fetch('https://api.open-meteo.com/v1/forecast?latitude=40.4093&longitude=49.8671&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=Asia/Baku'),
          fetch('https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=Europe/London'),
        ]);
        const baku   = bakuRes.status   === 'fulfilled' ? await bakuRes.value.json()   : null;
        const london = londonRes.status === 'fulfilled' ? await londonRes.value.json() : null;
        setWeatherData({ baku, london });
      } catch {
        // silent
      } finally {
        setLoadingWeather(false);
      }
    };
    fetchAllWeather();
  }, []);

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getFirstName = () => {
    if (account?.first_name) return account.first_name;
    if (account?.name) return account.name.split(' ')[0];
    return 'there';
  };

  const getMotivationalText = () => {
    const texts = ['', 'Start your week strong!', 'Keep the momentum going!', "You're halfway there!", "Push through, you've got this!", 'Almost weekend, finish strong!', 'Happy Friday! Wrap it up!', 'Enjoy your weekend rest!', 'Recharge for the week ahead!'];
    return texts[currentTime.getDay()];
  };

  const getWeatherIcon = (code) => {
    if (code == null) return <Sun className="h-5 w-5" />;
    if (code === 0)   return <Sun className="h-5 w-5 text-yellow-500" />;
    if (code <= 3)    return <Cloud className="h-5 w-5 text-gray-400" />;
    if (code <= 49)   return <CloudFog className="h-5 w-5 text-gray-400" />;
    if (code <= 59)   return <CloudDrizzle className="h-5 w-5 text-sky-400" />;
    if (code <= 69)   return <CloudRain className="h-5 w-5 text-sky-500" />;
    if (code <= 79)   return <CloudSnow className="h-5 w-5 text-sky-200" />;
    if (code <= 82)   return <CloudRain className="h-5 w-5 text-sky-600" />;
    if (code <= 86)   return <CloudSnow className="h-5 w-5 text-sky-300" />;
    if (code <= 99)   return <CloudLightning className="h-5 w-5 text-yellow-600" />;
    return <Cloud className="h-5 w-5 text-gray-400" />;
  };

  const getWeatherDesc = (code) => {
    if (code == null) return 'N/A';
    if (code === 0)  return 'Clear';
    if (code <= 3)   return 'Cloudy';
    if (code <= 49)  return 'Foggy';
    if (code <= 59)  return 'Drizzle';
    if (code <= 69)  return 'Rain';
    if (code <= 79)  return 'Snow';
    if (code <= 82)  return 'Showers';
    if (code <= 86)  return 'Snow';
    if (code <= 99)  return 'Storm';
    return 'N/A';
  };

  const WeatherCard = ({ data, city, flag }) => {
    if (!data?.current) return (
      <div className="flex items-center gap-2 px-3 py-2 bg-almet-mystic/30 dark:bg-almet-san-juan/20 rounded-xl">
        <span className="text-sm">{flag}</span>
        <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">{city}: N/A</span>
      </div>
    );
    const { temperature_2m, weather_code, wind_speed_10m, relative_humidity_2m } = data.current;
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-white/60 dark:bg-almet-san-juan/30 backdrop-blur-sm rounded-xl border border-almet-mystic/50 dark:border-almet-san-juan/50">
        <span className="text-base">{flag}</span>
        <div className="flex items-center gap-2">
          {getWeatherIcon(weather_code)}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-almet-cloud-burst dark:text-white">{Math.round(temperature_2m)}°C</span>
              <span className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai">{getWeatherDesc(weather_code)}</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] text-almet-waterloo dark:text-almet-bali-hai">
              <span className="flex items-center gap-0.5"><Wind className="h-2.5 w-2.5" />{Math.round(wind_speed_10m)} km/h</span>
              <span className="flex items-center gap-0.5"><Droplets className="h-2.5 w-2.5" />{relative_humidity_2m}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-r from-almet-sapphire via-almet-astral to-almet-steel-blue rounded-2xl p-4 shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/4" />
      </div>
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white mb-1">{getGreeting()}, {getFirstName()}! 👋</h1>
            <p className="text-white text-sm">{getMotivationalText()}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {loadingWeather ? (
              <>
                <div className="h-12 w-48 bg-white/20 rounded-xl animate-pulse" />
                <div className="h-12 w-48 bg-white/20 rounded-xl animate-pulse" />
              </>
            ) : (
              <>
                <WeatherCard data={weatherData.baku}   city="Baku"   flag="🇦🇿" />
                <WeatherCard data={weatherData.london} city="London" flag="🇬🇧" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
