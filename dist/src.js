const currentTemperature = document.getElementById('currentTemp');
const weatherIcon = document.getElementById('weatherIcon');
const weatherDescription = document.getElementById('weatherDescription');
const windSpeed = document.getElementById('wind');
const windDirection = document.getElementById('windDir');
const lowestToday = document.getElementById('lowestToday');
const highestToday = document.getElementById('highestToday');
const pressure = document.getElementById('pressure');
const humidity = document.getElementById('humidity')
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');
const sunriseRelative = document.getElementById('sunriseRelative');
const sunsetRelative = document.getElementById('sunsetRelative');
const userLocation = document.getElementById('location');
const time = document.getElementById('time');
const date = document.getElementById('date');
const searchInput = document.getElementById('searchInput');

// Create an array of month names
const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const getWeatherData = async (loc) => {

  try {
    // console.log(loc)
    let currentLoc=null;
    if(loc!=null)
       {
        currentLoc=await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${loc.coords.latitude}+${loc.coords.longitude}&key=e230a923526c4008a22a3a76ebac83db`).then(resp=>resp.json()).then(jsn=>{return(jsn.results[0].components.city);});
      //  console.log(h);
      }
    const city = searchInput.value || currentLoc || 'Delhi';

    // Create 2 promises that call the APIs and pass in the city name
    // If the user haven't typed anything, use Los Angeles as default
    const currentWeather = new Promise(async (resolve, reject) => {
      try {
        const weatherApiData = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=8109965e7254a469d08a746e8b210e1e&units=imperial`,
        );

        resolve(await weatherApiData.json());
      } catch (error) {
        reject();
      }
    });

    const forecast = new Promise(async (resolve, reject) => {
      try {
        const forecastApiData = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=8109965e7254a469d08a746e8b210e1e&units=imperial&cnt=10`,
        );

        resolve(await forecastApiData.json());
      } catch (error) {
        reject();
      }
    });

    // Using the Promise.all method, wait for both promises to resolve, and save the returned data in a variable
    const data = await Promise.all([currentWeather, forecast]);
    // console.log(data[0].cod);
    if(data[0].cod==404){
      searchInput.value="";
      searchInput.placeholder=data[0].message.toUpperCase();}
    // Now pass that data into the updateDom() function
    updateDom(data);

  } catch (error) {
    console.log(error);
  }
}

// Create a function that returns a cardinal direction based on the degree passed in
// Hint: Draw a Circle and Visualize each Direction First. It will help... A ton!
const getDirection = deg => {
  switch (true) {
    case deg < 22.5:
      return 'N'
    case deg < 67.5:
      return 'NE'
    case deg < 112.5:
      return 'E'
    case deg < 157.5:
      return 'SE'
    case deg < 202.5:
      return 'S'
    case deg < 247.5:
      return 'SW'
    case deg < 292.5:
      return 'W'
    case deg < 337.5:
      return 'NW'
  }
};


const updateDom = data => {
  currentTemperature.innerText = data[0].main.temp;

  // console.log(data[0].weather[0].icon);
  
  weatherIcon.src = `https://openweathermap.org/img/wn/${data[0].weather[0].icon}@2x.png`;

  // Description of the Current Weather
  weatherDescription.innerText = data[0].weather[0].main;

  // Wind Speed
  windSpeed.innerText = data[0].wind.speed;

  // Wind Direction (Use the getDirection function)
  windDirection.innerText = getDirection(data[0].wind.deg);

  // Lowest Temperature of the Day
  lowestToday.innerText = data[0].main.temp_min;

  // Highest Temperature of the Day
  highestToday.innerText = data[0].main.temp_max;

  // Pressure
  pressure.innerText = data[0].main.pressure;

  // Humidity
  humidity.innerText = data[0].main.humidity;

  // Save both Sunrise and Sunset time in a variable as Milliseconds
  // Hint: the data from the API is in seconds
  const sunriseTs = new Date(data[0].sys.sunrise * 1000);
  const sunsetTs = new Date(data[0].sys.sunset * 1000);

  // Use the Sunrise Time in Milliseconds to get Sunrise Time
  // use the .toLocaleString() method to get the time in a readable format
  sunrise.innerText = sunriseTs.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
  });

  // Do the same for Sunset
  sunset.innerText = sunsetTs.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
  });

  // Using timeago.js, create relative timestamps for both sunrise and sunset
  sunriseRelative.innerText = timeago.format(sunriseTs);
  sunsetRelative.innerText = timeago.format(sunsetTs);

  // Get the location of the user from the API (When you type, it's probably not formatted)
  userLocation.innerText = data[0].name;

  // Get and format Current Time
  setInterval(()=>{
    time.innerText = new Date(Date.now()).toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
    })
  },1000);

  // Get and format Current Date
  date.innerText = new Date(Date.now()).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Call the renderChart function and pass in the list array of the 2nd object in the data array
  renderChart(data[1].list);
}

// Create a function that renders the chart
const renderChart = data => {
  // Store the DOM element that will hold the chart
  const myChart = echarts.init(document.getElementById('chart'));

  const option = {
    legend: {
      data: ['temperature'],
    },
    tooltip: {},
    xAxis: {
      data: data.map(item => item.dt_txt),
    },
    yAxis: {},
    series: [
      {
        type: 'line',
        smooth: true,
        areaStyle: {
          opacity: 0.5,
        },
        data: data.map(item => item.main.temp),
      },
    ],
  };

  // Using the given function from the documentation, generate the chart using the options above
  myChart.setOption(option);
}
const callGetWeatherData=()=>{
  getWeatherData(null);
}
// Call the getWeatherData function
navigator.geolocation.getCurrentPosition(getWeatherData,callGetWeatherData);
// getWeatherData();