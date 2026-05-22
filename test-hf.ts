async function main() {
  const url = `https://datasets-server.huggingface.co/rows?dataset=papluca%2Ftmdb-movies&config=default&split=train&offset=0&length=10`;
  try {
     const res = await fetch(url);
     const text = await res.text();
     console.log(text.substring(0, 200));
  } catch(e) { console.log(e.message); }
}
main();
