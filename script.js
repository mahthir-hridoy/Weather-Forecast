const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
const apiKey = "0bc3ccd36b628ca5ad17f70a62dec7c9";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const temperature = document.getElementById("temperature");
const cityName = document.getElementById("cityName");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const weatherIcon = document.getElementById("weatherIcon");
const suggestionBox = document.getElementById("suggestions");

const tempBtn = document.getElementById("tempBtn");
const hourBtn = document.getElementById("hourBtn");
const rainBtn = document.getElementById("rainBtn");

tempBtn.addEventListener("click", () => {
    tempBtn.classList.add("active");
    rainBtn.classList.remove("active");
    hourBtn.classList.remove("active");
    drawChart(
        chartLabels,
        chartTemperatures,
        chartTimestamps,
        "Temperature (°C)",
        "#00d4ff"
    );
});
rainBtn.addEventListener("click", () => {
    rainBtn.classList.add("active");
    tempBtn.classList.remove("active");
    hourBtn.classList.remove("active");
    drawChart(
        chartLabels,
        chartRainChance,
        chartTimestamps,
        "Rain Chance (%)",
        "#4CAF50"
    );
});

let selectedIndex = -1;
let weatherChart;
const graphTooltip = document.getElementById("graphTooltip");

let forecastData = [];
let chartLabels = [];
let chartTemperatures = [];
let chartRainChance = [];
let chartTimestamps = [];

cityInput.addEventListener("input", () => {
    getSuggestions(cityInput.value.trim());
});

document.addEventListener("click",(e)=>{
    if(!e.target.closest(".search-wrapper")){
        suggestionBox.style.display="none";
    }
});



async function getWeather(city){
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if(data.cod !== 200) {
        alert("City not found!");
        return;
    }
    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);

    document.getElementById("sunrise").textContent =
        sunrise.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    document.getElementById("sunset").textContent =
        sunset.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    temperature.innerHTML = Math.round(data.main.temp) + "°C";
    document.getElementById("feelsLike").textContent = "Feels Like " + Math.round(data.main.feels_like) + "°C";
    cityName.innerHTML = data.name;
    description.innerHTML = data.weather[0].description;
    humidity.innerHTML = data.main.humidity + "%";
    wind.innerHTML = data.wind.speed + " km/h";

    const windArrow = document.getElementById("windArrow");
    const windDirectionText = document.getElementById("windDirectionText");
    windArrow.style.transform = `translateX(-50%) rotate(${data.wind.deg}deg)`;
    windDirectionText.innerHTML = data.wind.deg + "°";

    document.getElementById("visibility").textContent = (data.visibility / 1000) + " km";
    document.getElementById("pressure").textContent = data.main.pressure + " hPa";
    console.log(data);
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    const weather = data.weather[0].main;

    switch(weather){

        case "Clear":
            document.body.style.backgroundImage =
            "url('assets/backgrounds/clear.jpg')";
            break;

        case "Clouds":
            document.body.style.backgroundImage =
            "url('assets/backgrounds/cloudy.jpg')";
            break;

        case "Rain":
        case "Drizzle":
            document.body.style.backgroundImage =
            "url('assets/backgrounds/rain.jpg')";
            break;

        case "Thunderstorm":
            document.body.style.backgroundImage =
            "url('assets/backgrounds/thunder.jpg')";
            break;

        case "Snow":
            document.body.style.backgroundImage =
            "url('assets/backgrounds/snow.jpg')";
            break;

        case "Mist":
        case "Fog":
        case "Haze":
            document.body.style.backgroundImage =
            "url('assets/backgrounds/mist.jpg')";
            break;

        default:
            document.body.style.backgroundImage =
            "url('assets/backgrounds/clear.jpg')";
    }

    getForecast(city);
    console.log(data);
}

async function getSuggestions(query) {
    console.log("Searching:", query);
    if (query.length < 2) {
        suggestionBox.style.display = "none";
        return;
    }
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`;
    const response = await fetch(url);
    const cities = await response.json();
    suggestionBox.innerHTML = "";
    selectedIndex = -1;
    if (cities.length === 0) {
        suggestionBox.style.display = "none";
        return;
    }
    cities.forEach(city => {
        const item = document.createElement("div");
        const country = regionNames.of(city.country);
        item.textContent = `📍 ${city.name}, ${country}`;
        item.onclick = () => {
            cityInput.value = city.name;
            suggestionBox.style.display = "none";
            selectedIndex = -1;
            getWeather(city.name);
        };
        suggestionBox.appendChild(item);
    });
    suggestionBox.style.display = "block";
}

function updateSelection(){
    const items = suggestionBox.querySelectorAll("div");
    items.forEach((item,index)=>{
        item.classList.toggle(
            "suggestion-active",
            index===selectedIndex
        );
        if (index === selectedIndex) {
            item.scrollIntoView({
                block: "nearest"
            });
        }
    });
}

searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if(city){
        getWeather(city);
    }
});

cityInput.addEventListener("keydown",(e)=>{
    const items = suggestionBox.querySelectorAll("div");
    if(e.key==="ArrowDown"){
        e.preventDefault();
        if(selectedIndex<items.length-1){
            selectedIndex++;
            updateSelection();
        }
    }
    else if(e.key==="ArrowUp"){
        e.preventDefault();
        if(selectedIndex>0){
            selectedIndex--;
            updateSelection();
        }
    }
    else if(e.key==="Enter"){
        e.preventDefault();
        if(selectedIndex>=0){
            items[selectedIndex].click();
        }
        else{
            const city=cityInput.value.trim();
            if(city){
                getWeather(city);
            }
        }
    }
});

async function getForecast(city){
    const url =`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    console.log(data.list[0]);

    forecastData = data.list;
    const labels = [];
    const temperatures = [];
    const timestamps = [];
    const rainChance = [];

    data.list.slice(0, 8).forEach(item => {
        labels.push(item.dt_txt.slice(11,16));
        temperatures.push(item.main.temp);
        timestamps.push(new Date(item.dt_txt).getTime());
        rainChance.push(item.pop * 100);
    });

    chartLabels = labels;
    chartTemperatures = temperatures;
    chartRainChance = rainChance;
    chartTimestamps = timestamps;

    drawChart(
        labels,
        temperatures,
        timestamps,
        "Temperature (°C)",
        "#00d4ff"
    );
}

function drawChart(labels, data, timestamps, label, color) {
    const ctx = document.getElementById("weatherChart").getContext("2d");
    if (weatherChart) {
        weatherChart.destroy();
    }
    weatherChart = new Chart(ctx, {
        type: "line",
        data:{
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: color,
                backgroundColor: color + "33",
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 5,
                pointHoverRadius: 8
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins:{
                legend:{
                    display:false
                },

                tooltip:{
                    enabled:false
                },
            },
            scales: {
                x:{
                    ticks:{ color: "white" },
                    grid:{ color: "rgba(255,255,255,.15)" }
                },
                y:{
                    min: label === "Rain Chance (%)" ? 0 : undefined,
                    max: label === "Rain Chance (%)" ? 100 : undefined,
                    ticks:{
                        color:"white",
                        callback:function(value){
                            if(label === "Rain Chance (%)"){
                                return value + "%";
                            }
                            return value;
                        }
                    },
                    grid:{
                        color:"rgba(255,255,255,.15)"
                    }
                }
            }
        }
    });
    const canvas = document.getElementById("weatherChart");
    canvas.onmousemove = function(e){
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const chartArea = weatherChart.chartArea;

        const margin = 12;
        if ( x < chartArea.left - margin || x > chartArea.right + margin
        ) {
            graphTooltip.style.display = "none";
            return;
        }

        let percent = (x - chartArea.left) / (chartArea.right - chartArea.left);
        percent = Math.max(0, Math.min(1, percent));
        
        const totalSegments = data.length - 1;
        const exactPosition = percent * totalSegments;
        const leftIndex = Math.max(0, Math.floor(exactPosition));
        const rightIndex = Math.min(leftIndex + 1, data.length - 1);
        const t = Math.max(0, Math.min(1, exactPosition - leftIndex));
        
        const interpolatedTemp = data[leftIndex] + (data[rightIndex] - data[leftIndex]) * t;
        const interpolatedTime = timestamps[leftIndex] + (timestamps[rightIndex] - timestamps[leftIndex]) * t;       
        
        console.log("temp:", interpolatedTemp);

        const date = new Date(interpolatedTime);
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const period = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;

        if (hours === 0) {
            hours = 12;
        }
        const timeText = `${hours}:${minutes} ${period}`;

        graphTooltip.style.display = "block";
        graphTooltip.style.left = `${x}px`;
        graphTooltip.style.top = `${chartArea.top + 20}px`;
        
        if(label === "Rain Chance (%)"){
            graphTooltip.innerHTML = `
            🕒 : ${timeText}<br>
            🌧 : ${interpolatedTemp.toFixed(0)}%
            `;
        }else{
            graphTooltip.innerHTML = `
            🕒 : ${timeText}<br>
            🌡 : ${interpolatedTemp.toFixed(1)}°C
            `;
        }

        console.log("time:", timeText);
    };

    canvas.addEventListener("mouseenter", () => {
        graphTooltip.style.display = "block";
    });
    canvas.addEventListener("mouseleave", () => {
        graphTooltip.style.display = "none";
    });
}
