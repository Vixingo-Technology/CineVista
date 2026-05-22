async function main() {
  const url = `https://itunes.apple.com/search?term=batman&media=movie&limit=3`;
  try {
     const res = await fetch(url);
     const data = await res.json();
     console.log(data);
  } catch(e) { console.log(e.message); }
}
main();
