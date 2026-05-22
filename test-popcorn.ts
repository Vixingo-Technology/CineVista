async function main() {
  const url = `https://tv-v2.api-fetch.website/movies/1`;
  try {
     const res = await fetch(url);
     const data = await res.json();
     console.log(data.length, data[0]);
  } catch(e) { console.log(e.message); }
}
main();
