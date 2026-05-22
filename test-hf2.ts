async function main() {
  const url = `https://huggingface.co/api/datasets?search=tmdb`;
  try {
     const res = await fetch(url);
     const data = await res.json();
     console.log(data.slice(0, 5).map(d => d.id));
  } catch(e) { console.log(e.message); }
}
main();
