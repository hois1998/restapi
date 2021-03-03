let str1 = process.argv[2];
let str2 = process.argv[3];

function compare(s1, s2) {
  if (s1 === s2) {
    console.log('same strings');
  } else {
    console.log('different strings');
  }
}
