import requests
import json

# Define the URL you want to send the POST request to
url = "https://example.com/api/endpoint"

# Define the data you want to send in the POST request
data = {
    "key1": "value1",
    "key2": "value2"
}

# Convert the data to JSON format
json_data = json.dumps(data)

# Define the headers (if needed)
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YourAccessToken"  # Add any required headers
}

# Send the POST request
response = requests.post(url, data=json_data, headers=headers)

# Check the status code of the response
if response.status_code == 200:  # Assuming a successful response has a status code of 200
    # Parse the JSON response
    json_response = response.json()
    print("JSON Response:", json_response)
else:
    print("POST request failed with status code:", response.status_code)
