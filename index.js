const axios = require("axios");
const { Telegraf } = require("telegraf");
require('dotenv').config(); 

const TOKEN = process.env.TELEGRAM_TOKEN; // Prende il token da .env
const bot = new Telegraf(TOKEN);

const BASE_URL = `http://api.weatherstack.com/current?access_key=${process.env.WEATHER_API_KEY}&query=`;

const fetchData = async (cityName) => {
  try {
    const res = await axios.get(`${BASE_URL}${encodeURIComponent(cityName)}`);
    return res.data;
  } catch (error) {
    console.error("Errore API:", error);
    return null;
  }
};

bot.start((ctx) => {
  ctx.reply("Ciao, sono WeatherBot! Inserisci il nome di una città per sapere il meteo.");
});

bot.on("text", async (ctx) => {
  const cityName = ctx.message.text;
  if (cityName.startsWith('/')) return;

  const data = await fetchData(cityName);

  if (!data || data.success === false) {
    return ctx.reply("Non sono riuscito a trovare questa città. Riprova inserendo un nome valido.");
  }

  const { current, location } = data;
  const weatherStatus = current.weather_descriptions[0].toLowerCase();

  
  let meteoInItaliano = current.weather_descriptions[0]; // valore di riserva
  let emoji = "❓";

  if (weatherStatus.includes("clear") || weatherStatus.includes("sunny")) {
    meteoInItaliano = "Sereno ☀️";
  } else if (weatherStatus.includes("partly cloudy")) {
    meteoInItaliano = "Parzialmente Nuvoloso ⛅";
  } else if (weatherStatus.includes("cloudy") || weatherStatus.includes("overcast")) {
    meteoInItaliano = "Nuvoloso ☁️";
  } else if (weatherStatus.includes("heavy rain")) {
    meteoInItaliano = "Forte Pioggia 🌧️🌧️";
  } else if (weatherStatus.includes("rain") || weatherStatus.includes("drizzle") || weatherStatus.includes("shower")) {
    meteoInItaliano = "Pioggia 🌧️";
  } else if (weatherStatus.includes("snow")) {
    meteoInItaliano = "Neve ❄️";
  } else if (weatherStatus.includes("mist") || weatherStatus.includes("fog")) {
    meteoInItaliano = "Nebbia 🌫️";
  }

  ctx.reply(
    `🌆 **Città:** ${location.name} (${location.country})\n` +
    `---------------------------\n` +
    `🌡 **Temperatura:** ${current.temperature}°C\n` +
    `💨 **Vento:** ${current.wind_speed} km/h\n` +
    `💧 **Umidità:** ${current.humidity}%\n` +
    `---------------------------\n` +
    `🔮 **Meteo:** ${meteoInItaliano}`
  );
});

bot.launch()
  .then(() => console.log("Bot avviato con successo!"))
  .catch((err) => console.error("Errore nell'avvio:", err));

