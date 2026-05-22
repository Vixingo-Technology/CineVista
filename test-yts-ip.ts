async function main() {
  const url = `http://104.21.29.93/api/v2/list_movies.json?limit=1`;
  try {
     const res = await fetch(url, { headers: { 'Host': 'yts.mx' } });
     const data = await res.json();
     console.log(data.data.movies[0].title);
  } catch(e) { console.log(e.message); }
}
main();
