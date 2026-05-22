async function main() {
  try {
    const res = await fetch('https://yts.torrentbay.to/api/v2/list_movies.json?limit=1');
    const data = await res.json();
    console.log(data.data.movies[0].title);
  } catch(e) {
    console.log(e.message);
  }
}
main();
