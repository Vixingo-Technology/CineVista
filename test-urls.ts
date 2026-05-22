async function main() {
  const urls = [
    'https://raw.githubusercontent.com/theapache64/top250/master/top250_min.json',
    'https://raw.githubusercontent.com/hjorturlarsen/IMDB-top-100/master/data/movies.json',
    'https://raw.githubusercontent.com/brianary/imdb-top-250/master/top250.json',
  ];
  for (const u of urls) {
     try {
       const res = await fetch(u);
       if(res.ok) {
           const data = await res.json();
           console.log(u, data.length || 0);
       }
     } catch (e) {
       // ignored
     }
  }
}
main();
