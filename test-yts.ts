async function main() {
  const urls = [
    'https://yts.mx/api/v2/list_movies.json?limit=1',
    'https://yts.rs/api/v2/list_movies.json?limit=1',
    'https://yts.do/api/v2/list_movies.json?limit=1',
    'https://yifysubtitles.org/api/v2/list_movies.json?limit=1',
    'https://yts.torrentbay.to/api/v2/list_movies.json?limit=1'
  ];
  for (const u of urls) {
     try {
       const res = await fetch(u);
       const t = await res.text();
       console.log(u, res.status, t.substring(0, 50));
     } catch (e) {
       console.log(u, e.message);
     }
  }
}
main();
