import urllib.request
import json
import ssl

context = ssl._create_unverified_context()

FIREBASE_URL = 'https://cdk-p-74443-default-rtdb.asia-southeast1.firebasedatabase.app/users.json'

try:
    response = urllib.request.urlopen(FIREBASE_URL, context=context)
    data = json.loads(response.read().decode('utf-8'))
    
    if data:
        for key in data.keys():
            del_url = f'https://cdk-p-74443-default-rtdb.asia-southeast1.firebasedatabase.app/users/{key}/logs.json'
            req = urllib.request.Request(del_url, method='DELETE')
            urllib.request.urlopen(req, context=context)
            print(f'Deleted logs for {key}')
        print('All logs cleared successfully.')
    else:
        print('No users found.')
except Exception as e:
    print('Error:', e)
