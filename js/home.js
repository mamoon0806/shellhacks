let map, directionsService, directionsRenderer, heatmap, airQuality;
let heatmapData = []; // Define an empty array to store heatmap data
let pos; // Add this variable to store the current location as the origin
const TILE_SIZE = 256;
document.getElementById("homeButton").style.pointerEvents = "none"; // Disable links
document.getElementById("aboutButton").style.pointerEvents = "none"; // Disable links

// Set map
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 0, lng: 0 },
    zoom: 14,
    streetViewControl: false,
  });

  // Get geolocation.
  navigator.geolocation.getCurrentPosition(
    (position) => {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      // Create a marker to show the user's current location
      new google.maps.Marker({
        position: pos,
        map: map,
        animation: google.maps.Animation.DROP, // Add a drop animation
      });

      map.setCenter(pos);

      directionsService = new google.maps.DirectionsService();
      directionsRenderer = new google.maps.DirectionsRenderer({ map: map });
    },
    () => {
      handleLocationError(true, map.getCenter());
    }
  );

  // Initialize the heatmap layer
  heatmap = new google.maps.visualization.HeatmapLayer({
    data: heatmapData,
    map: map,
    radius: 9, // Adjust the radius as needed
    opacity: 1.0, // Adjust the opacity as needed
  });


  map.addListener("zoom_changed", () => {
    center = new google.maps.LatLng(map.getCenter().lat(), map.getCenter().lng());
    console.log(getTileCoordinate(center, map.getZoom()));
  });

  const coordMapType = new CoordMapType(new google.maps.Size(256, 256));
  map.overlayMapTypes.insertAt(0, coordMapType);

}

async function getPollutionData(latlng) {

  let url = "https://airquality.googleapis.com/v1/currentConditions:lookup?key=AIzaSyDxn11dlm134OPDCeb18AgK5B-rjlQ7msg";
  let latitude = latlng.lat();
  let longitude = latlng.lng();

  let data = {
    "universal_aqi": true,
    "location": {
      "latitude": latitude,
      "longitude": longitude
    },
    "extra_computations": [
      "HEALTH_RECOMMENDATIONS",
      "DOMINANT_POLLUTANT_CONCENTRATION",
      "POLLUTANT_CONCENTRATION",  
      "LOCAL_AQI",
      "POLLUTANT_ADDITIONAL_INFO"
    ],
    "language_code": "en"
  };

  let options = {
    method: 'POST',
    body: JSON.stringify(data)
  };

  const response = await fetch(url, options)
  const pollutionJSON = await response.json();

  return await pollutionJSON;
}

function calculateAndDisplayRoute() {
  const destination = document.getElementById('destination').value;
  const originInput = document.getElementById('fromDestinationTxtBox');
  const originAddress = originInput.value;

  if (!destination) {
    alert('Please enter a destination address.');
    return;
  }

  let origin;

  if (originAddress === '' || originAddress === 'Current Location') {
    // If fromDestinationTxtBox is empty or contains "Current Location", use current location as origin
    origin = pos;

    const request = {
      origin: origin,
      destination: destination,
      travelMode: 'WALKING',
    };

    directionsService.route(request, (result, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
        const route = result.routes[0].legs[0];
        const path = route.steps.flatMap((step) => {
          return google.maps.geometry.encoding.decodePath(step.polyline.points);
        });

        // Convert the path points to LatLng objects and add them to heatmapData
        heatmapData = path.map((point) => {
          return new google.maps.LatLng(point.lat(), point.lng());
        });

        // Set the new heatmap data
        heatmap.setData(heatmapData);

        // Calculate the route distance and set the heatmap radius
        const routeDistance = result.routes[0].legs[0].distance.value;
        const heatmapRadius = Math.min(50, Math.max(10, routeDistance / 100));

        // Convert the path points to LatLng objects and add them to heatmapData
        heatmapData = path.map((point) => {
          return new google.maps.LatLng(point.lat(), point.lng());
        });

        let pollutionJSON = getPollutionData(heatmapData[0]);

            let avgScore = 0;
            let pollutionArr = [];

            pollutionJSON.then((result) => {
              console.log(result);

              const pollutionScore = result.indexes[0].aqi;
              const categoryOrigin = result.indexes[0].category;
              const dominantPollutantOrigin = result.indexes[0].dominantPollutant;
              const dominantPollutionConcentrationValueOrigin = result.pollutants.find(pollutants => pollutants.code === dominantPollutantOrigin).concentration.value;
              const dominantPollutionConcentrationUnitsOrigin = result.pollutants.find(pollutants => pollutants.code === dominantPollutantOrigin).concentration.units;
              const dominantPollutionSourcesOrigin = result.pollutants.find(pollutants => pollutants.code === dominantPollutantOrigin).additionalInfo.sources
              const dominantPollutionEffectsOrigin = result.pollutants.find(pollutants => pollutants.code === dominantPollutantOrigin).additionalInfo.effects
              const healthRecsOrigin = result.healthRecommendations.generalPopulation

              const pollutionOrigin = {
                pollutionScore: pollutionScore,
                category: categoryOrigin,
                dominantPollutant: dominantPollutantOrigin,
                dominantPollutionConcentrationValue: dominantPollutionConcentrationValueOrigin,
                dominantPollutionConcentrationUnits: dominantPollutionConcentrationUnitsOrigin,
                dominantPollutionSources: dominantPollutionSourcesOrigin,
                dominantPollutionEffects: dominantPollutionEffectsOrigin,
                healthRecs: healthRecsOrigin
              };

              return pollutionOrigin;
            })
            .then((data) => {
              pollutionJSON = getPollutionData(heatmapData[heatmapData.length - 1]);
              pollutionArr.push(data);

              pollutionJSON.then((result) => {
                console.log(result);

                const pollutionScoreDest = result.indexes[0].aqi;
                const categoryDest = result.indexes[0].category;
                const dominantPollutantDest = result.indexes[0].dominantPollutant;
                const dominantPollutionConcentrationValueDest = result.pollutants.find(pollutants => pollutants.code === dominantPollutantDest).concentration.value;
                const dominantPollutionConcentrationUnitsDest = result.pollutants.find(pollutants => pollutants.code === dominantPollutantDest).concentration.units;
                const dominantPollutionSourcesDest = result.pollutants.find(pollutants => pollutants.code === dominantPollutantDest).additionalInfo.sources
                const dominantPollutionEffectsDest = result.pollutants.find(pollutants => pollutants.code === dominantPollutantDest).additionalInfo.effects
                const healthRecsDest = result.healthRecommendations.generalPopulation;

                const pollutionDest = {
                  pollutionScore: pollutionScoreDest,
                  category: categoryDest,
                  dominantPollutant: dominantPollutantDest,
                  dominantPollutionConcentrationValue: dominantPollutionConcentrationValueDest,
                  dominantPollutionConcentrationUnits: dominantPollutionConcentrationUnitsDest,
                  dominantPollutionSources: dominantPollutionSourcesDest,
                  dominantPollutionEffects: dominantPollutionEffectsDest,
                  healthRecs: healthRecsDest
                };

                pollutionArr.push(pollutionDest);
                console.log(pollutionArr[0].pollutionScore + " " + pollutionArr[1].pollutionScore);

                avgScore = (pollutionArr[0].pollutionScore + pollutionArr[1].pollutionScore) / 2;
                console.log(avgScore);

                let div = document.createElement("div");
                div.id = "tripMetadata";
                div.style.width = "1000px";
                div.style.height = "120px";
                div.style.padding = "0px 200px"
                div.style.position = "relative";
                div.innerHTML = "Average AQI for this trip: " + avgScore;

                let parent = document.getElementById("tripdata");
                if(document.getElementById("tripMetadata") === null) {
                  parent.appendChild(div);
                }
              });
            })

        // Set the new heatmap data
        heatmap.setData(heatmapData);
      } else {
        alert('Error: ' + status);
      }
    });
  } else {
    // Use the Geocoding service to convert the origin address to coordinates
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: originAddress }, (results, status) => {
      if (status === 'OK' && results.length > 0) {
        const originLocation = results[0].geometry.location;

        const request = {
          origin: originLocation,
          destination: destination,
          travelMode: 'WALKING',
        };

        directionsService.route(request, (result, status) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);
            const route = result.routes[0].legs[0];
            const path = route.steps.flatMap((step) => {
              return google.maps.geometry.encoding.decodePath(step.polyline.points);
            });

            // Convert the path points to LatLng objects and add them to heatmapData
            heatmapData = path.map((point) => {
              return new google.maps.LatLng(point.lat(), point.lng());
            });

            // Set the new heatmap data
            heatmap.setData(heatmapData);

            

            // Calculate the route distance and set the heatmap radius
            const routeDistance = result.routes[0].legs[0].distance.value;
            const heatmapRadius = Math.min(50, Math.max(10, routeDistance / 100));
          } else {
            alert('Error: ' + status);
          }
        });
      } else {
        alert('Geocoding error: ' + status);
      }
    });
  }
}

function calculateRoute(origin, destination) {
  const request = {
    origin: origin,
    destination: destination,
    travelMode: 'WALKING' // You can change the travel mode as needed
  };

  directionsService.route(request, (result, status) => {
    if (status === 'OK') {
      directionsRenderer.setDirections(result);
    } else {
      alert('Error: ' + status);
    }
  });
}

function getTileCoordinate(latLng, zoom) {
  const scale = 1 << zoom;
  const worldCoordinate = project(latLng);

  const tileCoordinate = new google.maps.Point(
    Math.floor((worldCoordinate.x * scale) / TILE_SIZE),
    Math.floor((worldCoordinate.y * scale) / TILE_SIZE),
  );

  return tileCoordinate;

}

function project(latLng) {
  let siny = Math.sin((latLng.lat() * Math.PI) / 180);

  // Truncating to 0.9999 effectively limits latitude to 89.189. This is
  // about a third of a tile past the edge of the world tile.
  siny = Math.min(Math.max(siny, -0.9999), 0.9999);
  return new google.maps.Point(
    TILE_SIZE * (0.5 + latLng.lng() / 360),
    TILE_SIZE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)),
  );
}


// Function to handle Enter key press
function handleKeyPress(event, buttonId) {
  if (event.keyCode === 13) {
    // Enter key was pressed, trigger the button click
    document.getElementById(buttonId).click();
  }
}

// Function to move the indicator arrow based on airQuality
function moveIndicator(airQuality) {
  const indicatorArrow = document.querySelector('.indicator-arrow');

  // Check the airQuality variable and set the appropriate horizontal position
  if (airQuality === 'Good') {
    // Move 40 pixels to the right
    indicatorArrow.style.transform = 'translateX(490px)';
  } else if (airQuality === 'Bad') {
    // Move 40 pixels to the left
    indicatorArrow.style.transform = 'translateX(-490px)';
  } else {
    // Handle other cases or defaults here
    console.log('Invalid airQuality value');
  }
}

function project(latLng) {
  let siny = Math.sin((latLng.lat() * Math.PI) / 180);

  // Truncating to 0.9999 effectively limits latitude to 89.189. This is
  // about a third of a tile past the edge of the world tile.
  siny = Math.min(Math.max(siny, -0.9999), 0.9999);
  return new google.maps.Point(
    TILE_SIZE * (0.5 + latLng.lng() / 360),
    TILE_SIZE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)),
  );
}

// Function to handle Enter key press
function handleKeyPress(event, buttonId) {
  if (event.keyCode === 13) {
    // Enter key was pressed, trigger the button click
    document.getElementById(buttonId).click();
  }
}

class CoordMapType {
  tileSize;
  maxZoom = 16;
  minZoom = 0;
  projection = null;
  radius = 6378137;
  constructor(tileSize) {
    this.tileSize = tileSize;
  }
  getTile(coord, zoom, ownerDocument) {
    const div = ownerDocument.createElement("div");
    div.style.position = "relative";
    div.style.width = this.tileSize.width + "px";
    div.style.height = this.tileSize.height + "px";
    div.style.borderStyle = "solid";
    div.style.borderWidth = "1px";
    div.style.borderColor = "#AAAAAA";

    var imgElement = new Image();
    imgElement.style.width = this.tileSize.width + "px";
    imgElement.style.height = this.tileSize.height + "px";
    imgElement.style.position = 'absolute';
    imgElement.style.zIndex = '2';
    imgElement.style.opacity = '.2';

    try {
      imgElement.src = `https://airquality.googleapis.com/v1/mapTypes/US_AQI/heatmapTiles/${zoom}/${coord.x}/${coord.y}?key=AIzaSyDxn11dlm134OPDCeb18AgK5B-rjlQ7msg`;
      console.log(imgElement.src);
      console.log("hi");
      div.appendChild(imgElement);

    } catch (err) {
      console.log("Error" + err);
    }

    return div;
  }

  releaseTile(tile) { }

}