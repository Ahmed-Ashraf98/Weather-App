"use strict"; // Defines that JavaScript code should be executed in "strict mode"

//* =================== Get Elements ==================== 

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchLocation");
const findBtn = document.getElementById("findBtn");
const todayWeather = document.getElementById("todayWeather");
const todayWxCardHeader = document.getElementById("todayWxCardHeader");
const todayWxCardBody = document.getElementById("todayWxCardBody");
const futureDaysWx = document.getElementById("futureDaysWx");
const loader = document.getElementById("loader");
const togglerBtn =document.getElementById("togglerBtn");
const collabseNavbar = document.getElementById("collabseNavbar");

// * =================== General Settings ==================
const defaultLocation = "cairo";
const monthsList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
const daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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
let locationAccessAllowed = false;


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

// * ============================== [ Tools ] ==================================

let getMonthName = (date) => monthsList[date.getMonth()]; // get month name of a given date
let getDayName = (date) => daysList[date.getDay()]; // get day name of a given date
let cityIdIsValid = (cid) => cid != undefined; // this to check if the searchForLocationByName method returned an id or not
let cityObjValid = (cObj) => cObj != undefined; // this to check if the method [ searchForLocationByName , ] returned an object or undefined

// * ===================== [ Start Of The App ] =======================


(async function() {
    showLoader();
    let cityObj =  await getFullWeatherDataByName(defaultLocation);
    
    if(cityObjValid(cityObj)){
        dispalyTodayAndFutureWX(cityObj);
    }

    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(onSuccessGeoLocation);
    }else{
        console.log("Geolocation is not supported by this browser.");
    }

})();

async function onSuccessGeoLocation(position){
    currentLatitude = position.coords.latitude;
    currentLongitude = position.coords.longitude;
    locationAccessAllowed = true;
    let cityObj = await getWeatherByLatAndLon(currentLatitude,currentLatitude);
    hideLoader();
    if(cityObjValid(cityObj)){
        dispalyTodayAndFutureWX(cityObj);
    }
    
}


//  * ============================== [ API Methods ] ==========================================


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
        console.log(`Response status: ${response.statusText}`);
        return;
    }

    let cititesList = await response.json();

    if(cititesList.length > 0){ // there are one or more city match the search keywords
        cityId = cititesList[0].id; // take first city from the list that match the search keywords
        showLoader(); // start loading until retrieving the full data from getWeatherByCityId function
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
        console.log(`Response status: ${response.statusText}`);
        return; //TODO:  if response from API not OK, don't procced and exit 
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
        console.log(`Response status: ${response.statusText}`);
        return; //TODO:  if response from API not OK, don't procced and exit 
    }
    
    let cityObj =await response.json();
    return cityObj;   
}


// * =================== [ Get Data Section ] =======================================

async function getFullWeatherDataByName(searchVal){
    
    let cityId = await searchForLocationByName(searchVal);
    if(!cityIdIsValid(cityId)){
        console.log("The id is undefined", cityId)
        return;
    }
    let cityObj = await getWeatherByCityId(cityId);
    return cityObj;
}

async function getWeatherFromInput(inputVal){

    let cityObj;
   // - In case the search input is empty, display the current city in case geo location is enabled [ Location Access Allowed ]
    
   if(inputVal == "" && locationAccessAllowed){ 
        cityObj = await getWeatherByLatAndLon(currentLatitude,currentLatitude);
    }else if( inputVal == "" && !locationAccessAllowed ){
    // - if Location Access Not Allowed, get our default location [ cairo ]
        cityObj = await getFullWeatherDataByName(defaultLocation);
    }       
    else{
    // if input is not empty, then try search for the city.
        cityObj = await getFullWeatherDataByName(inputVal); 
    }
    console.log(cityObj)
    return cityObj;
}

// * =================== [ Display Data Section ] =======================================

function dispalyTodayAndFutureWX(cityObj){
    hideLoader();
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
                <span class="me-2"> Feels Like : </span> <span >${currentObj.feelslike_c} <sup>o </sup>C</span>
            </li>
            <li>
                <ul class="list-unstyled d-flex flex-wrap">
                    <li class="me-4">
                        <i class="fa-solid fa-arrow-up me-2"></i> 
                        <span class="me-2">Max</span><span class="me-2">${forcastObj.day.maxtemp_c} <sup>o </sup>C </span>
                    </li>
                    <li>
                        <i class="fa-solid fa-arrow-down me-2"></i><span class="me-2">Min : </span>
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

    let forcastDaysList = cityObj.forecast.forecastday;
    let htmlBox = ``;

    for (let i = 1; i < forcastDaysList.length; i++) { // next 2 days 
         // today index in forcast object is 0, so we need to start from 1
         //  we start from index one to skip today in forcast object 
         
         let forcastObj = forcastDaysList[i];
         let dayObj = forcastObj.day;
         let date = new Date(forcastObj.date);
         htmlBox += `
         <div class="col-md-6">
                  <div class="shadow-sm rounde rounded-2 weather-card ${ (i % 2 != 0 ? 'card-bg-dark':'card-bg-light')} text-center">
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


//* ===================== [ Loading Section ] ============================================

function hideWeatherSections(){
    todayWeather.classList.remove("d-block");
    futureDaysWx.classList.remove("row");
    todayWeather.classList.add("d-none");
    futureDaysWx.classList.add("d-none");

}

function showWeatherSections(){
    todayWeather.classList.remove("d-none");
    futureDaysWx.classList.remove("d-none");
    todayWeather.classList.add("d-block");
    futureDaysWx.classList.add("row");
}


function showLoader(){
    // This function will show the loader and hide the Today & Future sections in home page until the data is returned from API endpoint
    hideWeatherSections();
    loader.classList.remove("d-none");
    loader.classList.add("inline-block");
    
}

function hideLoader(){
    // This function will hide the loader and dispaly the Today & Future sections in home page when the data is returned from API endpoint
    loader.classList.remove("inline-block");
    loader.classList.add("d-none");
    showWeatherSections();
}

// *===================== [ Events Settings ] =========================

searchForm.addEventListener("submit",async function(event){
    event.preventDefault(); // disable default behaviour of form submit
    let cityObj = await getWeatherFromInput(searchInput.value);
    if(cityIdIsValid(cityObj)){
        dispalyTodayAndFutureWX(cityObj);
    }
});

searchInput.addEventListener("input",async function(){
    let cityObj = await getWeatherFromInput(this.value);
    if(cityIdIsValid(cityObj)){
        dispalyTodayAndFutureWX(cityObj);
    }
});


