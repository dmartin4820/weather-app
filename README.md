# Weather App
This weather app makes use of Open Weather's One Call and 5 Day Weather Forecast APIs to display the current weather and 5 future day weather for a given city. The user is able to make a search for a single city which is added to the search history to the left side of the page. When the user wants to return to a previously search city, they can do so by clicking the previous searchs which makes a new call to get current estimates for present and future weather. The user may also revisit the page and see the same searched cities. The current app does not allow the user to delete previous searches.

<p align="center">
	<img src="https://media.giphy.com/media/GmJLPBNzeo6enYNkqw/giphy.gif">
<p>

# How it works

### API calls
The app takes the user input and makes 2 API calls: one to 5 Day Weather Forecast API to get the latitude and longitude; the second call is to One Call API to received specific data given the latitude and longitude from the first call. This is necessary if we want the UV index displayed to the user, which is only offered by One Call API, but it requires search by geographic coordinates. 

This project was built from scratch, with the idea given by UC Berkeley Bootcamp.

### 

# Visit the site!
[Weather App](https://dmartin4820.github.io/weather-app)


# Credits
Thank you to the UC Berkeley Bootcamp teaching staff for providing starter code and introducing me to web design.

**References**
* [HTML](https://www.w3schools.com/html/default.asp)
* [CSS](https://www.w3schools.com/css/default.asp)
* [Markdown reference](https://guides.github.com/features/mastering-markdown/)
* [Moment.js](https://momentjs.com/docs/#/use-it/)
* [Bootstrap](https://getbootstrap.com/)
* [Open Weather: One Call Api](https://openweathermap.org/api/one-call-api)
* [Open Weather: 5 day weather forecast](https://openweathermap.org/forecast5)
