"use strict"; // Defines that JavaScript code should be executed in "strict mode"

//* =================== Get Elements ==================== 

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchLocation");
const findBtn = document.getElementById("findBtn");
const todayWxCardHeader = document.getElementById("todayWxCardHeader");
const todayWxCardBody = document.getElementById("todayWxCardBody");
const futureDaysWx = document.getElementById("futureDaysWx");

// * =================== General Settings ==================

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const compassDirs = 
{
  "E": "East",
  "W": "West",
  "N": "North",
  "S": "South",
  "NNE": "North North East",
  "NE": "North East",
  "ENE": "East North East",
  "ESE": "East South East",
  "SE": "South East",
  "SSE": "South South East",
  "SSW": "South South West",
  "SW": "South West",
  "WSW": "West South West",
  "WNW": "West North West",
  "NW": "North West",
  "NNW": "North North West"
};
const baseURL = "http://api.weatherapi.com/v1";
const apiKey = "7f210e0cb05c46f3a26181416242906";
let currentDate =  new Date();
let currentLatitude;
let currentLongitude;

let getMonthName = (date) => months[date.getMonth()]; // get month name of a given date
let getDayName = (date) => days[date.getDay()]; // get day name of a given date

// & >>>>>>>>>>>>>>>>>> Start App Scenario <<<<<<<<<<<<<<<<
/*
- Once app start, ask user to confirm for sharing the location
- If user reject the location share, then show cairo weather as default location
- If user accepts, then dispaly the current location weather of the user
- Display the today & next two days of the current location
*/

// & >>>>>>>>>>>>>>>>>> User Search Scenario <<<<<<<<<<<<<<<<
/*
- When user is trying to search for location, then run the searchByName function
- If no city founded, then don't update the document
- If founded, get first city matches keywords enterd by user
- Search function will return the city id and pass it to forcast method
- Display the weather of the searched city
*/

// * ================================= Start Of The App =======================


(async function() {

    await displayTodayAndFutureWX("cairo");

    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(onSuccessGeoLocation);
    }else{
        console.log("Geolocation is not supported by this browser.");
    }

})();

//  * ===========================================================================

async function onSuccessGeoLocation(position){
    currentLatitude = position.coords.latitude;
    currentLongitude = position.coords.longitude;
    let cityObj = await getWeatherByLatAndLon(currentLatitude,currentLatitude);
    displayTodayAndFutureWX(null,cityObj);
}


async function searchForLocationByName(cityName){
    /* 
     - search for city by the given name using search endpoint 
     - return the id if city founded otherwise return undefined
    */
    
    let cityId;
    let endpoint = "search.json";
    let queryParams = `q=${cityName}`;
    let url = `${baseURL}/${endpoint}?key=${apiKey}&${queryParams}`;
    let response = await fetch(url);
    
    if (!response.ok) {
        console.log(`Response status: ${response.status}`);
        return;
    }
    let cititesList = await response.json();
    if(cititesList.length > 0){ // there are one or more city contains the search keywords
        cityId = cititesList[0].id;
    }
    return cityId;
}

async function getWeatherByLatAndLon(lat,lon,numOfDays=3){
    // get the weather deatils for the given latitude & longitude
    // this function returns the today and the next num Of Days weather
    // if the numOfDays is 3, this means today and next 2 days 
    let endpoint = "forecast.json";
    let queryParams = `q=${lat},${lon}&days=${numOfDays}`;
    let url = `${baseURL}/${endpoint}?key=${apiKey}&${queryParams}`;

    let response = await fetch(url);
    
    if (!response.ok) {
        return; // don't procced 
    }
    
    let cityObj =await response.json();
    return cityObj;   
}

async function getWeatherByCityId(cid,numOfDays=3){
    // get the weather deatils for the given city id
     // this function returns the today and the next num Of Days weather
    // if the numOfDays is 3, this means today and next 2 days 
    let endpoint = "forecast.json";
    let queryParams = `q=id:${cid}&days=${numOfDays}`;
    let url = `${baseURL}/${endpoint}?key=${apiKey}&${queryParams}`;

    let response = await fetch(url);
    
    if (!response.ok) {
        return; // don't procced 
    }
    
    let cityObj =await response.json();
    return cityObj;   
}

async function displayTodayAndFutureWX( searchVal = null,cityData = undefined){
    let cityObj;
    if(cityData){
       cityObj = cityData;
    }else{
        let cityId = await searchForLocationByName(searchVal);
        cityObj = await getWeatherByCityId(cityId);
    }
    dispalyTodayWX(cityObj);
    dispalyFutureDaysWX(cityObj);
}

function dispalyTodayWX(cityObj){
    /*
    - This function to display the today weather in the home page
    - This function accepts cityObj returned from forcast API
    */
    
    const locationObj = cityObj.location;
    const currentObj = cityObj.current;
    const forcastObj = cityObj.forecast.forecastday[0]; // 0 ==> today 

    let date = new Date(locationObj.localtime);
   

    todayWxCardHeader.innerHTML=`<p>${getDayName(date)}</p>
    <p>
       <span>${date.getDate()}</span> 
       <span>${getMonthName(date)}</span> 
    </p>`

    todayWxCardBody.innerHTML=`
    
    <div class="col-md-5">
        <h2 class="h5 mt-1">${locationObj.name}</h2>
        <div class="d-flex align-items-center flex-column flex-sm-row">
        <h2 class="me-2 h1">${currentObj.temp_c}<sup>o</sup>C</h2>
         <img class="today-wx-icon" src="${currentObj.condition.icon}" alt="${currentObj.condition.text} icon" >
        </div>
        <p class="wx-condition-txt fw-bold">${currentObj.condition.text}</p>
    </div>


   <div class="col-md-6">
        <ul class="list-unstyled today-wx-summary">
            <li>
                <span>Feels Like </span> <span class="pe-2">${currentObj.feelslike_c} <sup>o </sup>C</span>
            </li>
            <li>
                <ul class="list-unstyled d-flex flex-wrap">
                    <li class="me-4">
                        <i class="fa-solid fa-arrow-up me-2"></i> 
                        <span class="me-2">Max</span><span class="me-2">${forcastObj.day.maxtemp_c} <sup>o </sup>C </span>
                    </li>
                    <li>
                        <i class="fa-solid fa-arrow-down me-2"></i><span class="me-2">Min</span>
                        <span >${forcastObj.day.mintemp_c}<sup>o </sup>C </span>
                    </li>
                </ul>
                          
            </li>
            <li class="row gx-0 gy-1">
                <div class="col-sm-6">
                    <i class="fa-solid fa-droplet me-2"></i><span>Humidity</span>
                </div>
                <div class="col-sm-4">
                    <span>${currentObj.humidity} %</span>
                </div>
            </li>
            <li class="row gx-0 gy-1"> 
                <div class="col-sm-6">
                    <span><i class="fa-solid fa-wind me-2"></i>Wind</span>
                </div>
                <div class="col-sm-4">
                    <span>${currentObj.wind_kph} km/h </span>
                </div>    
            </li>
            <li class="row gx-0 gy-1">
                <div class="col-sm-6">
                    <span><i class="fa-regular fa-compass me-2"></i>Wind Direction</span>
                </div>
                <div class="col-sm-4">
                    <span>${compassDirs[currentObj.wind_dir]}</span>
                </div>
                          
            </li>
            <li class="row gx-0 gy-1">
                <div class="col-sm-6">
                    <i class="fa-solid fa-umbrella me-2"></i></i><span>Rain Chance</span><span>
                </div>
                <div class="col-sm-4">
                    <span>${forcastObj.day.daily_chance_of_rain} %</span>
                </div>
            </li>

        </ul>
    </div>

    `;

}

function dispalyFutureDaysWX(cityObj){
    /*
    - This function to display the Future N Days weather in the home page
    - This function accepts cityObj returned from forcast API
    */
    console.log(cityObj);
    let forcastDaysList = cityObj.forecast.forecastday;
    let htmlBox = ``;

    for (let i = 1; i < forcastDaysList.length; i++) { // next 2 days 
         // today index in forcast object is 0, so we need to start from 1
         //  we start from index one to skip today in forcast object 
         
         let forcastObj = forcastDaysList[i];
         console.log(forcastObj);
         let dayObj = forcastObj.day;
         let date = new Date(forcastObj.date);
         htmlBox += `
         <div class="col-md-6">
                  <div class="rounde rounded-2 weather-card ${ (i % 2 != 0 ? 'card-bg-dark':'card-bg-light')} text-center">
                    <div class="rounde rounded-2 ${( i % 2 != 0 ? 'card-header-bg-dark':'card-header-bg-light')} py-1">
                      <p class="m-0">${getDayName(date)}</p>
                    </div>
                    <div class="card-body py-2">
                      <img class="future-wx-icon" src="${dayObj.condition.icon}" alt="${dayObj.condition.text} icon" >
                      <div class="fs-4">
                        <i class="fa-solid fa-arrow-up fs-4"></i> 
                        <span class="fs-4">Max</span>
                        <span class="fs-4">${dayObj.maxtemp_c}<sup>o</sup>C</span>
                      </div>
                      <div class="fs-6 mt-1 secondary-txt">
                        <i class="fa-solid fa-arrow-down"></i>
                        <span>Min </span>
                        <span>${dayObj.mintemp_c} <sup>o</sup>C </span>
                      </div>
                      <p class="wx-condition-txt mt-1">${dayObj.condition.text}</p>
                    </div>
                  </div>
                </div>`;
        
    }
    
    futureDaysWx.innerHTML = htmlBox;

}


// *===================== [ Events Settings ] =========================

searchForm.addEventListener("submit",function(event){
    event.preventDefault();
    displayTodayAndFutureWX(searchInput.value);
});

searchInput.addEventListener("input",async function(){
   await displayTodayAndFutureWX(this.value)
});