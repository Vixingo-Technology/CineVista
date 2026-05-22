async function main() {
  const res = await fetch('https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=incategory:"2025_films"&utf8=&format=json&srlimit=1');
  const data = await res.json();
  console.log(data.query.search[0]);
}
main();
