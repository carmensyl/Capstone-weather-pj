const cityInput = document.querySelector(".city-input");
const goButton = document.querySelector(".go-btn");
const locationButton = document.querySelector(".current-location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const forecastCardsDiv = document.querySelector(".forecast-cards");

const API_KEY = "8e6162145eba6122c871ad9878f29582";

const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0) {
        // current weather
        return `
        <div class="details">
            <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
            <h2>${(weatherItem.main.temp - 273.15).toFixed(0)}°C</h2>
            <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
            <h6>Humidity: ${weatherItem.main.humidity}%</h6>
        </div>
        <div class="icon">
            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
            <h6>${weatherItem.weather[0].description}</h6>
        </div>` ;
    } else {
        // forecast weather
        return `
        <li class="card">
            <h3>${weatherItem.dt_txt.split(" ")[0]}</h3>
            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
            <h2>${(weatherItem.main.temp - 273.15).toFixed(0)}°C</h2>
            <h6>${weatherItem.wind.speed} M/S</h6>
            <h6>${weatherItem.main.humidity}%</h6>
        </li>`;
    }
} 

const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        const uniqueForecastDays =[];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        forecastCardsDiv.innerHTML = "";

        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                forecastCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });
    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!");
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(API_URL).then(response => response.json()).then(data => {
        if(!data.length) return alert(`No coordinates found for ${cityName}`);
        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occurred while fetching the weather coordinates!");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;

            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(API_URL).then(response => response.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() =>{
                alert("An error occured while fetching the city name!");
            });
        },
        error => {
            if(error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        }
    );
}

locationButton.addEventListener("click",getUserCoordinates);
goButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Go" && getCityCoordinates());