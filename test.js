const parser = require("./parser.js");

console.log(parser("<34>Oct 11 caca mymachine su: 'su root' failed for lonvick on /dev/pts/8"));
console.log(parser("<34>1 2003-10-11T22:14:15.003Z mymachine.example.com su - ID47 - BOM'su root' failed for lonvick on /dev/pts/8"));
