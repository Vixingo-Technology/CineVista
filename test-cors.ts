async function main() {
  const url = `https://corsproxy.io/?https://yts.mx/api/v2/list_movies.json?limit=1`;
  try {
     const res = await fetch(url);
     const text = await res.text();
     console.log(text.substring(0, 200));
  } catch(e) { console.log(e.message); }
}
main();
