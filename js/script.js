let tempChart = null;
// ===============================
// SIGNUP
// ===============================

function signup(){

let name=document.getElementById("name").value;
let email=document.getElementById("email").value;
let password=document.getElementById("password").value;

if(name===""||email===""||password===""){
alert("Please fill all fields");
return;
}

let user={
name:name,
email:email,
password:password
};

localStorage.setItem(email,JSON.stringify(user));

alert("Account created successfully");

window.location.href="index.html";

}

// ===============================
// LOGIN
// ===============================

function login(){

let email=document.getElementById("loginEmail").value;
let password=document.getElementById("loginPassword").value;

let user=JSON.parse(localStorage.getItem(email));

if(user && user.password===password){

localStorage.setItem("currentUser",email);

alert("Login successful");

window.location.href="dashboard.html";

}else{

alert("Invalid email or password");

}

}

// ===============================
// LOGOUT
// ===============================

function logout(){

window.location.href="index.html";

}

// ===============================
// CURRENT WEATHER
// ===============================

async function getWeather(){

let city=document.getElementById("city").value.trim();

if(city===""){
alert("Enter city name");
return;
}

document.getElementById("loadingMessage").innerText="Loading weather...";

let apiKey="8d6aafb543433c06cb2d9abcf8aac55e";

let url=`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;

try{

let response=await fetch(url);
let data=await response.json();

document.getElementById("loadingMessage").innerText="";

if(data.cod!=200){
alert("City not found");
return;
}

document.getElementById("cityName").innerText=data.name;

document.getElementById("temp").innerText="Temperature: "+data.main.temp+" °C";

document.getElementById("condition").innerText="Weather: "+data.weather[0].description;

document.getElementById("humidity").innerText="Humidity: "+data.main.humidity+"%";

document.getElementById("wind").innerText="Wind Speed: "+data.wind.speed+" km/h";

let icon=data.weather[0].icon;

document.getElementById("weatherIcon").src=
`https://openweathermap.org/img/wn/${icon}@2x.png`;

getForecast(city);

updateWeatherBackground(data.weather[0].main);

updateWeatherAnimation(data.weather[0].main);

startLightningStorm(data.weather[0].main);

showWeatherAlert(data);

let lat=data.coord.lat;
let lon=data.coord.lon;

updateMapLocation(lat,lon,data.name,data.main.temp);

}catch(error){

console.log("Weather error",error);

}

}

// ===============================
// FORECAST
// ===============================

async function getForecast(city){

let apiKey="8d6aafb543433c06cb2d9abcf8aac55e";

let url=`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

try{

let response=await fetch(url);

let data=await response.json();

drawTemperatureChart(data);

let forecastDiv=document.getElementById("forecast");

forecastDiv.innerHTML="";

for(let i=0;i<5;i++){

let item=data.list[i*8];

let date=new Date(item.dt_txt).toDateString();

let icon=item.weather[0].icon;

let temp=item.main.temp;

let card=

`<div class="forecast-card">

<p>${date}</p>

<img src="https://openweathermap.org/img/wn/${icon}.png">

<p>${temp} °C</p>

</div>`;

forecastDiv.innerHTML+=card;

}

}catch(error){

console.log("Forecast error");

}

}

// ===============================
// GEOLOCATION WEATHER
// ===============================

function getLocationWeather(){

if(navigator.geolocation){

navigator.geolocation.getCurrentPosition(showPosition);

}

}

async function showPosition(position){

let lat=position.coords.latitude;
let lon=position.coords.longitude;

let apiKey="8d6aafb543433c06cb2d9abcf8aac55e";

let url=`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

let response=await fetch(url);
let data=await response.json();

/* weather data */

document.getElementById("temp").innerText="Temperature: "+data.main.temp+" °C";

document.getElementById("condition").innerText="Weather: "+data.weather[0].description;

document.getElementById("humidity").innerText="Humidity: "+data.main.humidity+"%";

document.getElementById("wind").innerText="Wind Speed: "+data.wind.speed+" km/h";

/* weather icon */

let icon=data.weather[0].icon;

document.getElementById("weatherIcon").src=
`https://openweathermap.org/img/wn/${icon}@2x.png`;
getForecast(data.name);

/* get village name */

showVillageName(lat,lon);

/* update map */

updateMapLocation(lat,lon,data.name,data.main.temp);

}

// ===============================
// DARK MODE
// ===============================

function toggleDarkMode(){

document.body.classList.toggle("dark-mode");

}

// ===============================
// FAVORITE CITIES
// ===============================

function addFavoriteCity(){

let city=document.getElementById("city").value.trim();

let favorites=JSON.parse(localStorage.getItem("favorites"))||[];

if(!favorites.includes(city)){

favorites.push(city);

localStorage.setItem("favorites",JSON.stringify(favorites));

displayFavoriteCities();

}

}

function displayFavoriteCities(){

let favorites=JSON.parse(localStorage.getItem("favorites"))||[];

let container=document.getElementById("favoriteCities");

if(!container) return;

container.innerHTML="";

favorites.forEach(city=>{

let div=document.createElement("div");

div.className="favorite-city";

div.innerText=city;

div.onclick=function(){

document.getElementById("city").value=city;

getWeather();

};

container.appendChild(div);

});

}

window.onload=function(){

displayFavoriteCities();

loadUserProfile();

updateSkyAnimation();

}

// ===============================
// WEATHER ALERT
// ===============================

function showWeatherAlert(data){

let alertBox=document.getElementById("weatherAlert");

if(!alertBox) return;

let weather=data.weather[0].main.toLowerCase();

let temp=data.main.temp;

alertBox.innerHTML="";

if(weather.includes("rain")){

alertBox.innerHTML="🌧 Heavy Rain Warning";

}

else if(weather.includes("snow")){

alertBox.innerHTML="❄ Snow Alert";

}

else if(temp>40){

alertBox.innerHTML="🔥 Heatwave Warning";

}

}

// ===============================
// USER PROFILE
// ===============================

function loadUserProfile(){

let email=localStorage.getItem("currentUser");

if(!email) return;

let user=JSON.parse(localStorage.getItem(email));

document.getElementById("profileName").innerText=user.name;

document.getElementById("profileEmail").innerText=user.email;

}

// ===============================
// MAP
// ===============================

let weatherMap;
let weatherMarker;

function initWeatherMap(){

weatherMap=L.map("weatherMap").setView([20.5937,78.9629],5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{

maxZoom:18

}).addTo(weatherMap);

setTimeout(()=>{

weatherMap.invalidateSize();

},300);

}

function updateMapLocation(lat,lon,city,temp){

if(!weatherMap) return;

weatherMap.invalidateSize();

weatherMap.setView([lat,lon],11);

if(weatherMarker){

weatherMap.removeLayer(weatherMarker);

}

weatherMarker=L.marker([lat,lon]).addTo(weatherMap);

weatherMarker.bindPopup(

city+"<br>Temperature: "+temp+"°C"

).openPopup();

}

document.addEventListener("DOMContentLoaded",function(){

initWeatherMap();

})

// ===============================
// WEATHER BACKGROUND
// ===============================

function updateWeatherBackground(weather){

let bg=document.getElementById("weatherBackground");

if(!bg) return;

bg.className="";

weather=weather.toLowerCase();

if(weather.includes("rain")){

bg.classList.add("rain");

}

else if(weather.includes("snow")){

bg.classList.add("snow");

}

else{

bg.classList.add("sunny");

}

}

// ===============================
// WEATHER ANIMATION
// ===============================

function updateWeatherAnimation(weather){

let container=document.getElementById("weatherAnimation");

if(!container) return;

container.innerHTML="";

weather=weather.toLowerCase();

if(weather.includes("rain")){

for(let i=0;i<80;i++){

let drop=document.createElement("div");

drop.className="rain-drop";

drop.style.left=Math.random()*100+"vw";

container.appendChild(drop);

}

}

}

// ===============================
// LIGHTNING
// ===============================

function triggerLightning(){

let container=document.getElementById("lightningEffect");

let flash=document.createElement("div");

flash.className="lightning-flash";

container.appendChild(flash);

setTimeout(()=>{

flash.remove();

},300);

}

function startLightningStorm(weather){

weather=weather.toLowerCase();

if(weather.includes("thunderstorm")){

setInterval(triggerLightning,4000);

}

}

// ===============================
// SKY ANIMATION
// ===============================

function updateSkyAnimation(){

let sky=document.getElementById("skyAnimation");

if(!sky) return;

sky.innerHTML="";

let hour=new Date().getHours();

if(hour>=6 && hour<=18){

let sun=document.createElement("div");

sun.className="sun";

sky.appendChild(sun);

}

else{

let moon=document.createElement("div");

moon.className="moon";

sky.appendChild(moon);

}

}
// ===============================
// TEMPERATURE GRAPH
// ===============================

function drawTemperatureChart(data){

let labels=[];
let temps=[];

/* take 5 days data */

for(let i=0;i<5;i++){

let item=data.list[i*8];

labels.push(new Date(item.dt_txt).toDateString());

temps.push(item.main.temp);

}

let canvas=document.getElementById("tempChart");

if(!canvas) return;

let ctx=canvas.getContext("2d");

/* destroy old chart */

if(tempChart){
tempChart.destroy();
}

/* create new chart */

tempChart=new Chart(ctx,{

type:"line",

data:{
labels:labels,

datasets:[{

label:"Temperature °C",

data:temps,

borderColor:"#ff5733",

backgroundColor:"rgba(255,87,51,0.2)",

fill:true,

tension:0.4,

pointRadius:5

}]
},

options:{

responsive:true,

plugins:{
legend:{
labels:{
color:"black"
}
}
},

scales:{
x:{
ticks:{
color:"black"
}
},

y:{
ticks:{
color:"black"
}
}
}

}

});

}
// ===============================
// GET EXACT VILLAGE NAME
// ===============================

async function showVillageName(lat,lon){

try{

let url=`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`;

let response=await fetch(url);

let data=await response.json();

let village =
data.address.village ||
data.address.town ||
data.address.city ||
data.address.hamlet ||
data.address.county;

document.getElementById("cityName").innerText=village;

}
catch(error){

console.log("Village detection error");

}

}
