import requests

url = "http://localhost:8000/api/register/"
data = {
    "email": "test_user_debug@example.com",
    "password": "password123",
    "confirm_password": "password123",
    "first_name": "Test",
    "last_name": "User",
    "phone": ""
}
# We need to simulate multipart/form-data as the frontend does (since we use FormData)
# But requests handles files for multipart. If we use data=... it sends x-www-form-urlencoded if no files.
# If we pass empty files dict or just data, requests might send application/x-www-form-urlencoded.
# Frontend sends FormData, which is multipart/form-data.
# So we should use files to force multipart, or specify header? 
# Requests usually calculates boundary if files is present.

# Let's try sending as multipart without files, just fields.
from requests_toolbelt.multipart.encoder import MultipartEncoder

m = MultipartEncoder(fields=data)
headers = {'Content-Type': m.content_type}

response = requests.post(url, data=m, headers=headers)

print(f"Status Code: {response.status_code}")
print(f"Response Body: {response.text}")
