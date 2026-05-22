async function main() {
  const url = `https://datasets-server.huggingface.co/rows?dataset=${encodeURIComponent('AiresPucrs/tmdb-5000-movies')}&config=default&split=train&offset=0&length=1`;
  try {
     const res = await fetch(url);
     const text = await res.text();
     const data = JSON.parse(text);
     console.log(data?.rows[0]?.row);
  } catch(e) { console.log(e.message); }
}
main();
