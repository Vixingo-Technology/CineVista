async function main() {
  const url = `https://api.themoviedb.org/3/movie/550?api_key=15d2ea6d0dc1d476efbca3eba2b9bbfb&append_to_response=videos,similar`;
  try {
     const res = await fetch(url);
     const data = await res.json();
     console.log(data.title, data.videos?.results?.[0]?.key);
  } catch(e) {}
}
main();
