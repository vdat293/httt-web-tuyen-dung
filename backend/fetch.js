const https = require('https');
https.get('https://www.topcv.vn', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const regex = /<img[^>]+src=["']([^"']+)["']/g;
    let match;
    while ((match = regex.exec(data)) !== null) {
      if (match[1].includes('.png') || match[1].includes('.jpg')) {
        console.log(match[1]);
      }
    }
  });
});
