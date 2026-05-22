async function main() {
  const url = 'https://yts.rs/api/v2/list_movies.json?limit=20&page=1';
  try {
     const res = await fetch(url);
     const t = await res.text();
     console.log(t.substring(0, 500));
  } catch (e) { }
}
main();
