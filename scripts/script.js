/* AngularJS */
var weatherapp = angular.module('weatherApp',['ngSanitize']);
var canvas ,context,sections,xScale,yScale;
/* AngularJS controller*/
weatherapp.controller('weatherController',function($scope,$window,$http){
	/*Hide chart elements onload*/
	this.mainChartHeader = "false";
	this.boxes = "false";
	/* Body onload function to show the weather in Eindhoven*/
	$window.onload = function() {
		$scope.callWeather('Eindhoven','weather');
	};
	/* Function to display sea level chart for Eindhoven */
	$scope.mainViewMore = function(){
		this.mainChartHeader = "true";
		$scope.callWeather("Eindhoven","forecast");
	};
	/* Function to show weather in 5 cities */
	$scope.showWeather = function(city){
		this.boxes = "true";
		document.getElementById("chartHeader").style.display="none";
		$scope.callWeather(city,"weather");
	};
	/* Function to view the sea level for 5 cities  */
	$scope.viewMore = function(){
	document.getElementById("chartHeader").style.display="";
		var city = document.getElementById("cityName").innerHTML;
		$scope.callWeather(city,"forecast");
	};
	/* Function to call the api to get weather
	 * if type is weather , the result gives the weather details for a single day
	 * if type is forecast, the result gives the weather and sea level for 5 days
	 *  */
	$scope.callWeather = function(city,type){
		 var url="http://api.openweathermap.org/data/2.5/"+type+"?q="+city+"&appid=19f7dbc25e517e218133fb8a17df0e9c&units=metric";
		 $http.get(url).success(function(response){
				if(type == "weather"){
					// City name from response
				     var cityName = response["name"];
				     /* Temperature from response
                        concat with ASCII code for degree celsius */
					 var temperatueInDegree = response["main"]["temp"] + " &#8451";
					 /* Weather description from response */
					 var weatherType = response["weather"][0]["description"];
					/* Weather icon image from response
					 * creating image tag with the image icon */
					 var weatherimage = "<img src='http://openweathermap.org/img/w/"+response["weather"][0]["icon"]+".png' class='img-responsive iconStyle' alt='"+response["weather"][0]["main"]+"'>";
					/* Sunrise and sunset time from response
					 * Converting the time to CET format from UTC format
					 * */
					 var sunriseTimeSecond = response["sys"]["sunrise"];
					 var sunriseDate = new Date(sunriseTimeSecond * 1000);
					 var sunriseTime = sunriseDate.toLocaleTimeString();
					 var sunsetTimeSecond =  response["sys"]["sunset"];
					 var sunsetDate = new Date(sunsetTimeSecond * 1000);
					 var sunsetTime = sunsetDate.toLocaleTimeString();
					 /* Setting weather details to view page */
					 if(city == "Eindhoven"){
						 $scope.cityNameMain = cityName;
						 $scope.weatherIconMain = weatherimage ;
						 $scope.temperatureMain = temperatueInDegree;
						 $scope.weatherTypeMain = weatherType;
						 $scope.sunriseMain = sunriseTime;
						 $scope.sunsetMain = sunsetTime;
					 }else{
						 $scope.cityName = cityName;
						 $scope.weatherIcon = weatherimage ;
						 $scope.temperature = temperatueInDegree;
						 $scope.weatherType = weatherType;
						 $scope.sunrise = sunriseTime;
						 $scope.sunset = sunsetTime;
					 }
			    }
			    else{
			    	/* Drawing sea level chart using the response */
					if(city == "Eindhoven"){
						$scope.viewSeaLevel(response,"mainCanvas");
					}else{
						$scope.viewSeaLevel(response,"canvas");
					}
			    }
			}).error(function(){
			 alert("error");
	        });
	};
	/* Function to draw chart using SVG canvas */
	$scope.viewSeaLevel = function(result,graphArea){
			// Function calling to get sea level values from the response into array
			var seaLevelValues = $scope.create_Y_Axix(result);
			var sortedValues = seaLevelValues.sort(function(a, b){return a-b});
			// Setting values for displaying chart
			sections = 5;
			var valMax = 1200;
			var valMin = 800;
			var stepSize = 30;
			var columnSize = 80;
			var rowSize = 80;
			var margin = 5;
			// Function calling to get days from response for displaying in X axis
			var xAxis = $scope.create_X_Axis(result);	
			canvas = document.getElementById(graphArea);
			context = canvas.getContext("2d");
			context.fillStyle = "#0099ff";
			context.font = "18 pt Verdana";
			yScale = (canvas.height - columnSize - margin) / (valMax - valMin);
			xScale = (canvas.width - rowSize) / sections;
			context.strokeStyle="#009933"; // color of grid lines
			context.beginPath();
			// Print parameters on X axis, and grid lines on the graph
			for (i=1;i<=sections;i++) {
				var x = i * xScale;
				context.fillText(xAxis[i], x,columnSize - margin);
				context.moveTo(x, columnSize);
				context.lineTo(x, canvas.height - margin);
			}
			// print parameters on Y axis,and draw horizontal grid lines
			var count =  0;
			for (scale = valMax; scale >= valMin; scale = scale - stepSize) {
				var y = columnSize + (yScale * count * stepSize); 
				context.fillText(scale, margin,y + margin);
				context.moveTo(rowSize,y);
				context.lineTo(canvas.width,y);
				count++;
			}
			context.stroke();
			context.translate(rowSize,canvas.height + valMin * yScale);
			context.scale(1,-1 * yScale);
			// Color of each dataplot items
			context.strokeStyle="#fff";
			// Function calling to plot the graph with the seslevel values
			$scope.plotData(seaLevelValues);
		    };
		    // Function to get days from response for displaying in X axis
		    $scope.create_X_Axis = function (result){
		    	var dateTime;
		    	var date;
		    	var xAxixValues=[];
		    	xAxixValues.push(" ");
		    	for(var i = 0; i < result["list"].length; i++){
		    		dateTime =result["list"][i]["dt_txt"];
		    		date = dateTime.split(" ");
		    		if(xAxixValues.indexOf(date[0]) == -1){
		    			xAxixValues.push(date[0]);
		    		}
		    	}
		    	return xAxixValues;
		    };
		 // Function to get sea level values from the response into array
		    $scope.create_Y_Axix = function (result){
		    	var dateTime;
		    	var date;
		    	var seaLevel;
		    	var yAxixValues=[];
		    	for(var i = 0; i < result["list"].length; i++){
		    		dateTime =result["list"][i]["dt_txt"];
		    		date = dateTime.split(" ");
		    		if(date[1] == "09:00:00"){
		    			seaLevel = result["list"][i]["main"]["sea_level"].toFixed(2);
		    			yAxixValues.push(seaLevel);
		    		}
		    	}
		    	return yAxixValues;
		    };
		 // Function to plot the graph with the seslevel values
		    $scope.plotData  = function (dataSet) {
		    	context.beginPath();
		    	context.moveTo(0, dataSet[0]);
		    	for (i=1;i<sections;i++) {
		    		context.lineTo(i * xScale, dataSet[i]);
		    	}
		    	context.lineWidth=.9;
		    	context.stroke();
		    };
});
