async function main() {
  const url = `https://api.codetabs.com/v1/proxy?quest=https://yts.mx/api/v2/list_movies.json?limit=1`;
  try {
     const res = await fetch(url);
     const text = await res.text();
     console.log(text.substring(0, 50));
  } catch(e) { console.log(e.message); }
}
main();
