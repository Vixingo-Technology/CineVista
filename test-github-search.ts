async function search() {
  const q = 'movies json tmdb poster url size:>50000';
  const url = `https://api.github.com/search/code?q=${encodeURIComponent(q)}`;
  const options = { headers: { 'User-Agent': 'Node.js' } };
  const res = await fetch(url, options);
  const data = await res.json();
  console.log(data.items?.slice(0, 3).map(i => i.html_url));
}
search();
