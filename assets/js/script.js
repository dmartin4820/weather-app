const baseURL = "https://api.openweathermap.org/data/2.5/";
const apiKey = "d26f41c9506e070fd982c25246bad8b8";

async function getApiResponse(latitude, longitude) {
	var fullUrl = baseURL + "onecall?lat=" + latitude + "&lon=" + longitude + "&exclude=hourly,minutely&appid=" + apiKey;

	console.log(fullUrl);
	let data = await fetch(fullUrl)
		.then(function(response) {
			console.log("response", response);

			return response.json();
		})

		.then(function(responseData) {
			console.log("data", responseData);
			return responseData;
		});

	return data;
}

function getWeatherIcon(iconCode) {
	//create html elements and place on the weather card with correct link to url
	console.log("icon", iconCode)
}

var data = getApiResponse(33.44,-94.04);
data.then(function(data){
	getWeatherIcon(data.current.weather[0].icon);
});
//console.log(icon);