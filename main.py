import requests as request

req = request.get("https://www.google.com").content

print(req)
