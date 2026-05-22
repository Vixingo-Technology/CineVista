async function main() {
  const url = `https://api.tvmaze.com/shows?page=0`;
  try {
     const res = await fetch(url);
     const data = await res.json();
     console.log(data.length, data[0].name, data[0].image?.medium);
  } catch(e) { console.log(e.message); }
}
main();
