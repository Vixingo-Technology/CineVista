async function main() {
  const res = await fetch('https://raw.githubusercontent.com/mebjas/html5-qrcode/master/package.json');
  console.log(res.status);
}
main();
