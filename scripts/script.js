import { getWeatherApi } from "./api.js";

const showWeatherButton = document.querySelector('.but-show-weather');
const loadingIndicator = document.querySelector('.loading-indicator');
const mainContent = document.querySelector('.main-content');

let mapIsShown = false;
let map;

async function getWeather() {
    const latitude = document.querySelector('.latitude').value;
    const longitude = document.querySelector('.longitude').value;
    try {
        checkExceptions(latitude, longitude);
        const apiKey = getWeatherApi();
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
        mainContent.style.display = 'none';
        loadingIndicator.style.display = 'block';

        const response = await fetch(apiUrl);
        const weatherData = await response.json();

        if (!weatherData || Object.keys(weatherData).length === 0) {
            alert(`Не нашлось данных о погоде для широты=${latitude} и долготы=${longitude}`);
        } else {
            console.log(weatherData); // вот это удалить надо потом
            await getWeatherParameters(weatherData);
            loadMap(latitude,longitude);
            mainContent.style.display = 'block';
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
    finally {
        loadingIndicator.style.display = 'none';
    }
}

function checkExceptions(latitude, longitude) {
    if (!latitude || !longitude || Math.abs(latitude) > 90 || Math.abs(longitude) > 180){
        alert("Широта должна быть от -90 до 90, долгота - от -180 до 180. Поля не могут оставаться пустыми.");
        throw new Error("Введены неверные данные");
    }
}

async function getWeatherParameters(currentWeather) {
    document.querySelector('.main-content__weather-card__temperature')
        .textContent = `Температура: ${Math.round(currentWeather['main']['temp'] - 273)}°C`;
    document.querySelector('.main-content__weather-card__humidity')
        .textContent = `Влажность: ${currentWeather['main']['humidity']}%`;
    document.querySelector('.main-content__weather-card__wind')
        .textContent = `Ветер: ${currentWeather['wind']['speed']} м/с`;
    const place = currentWeather.name;
    const curLocalTime = (await getCurTime(currentWeather)).toString();
    document.querySelector('.main-content__weather-card__location-and-time')
        .textContent = place === "" ? `Вне населенного пункта, ` + curLocalTime : place + ', ' + curLocalTime;
    const weatherPic = document.querySelector('.main-content__weather-card__weather-pic');
    weatherPic.src = ` https://openweathermap.org/img/wn/${currentWeather['weather'][0]['icon']}@2x.png`;
    weatherPic.style.transform = 'scale(2)';
}


async function getCurTime(data){
    try {
        const response = await fetch('http://worldtimeapi.org/api/timezone/Europe/London');

        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status}`);
        }

        const utcTimeData = await response.json();

        const utcTime = utcTimeData['datetime']
        const shiftTime = data['timezone'];

        const dateWithoutTimezoneUTC = new Date(utcTime.replace('T', ' ').replace(/\+.*$/, ''));
        const shiftedTime = new Date( dateWithoutTimezoneUTC.getTime() + (shiftTime * 1000) );
        return shiftedTime.toTimeString().slice(0,5);
    }
    catch (error) {
        console.error('Fetch error:', error);
    }
}

function loadMap(latitude, longitude) {
    function init() {
        if (mapIsShown) {
            map.destroy();
        }
        map = new ymaps.Map("map", {
            center: [latitude, longitude],
            zoom: 10
        });
        mapIsShown = true;

        map.controls.remove('geolocationControl');
        map.controls.remove('searchControl');
        map.controls.remove('trafficControl');
        map.controls.remove('typeSelector');
        map.controls.remove('fullscreenControl');
        map.controls.remove('zoomControl');
        map.controls.remove('rulerControl');
    }

    ymaps.ready(init);
}

showWeatherButton.addEventListener("click", getWeather);
