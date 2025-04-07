const API_KEY = "38b64d931ea106a38a71f9ec1643ba9d";

function getWeather() {
    const city = document.getElementById("cityInput").value.trim();
    if (!city) return;

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== 200) {
                throw new Error(data.message || "Error fetching weather data.");
            }

            document.getElementById("weatherResult").innerHTML = `
                <h2>🌤 Weather in ${data.name}</h2>
                <p><strong>Temperature:</strong> ${data.main.temp} °C</p>
                <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
                <p><strong>Condition:</strong> ${data.weather[0].description}</p>
            `;
        })
        .catch(err => {
            document.getElementById("weatherResult").innerHTML = `<p style="color:red;">${err.message}</p>`;
        });
}
