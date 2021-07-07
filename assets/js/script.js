const baseURL = "https://api.openweathermap.org/data/2.5/";
const apiKey = "d26f41c9506e070fd982c25246bad8b8";

const localTime = moment.parseZone();
const localOffsetToUTC = localTime.utcOffset() * 60; //Convert from minutes to seconds
const cityNameSet = new Set(); //Create a set which keeps track of cities in the search history and local storage

console.log(localOffsetToUTC)
//._d.toUTCString();
setInterval(function() {
	localTime.add(1, 'seconds');
}, 1000)


/* searchForCity initialized the page with search history and adds an event listener for when a user 
 * submits a search.
 * 	Inputs: N/A
 * 	Ouputs: N/A
 */
function searchForCity() {
	populateSearchHistory();
	var searchBtn = document.getElementById("search-btn")
	searchBtn.addEventListener('click', getResults);

}

/* populateSearchHistory populates the page with search history from localStorage.
 *	Inputs: N/A
 *	Ouputs: N/A
 */
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

/* getResults takes the search input and calls the chose api to get weather data back. The function
 * also checks whether the search is from the search input or from the user clicking on the previous
 * search items. 
 * 	Inputs: 
 * 		event (object): event given from user interacting with the page elements
 * 	Outputs:
 * 		N/A
 */ 
function getResults(event) {
	var searchInput = document.getElementById("search-input");
	var cityName = searchInput.value.toLowerCase();
	searchInput.value = "";
	
	if (event.target.getAttribute("id") !== "search-btn") {
		cityName = event.target.getAttribute("id");
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

/* getApiResponse creates the url for interacting with the api and getting weather data back.
 * 	Inputs: 
 * 		latitude (Number): geographic coordinate
 * 	       longitude (Number): geographic coordinate
 * 	Outputs:
 * 		   data (promise): promise containing the weather data
 */ 
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

/* getLatLong retrieves the latitude and longitude given a city name to be used in getApiResponse
 * 	Inputs: 
 * 		cityName (String)
 * 	Outputs:
 * 		latLong (Object): Object containing latitude and longitude info.
 */
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

/* Function to take input city name, separte it from the country, then capitalize each first letter in each word.
 * The cityName that is returned is hard-coded to return a city name with US attached to it. This is so that the 
 * results only work for US cities, but this can be made to search in other countries, possibly based around 
 * a drop down menu.
 * 	Inputs:
 *		cityName (String)
 *	Outputs:
 *		cityName (String): The modified cityName is returned with each word in the city having the first letter 
 *				capitalized and the city is attached to a default country, US.
 */
function capitalizeWords(cityName) {
	cityName = cityName.trim();

	var temp = cityName.split(',');
	var tempCityNameArr = temp[0].split(" ");

	for (var i = 0; i < tempCityNameArr.length; i++) {
		tempCityNameArr[i] = tempCityNameArr[i][0].toUpperCase() + tempCityNameArr[i].slice(1);
	}

	cityName = tempCityNameArr.join(" ") + ", US";
	return cityName;
}

/* Function that takes cityName and saves it to local storage and the globally defined set, cityNameSet. The
 * displaying of the previous searches is also done here and the event listeners associated with those searches.
 * The set makes sure that search history items are not duplicated.
 * 	Inputs: 
 * 		cityName (String)
 * 	Outputs:
 * 		N/A
 */
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

/* displayResults does the bulk of the work for getting the current weather and future weather and placing that
 * content on the page. This function is called when previous searches are called, so it first removes any 
 * previously displayed content. The weather data from the api is taken in and the relevant information is 
 * extracted into an object called weatherInfo. The content is placed on the page by going through this 
 * weatherInfo container.
 * 	Inputs: 
 * 		weatherData (Object) 
 * 		cityName (String)
 * 	Outputs:
 * 		N/A
 */
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
	dateEl.setAttribute("id", "date");
	var breakEl = document.createElement("br");

	dateEl.innerHTML = date.format("dddd, MM[/]DD[/]YYYY, h:mm a");

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
		dateHeaderEl.innerHTML = date.format("MM[/]DD[/]YYYY");
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

/* function for removing children of a node
 * 	Inputs:
 *		obj (Object)
 *	Outputs:
 *		N/A
 */
function removeChildren(obj) {
	while (obj.firstChild) {
		obj.removeChild(obj.firstChild);
	}
}

/*Function that uses moment.js to get the current time at the searched location, properly accounting for
 * the offset in timezone uses moment.js.
 * 	Inputs:
 * 		weatherDataUnix (Number): Unix timestamp in local time
 * 		weatherData (Object)
 * 	Outputs:
 * 		date (moment Object): Moment object with the properly shifted time
 */
function getDate(weatherDataUnix, weatherData) {
	//console.log(weatherData)
	var searchTimezoneOffset = weatherData.timezone_offset;

	var searchCurrentTime = moment.unix(weatherDataUnix + searchTimezoneOffset).utc();
	var date = searchCurrentTime//.format("dddd, MM[/]DD[/]YYYY, h:mm a");
	return date;
}

/* Function that creates the url from the code given in the api response data
 * 	Inputs:
 *		weather (Object): weather is the container for the description of the weather
 *	Outputs:
 *		(Array): Array containing URL to retrive icon and the icon description.
 */
function getWeatherIcon(weather) {
	var iconUrl = "http://openweathermap.org/img/wn/" + weather.icon + "@2x.png"
	var iconDescr = weather.description;
	return [iconUrl, iconDescr];
}

searchForCity();
