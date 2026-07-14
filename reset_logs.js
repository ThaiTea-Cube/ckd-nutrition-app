const https = require('https');

const FIREBASE_URL = 'https://cdk-p-74443-default-rtdb.asia-southeast1.firebasedatabase.app';

https.get(`${FIREBASE_URL}/users.json`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const users = JSON.parse(data) || {};
    const keys = Object.keys(users);
    if (keys.length === 0) {
      console.log('No users found.');
      return;
    }
    
    let count = 0;
    keys.forEach(key => {
      const req = https.request(`${FIREBASE_URL}/users/${key}/logs.json`, { method: 'DELETE' }, (delRes) => {
        count++;
        if (count === keys.length) console.log('Successfully deleted logs for all users.');
      });
      req.end();
    });
  });
});
