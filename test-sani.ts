async function main() {
  const url = `https://raw.githubusercontent.com/saniyusuf/code-tests/master/data/movies.json`;
  try {
     const res = await fetch(url);
     const data = await res.json();
     console.log(data.length);
  } catch(e) {}
}
main();
