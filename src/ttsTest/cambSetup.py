import requests

files = {'file': open('../../assets/Gordon_Raw.mp3', 'rb')}
data = {
    'voice_name': 'Gordon Ramsay',
    'gender': 1,
    'age': 58
}
response = requests.post(
    "https://client.camb.ai/apis/create-custom-voice",
    files=files,
    data=data,
    headers={
        "x-api-key": "5a69767e-e7dc-4928-9a7a-6b45963bdc8e"
    }
)
print(response.json())