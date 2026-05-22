async function main() {
  const url = `https://api.github.com/search/code?q=filename:movies.json+poster_path&per_page=10`;
  try {
     const res = await fetch(url, { headers: { 'User-Agent': 'Node' }});
     const data = await res.json();
     console.log(data.items.map(i => i.html_url));
  } catch (e) {
     console.log(e.message);
  }
}
main();
