import requests
import json
from io import BytesIO
from PIL import Image
import numpy as np
import base64

# Define the URL you want to send the POST request to
API_KEY = 'AIzaSyDxn11dlm134OPDCeb18AgK5B-rjlQ7msg'

mapType = 'US_AQI'
zoom = 0
x = 0
y = 0

url = f"https://airquality.googleapis.com/v1/mapTypes/{mapType}/heatmapTiles/{zoom}/{x}/{y}?key={API_KEY}"

print(url)

# Define the data you want to send in the POST request
data = {
  "universal_aqi": True,
  "location": {
    "latitude": 37.419734,
    "longitude": -122.0827784
  },
  "extra_computations": [
    "HEALTH_RECOMMENDATIONS",
    "DOMINANT_POLLUTANT_CONCENTRATION",
    "POLLUTANT_CONCENTRATION",
    "LOCAL_AQI",
    "POLLUTANT_ADDITIONAL_INFO"
  ],
  "language_code": "en"
}

# Convert the data to JSON format
json_data = json.dumps(data)

# Send the POST request
response = requests.get(url)
array = list(response.content)
print(array)



# Check the status code of the response
if response.status_code == 200:  # Assuming a successful response has a status code of 200
    # Parse the JSON response
    json_response = response.json()
else:
    print("POST request failed with status code:", response.status_code)
