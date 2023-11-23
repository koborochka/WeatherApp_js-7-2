import { getWeatherApi } from "./api.js";

const showWeatherButton = document.querySelector('.but-show-weather');
const loadingIndicator = document.querySelector('.loading-indicator');

function showWeatherCard() {
    const weatherCard = document.querySelector('.weather-card');
    weatherCard.style.display = 'block'; 
}

async function getWeather() {
    const latitude = document.querySelector('.latitude').value;
    const longitude = document.querySelector('.longitude').value;

    checkExceptions(latitude, longitude);

    const apiKey = getWeatherApi();
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

    try {
        loadingIndicator.style.display = 'block';

        const response = await fetch(apiUrl);
        const weather = await response.json();

        if (weather.length === 0) {
            alert(`No coordinates found for latitude=${latitude} and longitude=${longitude}`);
        } else {
            console.log(weather); // вот это удалить надо потом
            await getWeatherParameters(weather);
            showWeatherCard();
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
    finally {
        loadingIndicator.style.display = 'none';
    }
}

function checkExceptions(latitude, longitude) {
    if (!latitude || !longitude || Math.abs(latitude) > 90 || Math.abs(longitude) > 180)
        alert("Широта должна быть от -90 до 90, долгота - от -180 до 180. Поля не могут оставаться пустыми.")
}

async function getWeatherParameters(currentWeather) {
    document.querySelector('.weather-card__temperature')
        .textContent = `Температура: ${Math.round(currentWeather['main']['temp'] - 273)}°C`;
    document.querySelector('.weather-card__humidity')
        .textContent = `Влажность: ${currentWeather['main']['humidity']}%`;
    document.querySelector('.weather-card__wind')
        .textContent = `Ветер: ${currentWeather['wind']['speed']} м/с`;
    const place = currentWeather.name;
    document.querySelector('.weather-card__location-and-time')
        .textContent = place === "" ? `Вне населенного пункта, какое-то время` : place + ', какое-то время'
    const weatherPic = document.querySelector('.weather-card__weather-pic');
    weatherPic.src = ` https://openweathermap.org/img/wn/${currentWeather['weather'][0]['icon']}@2x.png`;
    weatherPic.style.transform = 'scale(2)';
}

showWeatherButton.addEventListener("click", getWeather);
