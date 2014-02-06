/**
* Use the W3C Geolocation API to retrieve geographic information about 
* the user's current location.
*
* @param params (PositionOptions) -  This is an optional parameter that 
*        contains three attributes: enableHighAccuracy (boolean), timeout (long), 
*        maximumAge (long).  For more information, see http://dev.w3.org/geo/api/spec-source.html#position-options
*/
function getPosition(params)
{
	try
	{
		clearOutput();
		
		//First test to verify that the browser supports the Geolocation API
		if (navigator.geolocation !== null)
		{
			//Configure optional parameters
			var options;
			if (params)
			{
				options = eval("options = " + params + ";");
			} 
			else {
				// Uncomment the following line to retrieve the most accurate coordinates available
				// options = { enableHighAccuracy : true, timeout : 60000, maximumAge : 0 };
			}
			navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError, options);
		} 
		else {
			errorMessage("HTML5 geolocation is not supported.");
		}
	} 
	catch (e) {
		errorMessage("exception (getPosition): " + e);
	}
}

/**
 * Calculates the  distance between two location coordinates.  There are various ways 
 * of implementing proximity detection.  This method uses trigonometry and the 
 * Haversine formula to calculate the distance between two points 
 * (current & target location) on a spehere (Earth).
 *
 * @param current_lat - horizontal position (negative = South) of current location
 * @param current_lon - vertical position (negative = West) of current location
 * @param target_lat  - horizontal position (negative = South) of destination location
 * @param target_lat  - vertical position (negative = West) of destination location
 */
function distanceBetweenPoints(current_lat, current_lon, target_lat, target_lon)
{
	var distance = 0;
	try
	{
		//Radius of the earth in meters:
		var earth_radius = 6378137;
		
		//Calculate the distance, in radians, between each of the points of latitude/longitude:
		var distance_lat = (target_lat - current_lat) * Math.PI / 180;
		var distance_lon = (target_lon - current_lon) * Math.PI / 180;

		//Using the haversine formula, calculate the distance between two points (current & target coordinates) on a sphere (earth):
		//More info: http://www.movable-type.co.uk/scripts/latlong.html
		var a = Math.pow(Math.sin(distance_lat / 2), 2) + (Math.cos(current_lat * Math.PI / 180) * Math.cos(target_lat * Math.PI / 180) * Math.pow(Math.sin(distance_lon / 2), 2));
		var b = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		distance = Math.floor(earth_radius * b);
	} 
	catch (e) {
		errorMessage("exception (distanceBetweenPoints): " + e);
	}
	return distance;
}


/**
 * Displays the location information retrieved from the geolocation service.
 *
 * @param coords (Coordinates) - geographic information returned from geolocation service
 *      http://dev.w3.org/geo/api/spec-source.html#coordinates
 */
function displayLocationInfo(coordinates)
{
	try
	{
		var lat = coordinates.latitude;
		var lon = coordinates.longitude;
		var alt = coordinates.altitude;

		var locationInfo = ""; // "<h3>My current location:</h3>";
		locationInfo += "<b>Latitude:</b> " + coordinates.latitude + "<br/>";
		locationInfo += "<b>Longitude:</b> " + coordinates.longitude + "<br/>";
		//locationInfo += "<b>Altitude:</b> " + coordinates.altitude + "<br/>";
	
	    clearOutput();
		displayOutput("<p>" + locationInfo + "</p>");
	} 
	catch (e) {
		errorMessage("exception (displayLocationInfo): " + e);
	}
}

/**
 * Display info about the give users proximity to three cities: Toronto, London and Hong Kong
 *
 * @param coords (Coordinates) - geographic information returned from geolocation service
 *      http://dev.w3.org/geo/api/spec-source.html#coordinates
 */
function displayContentForLocation(coordinates)
{
	try
	{
	    var locationSpecificContent = ""; //"<h4>Location-specific info:</h4>";
		
		var latitude = coordinates.latitude;
		var longitude = coordinates.longitude;
		var accuracy = coordinates.accuracy;

		//If a user is within 1km of college, they are assumed to be in Kitchener ON:
		//UofW is located at (43.473274576043096, -80.54450511932373)
		//College is located at (43.846413,-79.376221): (43.39681577710739, -80.40618896484375)

		var college = distanceBetweenPoints(latitude, longitude, 43.39681577710739, -80.40618896484375);
		if (college <= (accuracy + 1000))
		{
		    locationSpecificContent += "<div>You are in Conestoga College, Kitchener, ON.</div>";
		} 
		else {
		    college = (college / 1000).toFixed(2);
		    locationSpecificContent += "<div class=red>You are " + college + " km from Conestoga College, Kitchener, ON.</div>";
		}
		
		displayOutput("<p>" + locationSpecificContent + "</p>");
	} 
	catch (e) {
		errorMessage("exception (displayContentForLocation): " + e);
	}
}

/**
 * Call back function used to process the Position object returned by the Geolocation service
 *
 * @params position (Position) - contains geographic information acquired by the geolocation service.
 *     http://dev.w3.org/geo/api/spec-source.html#position_interface
 */
function geolocationSuccess(position) 
{
	try
	{
		// The Position object contains the following parameters:
		//	coords - geographic information such as location coordinates, 
		//           accuracy, and optional attributes (altitude and speed).
		var coordinates = position.coords;
				
		//Now that we have the geographic information, what are some useful things that can be done with this info?
		
		//1) Display current location information:
		displayLocationInfo(coordinates);
		
		//2) Display content relevant to the users current location:
		//	 Identify whether a user is within range of a given location. This can be done by calculating their 
		//      distance from a known location (within an allowable threshold of accuracy).
		displayContentForLocation(coordinates);
		
		//3) Calculate relative direction to a point of interest
		//displayDirections(coordinates);
		
	} 
	catch (e) {
		errorMessage("exception (geolocationSuccess): " + e);
	}
}

/**
 * Call back function raised by the Geolocation service when an error occurs
 *
 * @param posError (PositionError) - contains the code and message of the error that occurred while retrieving geolocation info.
 *     http://dev.w3.org/geo/api/spec-source.html#position-error
 */
function geolocationError(posError)
{
	try
	{
		if (posError)
		{
			switch(posError.code)
			{
				case posError.TIMEOUT:
					errorMessage("TIMEOUT: " + posError.message);
					break;
				case posError.PERMISSION_DENIED:
					errorMessage("PERMISSION DENIED: " + posError.message);
					break;
				case posError.POSITION_UNAVAILABLE:
					errorMessage("POSITION UNAVAILABLE: " + posError.message);
					break;
				default:
					errorMessage("UNHANDLED MESSAGE CODE (" + posError.code + "): " + posError.message);
					break;
			}
		}
	} 
	catch (e) {
		errorMessage("Exception (geolocationError): " + e);
	}
}

/**
 * Helper methods to display text on the screen
 */
function clearOutput()
{
	var ele = document.getElementById("geolocationInfo");
	if (ele)
	{
		ele.innerHTML = "";
	}
}
function displayOutput(output)
{
	var ele = document.getElementById("geolocationInfo");
	if (ele)
	{
		ele.innerHTML += "<div>" + output + "</div>";
	}
}

function errorMessage(msg)
{
	displayOutput("<span class='red'><b>Error</b>:" + msg + "</span>");
}


