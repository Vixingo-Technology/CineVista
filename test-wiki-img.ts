async function main() {
  const res = await fetch('https://en.wikipedia.org/w/api.php?action=query&titles=Avatar:_Fire_and_Ash&prop=pageimages&format=json&pithumbsize=500');
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
main();
