async function search() {
  const url = `https://api.github.com/repos/nameisjayant/Android-MVVM-with-Room-Database-and-Paging-Movies-List-Details-Application/contents/`;
  const options = { headers: { 'User-Agent': 'Node.js' } };
  const res = await fetch(url, options);
  const data = await res.json();
  console.log(data);
}
search();
