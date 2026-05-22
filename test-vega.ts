async function main() {
  const url = `https://raw.githubusercontent.com/vega/vega-datasets/master/data/movies.json`;
  try {
     const res = await fetch(url);
     const data = await res.json();
     console.log(data.length, data[0]);
  } catch(e) { console.log(e.message); }
}
main();
