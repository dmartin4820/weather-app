const baseURL = "https://api.openweathermap.org/data/2.5/";
const apiKey = "d26f41c9506e070fd982c25246bad8b8";

const localTime = moment.parseZone();
const localOffsetToUTC = localTime.utcOffset() * 60; //Convert from minutes to seconds
const cityNameSet = new Set();

console.log(localOffsetToUTC)
//._d.toUTCString();
setInterval(function() {
	localTime.add(1, 'seconds');
}, 1000)

function searchForCity() {
	populateSearchHistory();
	var searchBtn = document.getElementById("search-btn")
	searchBtn.addEventListener('click', getResults);

}

function populateSearchHistory() {
	var cities = JSON.parse(localStorage.getItem("city-names"));
	
	if (cities) {
		for (var i = 0; i < cities.length; i++) {
			var searchHistory = document.getElementById('search-history');
			var searchListEl = document.createElement('li');
			searchListEl.setAttribute("id", cities[i]);
			searchListEl.innerHTML = cities[i];
			searchHistory.appendChild(searchListEl);
			cityNameSet.add(cities[i]);
			searchListEl.addEventListener('click', getResults);
		}
	}
}

function getResults(city) {
	var searchInput = document.getElementById("search-input");
	var cityName = searchInput.value.toLowerCase();
	searchInput.value = "";
	
	if (city.target.getAttribute("id") !== "search-btn") {
		cityName = city.target.getAttribute("id");
	}
	cityName = capitalizeWords(cityName);
	var data = getLatLong(cityName)
		.then(response => getApiResponse(response.lat, response.lon))
		.then(function(response) {
			if (response.cod !== "404") {
				saveSearch(cityName);
				displayResults(response, cityName);
			}
		})
}

async function getApiResponse(latitude, longitude) {
	var fullUrl = baseURL + "onecall?lat=" + latitude + "&lon=" + longitude + "&exclude=hourly,minutely&appid=" + apiKey + "&units=imperial";

	console.log(fullUrl);
	let data = await fetch(fullUrl)
		.then(function(response) {
			//console.log("response", response);

			return response.json();
		})

		.then(function(responseData) {
			console.log("data", responseData);
			return responseData;
		});

	return data;
}

async function getLatLong(cityName) {
	var fullUrl = baseURL + "forecast?q=" + cityName + "&appid=" + apiKey + "&cnt=1";

	let latLong = await fetch(fullUrl)
		.then(function(response) {
			return response.json();
		}) 
		.then(function(responseData) {
			//console.log("data", responseData);
			return responseData.city.coord;
		});

	return latLong;
	
}

function capitalizeWords(cityName) {
	cityName = cityName.trim();

	var temp = cityName.split(',');
	var tempCityNameArr = temp[0].split(" ");

	for (var i = 0; i < tempCityNameArr.length; i++) {
		tempCityNameArr[i] = tempCityNameArr[i][0].toUpperCase() + tempCityNameArr[i].slice(1);
	}

	return tempCityNameArr.join(" ") + ", US" ;
}


function saveSearch(cityName) {
	var searchHistory = document.getElementById('search-history');
	var searchListEl = document.createElement('li');
	searchListEl.setAttribute("id", cityName);

	if (!JSON.parse(localStorage.getItem("city-names"))) {
		localStorage.setItem("city-names", JSON.stringify([cityName]));
		cityNameSet.add(cityName);
		addSearchEl();
	} else {
		var cities = JSON.parse(localStorage.getItem("city-names"));
		if (!cityNameSet.has(cityName)) {
			cities.push(cityName);
			cityNameSet.add(cityName);
			addSearchEl();
			localStorage.setItem("city-names", JSON.stringify(cities));
		}

	}
	function addSearchEl() {
		searchListEl.innerHTML = cityName;
		searchHistory.appendChild(searchListEl);
	}
	searchListEl.addEventListener('click', getResults)
}


function displayResults(weatherData, cityName) {
	var weatherIconContainer = document.getElementsByClassName("weather-icon")[0];
	var weatherInfoList = document.getElementsByClassName("weather-info")[0].firstChild;
	var date = getDate(weatherData.current.dt, weatherData, false);

	//Clear previous
	removeChildren(weatherIconContainer);
	removeChildren(weatherInfoList);


	//Fill city
	var cityNameEl = document.createElement("h2");
	cityNameEl.innerHTML = cityName;
	//Fill date
	var dateEl = document.createElement("h2");
	var breakEl = document.createElement("br");

	dateEl.innerHTML = date;

	weatherIconContainer.appendChild(cityNameEl);
	weatherIconContainer.appendChild(breakEl);
	weatherIconContainer.append(dateEl);

	//Fill icon
	var iconData = getWeatherIcon(weatherData.current.weather[0]);
	var iconUrl = iconData[0];
	var iconDescr = iconData[1];
	var imgEl = document.createElement("img");
	imgEl.setAttribute("src", iconUrl);
	imgEl.setAttribute("alt", iconDescr);

	weatherIconContainer.append(imgEl);


	//Fill weather info
	var weatherInfo = {current: [{name: "Temperature", data: weatherData.current.temp, units: "&degF"}, 
		               {name: "Humidity", data: weatherData.current.humidity, units: "%"},
			       {name: "Wind speed", data: weatherData.current.wind_speed, units: "mi/h"}, 
			       {name: "UV Index", data: weatherData.current.uvi, units: ""},
			       {name: "Time", data: weatherData.current.dt, units: "seconds"}],
			   fiveDay: []};


	for (var i = 1; i < weatherData.daily.length - 2; i++) {
		var singleDayWeather = [{name: "Temperature", data: [weatherData.daily[i].temp.min, weatherData.daily[i].temp.max], units: "&degF"},
				     {name: "Humidity", data: weatherData.daily[i].humidity, units: "%"},
				     {name: "Wind speed", data: weatherData.daily[i].wind_speed, units: "mi/h"},
				     {name: "UV Index", data: weatherData.daily[i].uvi, units: ""},
				     {name: "Time", data: weatherData.daily[i].dt, units: "seconds"},
				     {name: "Icon", data: weatherData.daily[i].weather[0], units: ""}];
		weatherInfo.fiveDay.push(singleDayWeather);   
	}


	var currentDataLength = weatherInfo.current.length;
	for (var i = 0; i < currentDataLength - 1; i++) {
		var listEl = document.createElement("li");
		if (weatherInfo.current[i].name === "UV Index") {
			var spanEl = document.createElement("span");
			var uvi = Number(weatherInfo.current[i].data);
			spanEl.innerHTML = weatherInfo.current[i].data;
			if (uvi > 0 && uvi < 3) {
				spanEl.setAttribute("class", "uvIndex-favorable");
			} else if (uvi >= 3 && uvi < 6) {
				spanEl.setAttribute("class", "uvIndex-moderate");
			} else {
				spanEl.setAttribute("class", "uvIndex-severe");
			}
			listEl.innerHTML = weatherInfo.current[i].name + ": ";

			listEl.appendChild(spanEl);
		}
		else {
			listEl.innerHTML = weatherInfo.current[i].name + ": " + weatherInfo.current[i].data + " " + weatherInfo.current[i].units;
		}
		weatherInfoList.appendChild(listEl);
	}

	//Fill five day
	var fiveDayLength = weatherInfo.fiveDay.length;
	for (var i = 0; i < fiveDayLength; i++) {
		var dayEl = document.getElementById("day-" + i);
		var dateHeaderEl = document.createElement("p");
		var iconEl = document.createElement("img");
		var ul = document.createElement("ul");

		removeChildren(dayEl);

		var date = getDate(weatherInfo.fiveDay[i][4].data, weatherData, true);
		dateHeaderEl.innerHTML = date;
		dayEl.appendChild(dateHeaderEl);

		var iconData = getWeatherIcon(weatherInfo.fiveDay[i][5].data);

		console.log(iconData)
		iconEl.setAttribute("src", iconData[0]);
		iconEl.setAttribute("alt", iconData[1]);
		iconEl.setAttribute("width", "40%");

		dayEl.appendChild(iconEl);

		var minTemp = weatherInfo.fiveDay[i][0].data[0];
		var maxTemp = weatherInfo.fiveDay[i][0].data[1];
		var tempUnits = weatherInfo.fiveDay[i][0].units;
		var minTempEl = document.createElement("li");
		var maxTempEl = document.createElement("li");
		var humEl = document.createElement("li");
		minTempEl.innerHTML = minTemp +  tempUnits + " min"  
		maxTempEl.innerHTML = maxTemp + tempUnits + " max";

		ul.appendChild(minTempEl);
		ul.appendChild(maxTempEl);

		var humidity = weatherInfo.fiveDay[i][1].data;
		var humidityUnits = weatherInfo.fiveDay[i][1].units;
		humEl.innerHTML = "Hum: " + humidity + " " + humidityUnits; 

		ul.appendChild(humEl);
		dayEl.appendChild(ul);
	}
}

function removeChildren(obj) {
	while (obj.firstChild) {
		obj.removeChild(obj.firstChild);
	}
}

function getDate(weatherDataUnix, weatherData, shortDate=true) {
	//console.log(weatherData)
	var searchTimezoneOffset = weatherData.timezone_offset;

	var searchCurrentTime = moment.unix(weatherDataUnix + searchTimezoneOffset).utc();
	if (!shortDate) {
		var date = searchCurrentTime.format("dddd, MM[/]DD[/]YYYY, h:mm a");
	} else {
		var date = searchCurrentTime.format("MM[/]DD[/]YYYY");
	}
	return date;
}

function getWeatherIcon(weather) {
	var iconUrl = "http://openweathermap.org/img/wn/" + weather.icon + "@2x.png"
	var iconDescr = weather.description;
	return [iconUrl, iconDescr];
}

searchForCity();
