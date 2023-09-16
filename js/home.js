let map, directionsService, directionsRenderer, heatmap;
    let heatmapData = []; // Define an empty array to store heatmap data
    let pos; // Add this variable to store the current location as the origin

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

    // Function to handle Enter key press
    function handleKeyPress(event, buttonId) {
      if (event.keyCode === 13) {
        // Enter key was pressed, trigger the button click
        document.getElementById(buttonId).click();
      }
    }