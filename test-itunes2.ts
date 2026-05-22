import https from 'node:https';

function fetchItunes() {
  https.get('https://itunes.apple.com/search?term=star+wars&media=movie&limit=5', (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => console.log(JSON.parse(data).resultCount));
  });
}
fetchItunes();
