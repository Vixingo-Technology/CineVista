async function main() {
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=15d2ea6d0dc1d476efbca3eba2b9bbfb`;
  try {
     const res = await fetch(url);
     const data = await res.json();
     console.log(data?.results?.length);
     console.log(data?.results?.[0]?.title);
  } catch(e) {}
}
main();
